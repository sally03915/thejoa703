---
```
package com.thejoa703.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * ✅ 테스트/일반 환경용 PasswordEncoder 빈 등록
 */
@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}


```

--- 
```java
package com.thejoa703.util;

import java.io.IOException;
import java.nio.file.*;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * 파일 저장 서비스
 * - 업로드된 파일을 로컬 uploads 폴더에 저장
 */
@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");

    public String upload(MultipartFile file) {
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = root.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }
}

```

```java
package com.thejoa703.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.thejoa703.dto.request.UserRequestDto;
import com.thejoa703.dto.request.LoginRequest;
import com.thejoa703.dto.response.UserResponseDto;
import com.thejoa703.entity.AppUser;
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.util.FileStorageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PROFILE_IMAGE = "uploads/default.png";

    // ✅ Create: 회원가입
    public UserResponseDto signup(UserRequestDto request, MultipartFile profileImage) {
        String provider = request.getProvider() != null ? request.getProvider() : "local";

        if (appUserRepository.findByEmailAndProvider(request.getEmail(), provider).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사용자입니다.");
        }

        if (appUserRepository.countByNickname(request.getNickname()) > 0) {
            throw new IllegalArgumentException("이미 사용중인 닉네임입니다.");
        }

        AppUser user = new AppUser();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setProvider(provider);
        user.setRole("ROLE_USER");
        user.setUfile(profileImage != null && !profileImage.isEmpty()
                ? fileStorageService.upload(profileImage)
                : DEFAULT_PROFILE_IMAGE);

        return UserResponseDto.fromEntity(appUserRepository.save(user));
    }

    // ✅ Read: 로그인
    public UserResponseDto login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmailAndProvider(
                request.getEmail(),
                request.getProvider() != null ? request.getProvider() : "local"
        ).orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }
        return UserResponseDto.fromEntity(user);
    }

    // ✅ Read: 사용자 조회 by email+provider
    public Optional<AppUser> findByEmailAndProvider(String email, String provider) {
        return appUserRepository.findByEmailAndProvider(email, provider);
    }

    // ✅ Read: 사용자 조회 by ID (추가)
    public UserResponseDto findById(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        return UserResponseDto.fromEntity(user);
    }

    // ✅ Update: 닉네임 변경
    public UserResponseDto updateNickname(Long userId, String newNickname) {
        if (appUserRepository.countByNickname(newNickname) > 0) {
            throw new IllegalArgumentException("이미 사용중인 닉네임입니다.");
        }
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        user.setNickname(newNickname);
        return UserResponseDto.fromEntity(appUserRepository.save(user));
    }

    // ✅ Update: 프로필 이미지 변경
    public UserResponseDto updateProfileImage(Long userId, MultipartFile profileImage) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        user.setUfile(profileImage != null && !profileImage.isEmpty()
                ? fileStorageService.upload(profileImage)
                : DEFAULT_PROFILE_IMAGE);
        return UserResponseDto.fromEntity(appUserRepository.save(user));
    }

	//    // ✅ Delete: soft delete
	//    public void deleteByEmail(String email) {
	//        AppUser user = appUserRepository.findByEmailAndProvider(email, "local")
	//                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
	//        user.setDeleted(true);
	//        appUserRepository.save(user);
	//    }
    
    // ✅ 신규: ID로 삭제
    public void deleteById(Long userId) { appUserRepository.deleteById(userId); }

    // ✅ Count: 전체 사용자 수
    public long countUsers() {
        return appUserRepository.count();
    }

    // ✅ 이메일 중복 여부 확인
    public boolean existsByEmail(String email) {
        return appUserRepository.countByEmail(email) > 0;
    }

    // ✅ 닉네임 중복 여부 확인
    public boolean existsByNickname(String nickname) {
        return appUserRepository.countByNickname(nickname) > 0;
    }

    // ✅ 소셜 사용자 저장
    public AppUser saveSocialUser(String email,
                                  String provider,
                                  String providerId,
                                  String nickname,
                                  String image) {
        AppUser user = AppUser.builder()
                .email(email)
                .provider(provider)
                .providerId(providerId)
                .nickname(nickname)
                .ufile(image)
                .role("ROLE_USER")
                .build();
        return appUserRepository.save(user);
    }

    // ✅ 권한 조회
    public String findRoleByUserId(Long userId) {
        return appUserRepository.findById(userId)
                .map(AppUser::getRole)
                .orElse("ROLE_USER");
    }
}

```
 
 
```java
package com.thejoa703.service;

import java.util.List; // ✅ List 사용
import java.util.stream.Collectors; // ✅ Stream API 사용

import org.springframework.stereotype.Service; // ✅ Service 어노테이션
import org.springframework.transaction.annotation.Transactional; // ✅ 트랜잭션 관리

import com.thejoa703.dto.request.CommentRequestDto; // ✅ 댓글 요청 DTO
import com.thejoa703.dto.response.CommentResponseDto; // ✅ 댓글 응답 DTO
import com.thejoa703.entity.AppUser; // ✅ 사용자 엔티티
import com.thejoa703.entity.Comment; // ✅ 댓글 엔티티
import com.thejoa703.entity.Post; // ✅ 게시글 엔티티
import com.thejoa703.repository.AppUserRepository; // ✅ 사용자 레포지토리
import com.thejoa703.repository.CommentRepository; // ✅ 댓글 레포지토리
import com.thejoa703.repository.PostRepository; // ✅ 게시글 레포지토리

import lombok.RequiredArgsConstructor; // ✅ 생성자 주입

/**
 * 댓글 서비스
 * - 생성(Create), 조회(Read), 수정(Update), 삭제(Delete), 카운트(Count)
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository; // ✅ 댓글 레포지토리
    private final AppUserRepository userRepository; // ✅ 사용자 레포지토리
    private final PostRepository postRepository; // ✅ 게시글 레포지토리

    // ✅ Create: 댓글 작성
    public CommentResponseDto createComment(Long userId, CommentRequestDto dto) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음")); // 사용자 조회
        Post post = postRepository.findById(dto.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음")); // 게시글 조회

        Comment comment = new Comment();
        comment.setContent(dto.getContent()); // 댓글 내용 설정
        comment.setUser(user); // 작성자 설정
        comment.setPost(post); // 게시글 설정

        Comment saved = commentRepository.save(comment); // DB 저장

        return CommentResponseDto.builder()
                .id(saved.getId())
                .content(saved.getContent())
                .authorNickname(user.getNickname())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // ✅ Read: 특정 게시글 댓글 조회
    public List<CommentResponseDto> getCommentsByPost(Long postId) {
        return commentRepository.findByPostIdAndDeletedFalse(postId).stream()
                .map(c -> CommentResponseDto.builder()
                        .id(c.getId())
                        .content(c.getContent())
                        .authorNickname(c.getUser().getNickname())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ✅ Update: 댓글 수정
    public CommentResponseDto updateComment(Long userId, Long commentId, CommentRequestDto dto) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글 없음")); // 댓글 조회

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한 없음"); // 작성자 본인 확인
        }

        comment.setContent(dto.getContent()); // 댓글 내용 수정

        commentRepository.save(comment); // ✅ 변경: save() 호출하여 updatedAt 반영

        return CommentResponseDto.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorNickname(comment.getUser().getNickname())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    // ✅ Delete: 댓글 삭제 (소프트 삭제)
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글 없음")); // 댓글 조회

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한 없음"); // 작성자 본인 확인
        }

        comment.setDeleted(true); // 삭제 플래그 설정
        commentRepository.save(comment); // DB 반영
    }

    // ✅ Count: 특정 게시글 댓글 수 집계
    public long countComments(Long postId) {
        return commentRepository.countByPostIdAndDeletedFalse(postId); // 삭제되지 않은 댓글만 카운트
    }
}

```


```java
// src/main/java/com/thejoa703/service/FollowService.java
package com.thejoa703.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thejoa703.dto.request.FollowRequestDto;
import com.thejoa703.dto.response.FollowResponseDto;
import com.thejoa703.dto.response.BlockResponseDto;
import com.thejoa703.entity.AppUser;
import com.thejoa703.entity.Follow;
import com.thejoa703.entity.Block;
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.repository.BlockRepository;
import com.thejoa703.repository.FollowRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FollowService {

    private final FollowRepository followRepository;
    private final BlockRepository blockRepository;
    private final AppUserRepository userRepository;

    // ✅ Follow
    public FollowResponseDto follow(Long followerId, FollowRequestDto dto) {
        Long followeeId = dto.getFolloweeId();
        if (followerId.equals(followeeId)) {
            throw new IllegalStateException("자기 자신은 팔로우할 수 없습니다.");
        }

        AppUser follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("팔로워 없음"));
        AppUser followee = userRepository.findById(followeeId)
                .orElseThrow(() -> new IllegalArgumentException("팔로잉 대상 없음"));

        if (blockRepository.countByBlocker_IdAndBlockedUser_Id(followerId, followeeId) > 0) {
            throw new IllegalStateException("차단 중인 사용자입니다.");
        }
        if (blockRepository.countByBlocker_IdAndBlockedUser_Id(followeeId, followerId) > 0) {
            throw new IllegalStateException("상대가 나를 차단하여 팔로우할 수 없습니다.");
        }

        Follow existing = followRepository.findByFollower_IdAndFollowee_Id(followerId, followeeId).orElse(null);
        if (existing != null) {
            boolean blocked = blockRepository.countByBlocker_IdAndBlockedUser_Id(followerId, followeeId) > 0;
            return FollowResponseDto.of(existing, followee, blocked);
        }

        Follow saved = followRepository.save(new Follow(follower, followee));
        return FollowResponseDto.of(saved, followee, false);
    }

    // ✅ Unfollow
    public Long unfollow(Long followerId, Long followeeId) {
        followRepository.findByFollower_IdAndFollowee_Id(followerId, followeeId)
            .ifPresent(followRepository::delete);
        return followeeId;
    }

    // ✅ Block
    public BlockResponseDto block(Long blockerId, Long targetUserId) {
        AppUser blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new IllegalArgumentException("차단자 없음"));
        AppUser target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("대상 사용자 없음"));

        if (blockRepository.countByBlocker_IdAndBlockedUser_Id(blockerId, targetUserId) == 0) {
            blockRepository.save(new Block(blocker, target));
        }

        followRepository.findByFollower_IdAndFollowee_Id(blockerId, targetUserId)
            .ifPresent(followRepository::delete);
        followRepository.findByFollower_IdAndFollowee_Id(targetUserId, blockerId)
            .ifPresent(followRepository::delete);

        return new BlockResponseDto(blockerId, targetUserId, true);
    }

    // ✅ Unblock
    public BlockResponseDto unblock(Long blockerId, Long targetUserId) {
        blockRepository.findByBlocker_IdAndBlockedUser_Id(blockerId, targetUserId)
            .ifPresent(blockRepository::delete);
        return new BlockResponseDto(blockerId, targetUserId, false);
    }

    // ✅ Followings 조회 (blocked 포함)
    @Transactional(readOnly = true)
    public List<FollowResponseDto> getFollowings(Long followerId) {
        return followRepository.findByFollower_Id(followerId).stream()
            .map(f -> {
                boolean blocked = blockRepository.countByBlocker_IdAndBlockedUser_Id(followerId, f.getFollowee().getId()) > 0;
                return FollowResponseDto.of(f, f.getFollowee(), blocked);
            })
            .collect(Collectors.toList());
    }

    // ✅ Followers 조회 (blocked 포함)
    @Transactional(readOnly = true)
    public List<FollowResponseDto> getFollowers(Long followeeId) {
        return followRepository.findByFollowee_Id(followeeId).stream()
            .map(f -> {
                boolean blocked = blockRepository.countByBlocker_IdAndBlockedUser_Id(followeeId, f.getFollower().getId()) > 0;
                return FollowResponseDto.of(f, f.getFollower(), blocked);
            })
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countFollowings(Long followerId) {
        return getFollowings(followerId).size();
    }

    @Transactional(readOnly = true)
    public long countFollowers(Long followeeId) {
        return getFollowers(followeeId).size();
    }
}

```


```java
package com.thejoa703.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thejoa703.dto.request.LikeRequestDto;
import com.thejoa703.dto.response.LikeResponseDto;
import com.thejoa703.entity.AppUser;
import com.thejoa703.entity.Post;
import com.thejoa703.entity.PostLike;
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.repository.PostLikeRepository;
import com.thejoa703.repository.PostRepository;

import lombok.RequiredArgsConstructor;

/**
 * 좋아요 서비스
 * - 좋아요 추가, 취소, 카운트, 여부 확인
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final AppUserRepository userRepository;
    private final PostRepository postRepository;

 // ✅ Create: 좋아요 추가
    public LikeResponseDto addLike(Long userId, LikeRequestDto dto) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        Post post = postRepository.findById(dto.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        // ✅ 중복 좋아요 방지
        if (postLikeRepository.countByUser_IdAndPost_Id(userId, dto.getPostId()) > 0) {
            // ❌ 기존: throw new IllegalStateException("이미 좋아요한 게시글입니다.");
            // ✅ 수정: 그냥 현재 좋아요 수 반환
            long count = postLikeRepository.countByPost_Id(post.getId());
            return LikeResponseDto.builder()
                    .postId(post.getId())
                    .count(count)
                    .build();
        }

        postLikeRepository.save(new PostLike(user, post));

        // ✅ 저장 후 최신 좋아요 수 반환
        long count = postLikeRepository.countByPost_Id(post.getId());
        return LikeResponseDto.builder()
                .postId(post.getId())
                .count(count)
                .build();
    }


    // ✅ Read: 특정 게시글의 좋아요 수
    @Transactional(readOnly = true)
    public long countLikes(Long postId) {
        return postLikeRepository.countByPost_Id(postId); // ✅ 바뀐 부분
    }

    // ✅ Read: 특정 유저가 특정 게시글에 좋아요 했는지 여부
    @Transactional(readOnly = true)
    public boolean hasLiked(Long userId, Long postId) {
        return postLikeRepository.countByUser_IdAndPost_Id(userId, postId) > 0; // ✅ 바뀐 부분
    }

    // ✅ Delete: 좋아요 취소
    public LikeResponseDto removeLike(Long userId, Long postId) {
        postLikeRepository.deleteByUserAndPost(userId, postId); // ✅ 바뀐 부분

        // ✅ 삭제 후 최신 좋아요 수 반환
        long updatedCount = postLikeRepository.countByPost_Id(postId); // ✅ 바뀐 부분
        return LikeResponseDto.builder()
                .postId(postId)
                .count(updatedCount)
                .build();
    }
}

```


```java
package com.thejoa703.service;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.thejoa703.dto.request.PostRequestDto;
import com.thejoa703.dto.response.PostResponseDto;
import com.thejoa703.entity.AppUser;
import com.thejoa703.entity.Hashtag;
import com.thejoa703.entity.Image;
import com.thejoa703.entity.Post;
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.repository.HashtagRepository;
import com.thejoa703.repository.PostRepository;
import com.thejoa703.repository.RetweetRepository; // ✅ 리트윗 레포지토리 추가
import com.thejoa703.util.FileStorageService;

import lombok.RequiredArgsConstructor;

/**
 * 게시글 서비스
 * - 게시글 작성(Create), 조회(Read), 수정(Update), 삭제(Delete)
 * - 페이징 조회 및 해시태그 검색 지원
 * - 리트윗 수 포함
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final AppUserRepository userRepository;
    private final HashtagRepository hashtagRepository;
    private final FileStorageService fileStorageService;
    private final RetweetRepository retweetRepository; // ✅ 변경: 리트윗 레포지토리 주입

    // ✅ Create: 게시글 작성
    public PostResponseDto createPost(Long userId, PostRequestDto dto, List<MultipartFile> files) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Post post = new Post();
        post.setContent(dto.getContent());
        post.setUser(user);

        // ✅ 이미지 업로드 처리
        if (files != null && !files.isEmpty()) {
            files.forEach(file -> {
                String url = fileStorageService.upload(file);
                Image image = new Image();
                image.setSrc(url);
                image.setPost(post);
                post.getImages().add(image);
            });
        }

        // ✅ 해시태그 처리
        if (dto.getHashtags() != null && !dto.getHashtags().isEmpty()) {
            Set<String> distinctTags = Arrays.stream(dto.getHashtags().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());

            distinctTags.forEach(tagStr -> {
                String normalized = tagStr.startsWith("#") ? tagStr.substring(1) : tagStr;
                Hashtag tag = hashtagRepository.findByName(normalized)
                        .orElseGet(() -> {
                            Hashtag newTag = new Hashtag();
                            newTag.setName(normalized);
                            return hashtagRepository.save(newTag);
                        });
                post.getHashtags().add(tag);
            });
        }

        Post saved = postRepository.save(post);
        PostResponseDto dtoResponse = PostResponseDto.from(saved);
        dtoResponse.setRetweetCount(retweetRepository.countByOriginalPostId(saved.getId())); // ✅ 리트윗 수 포함
        return dtoResponse;
    }

    // ✅ Read: 단일 게시글 조회
    @Transactional(readOnly = true)
    public PostResponseDto getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        PostResponseDto dto = PostResponseDto.from(post);
        dto.setRetweetCount(retweetRepository.countByOriginalPostId(post.getId())); // ✅ 리트윗 수 포함
        return dto;
    }

    // ✅ Read: 전체 게시글 조회
    @Transactional(readOnly = true)
    public List<PostResponseDto> getAllPosts() {
        return postRepository.findByDeletedFalse().stream()
                .map(post -> {
                    PostResponseDto dto = PostResponseDto.from(post);
                    dto.setRetweetCount(retweetRepository.countByOriginalPostId(post.getId())); // ✅ 리트윗 수 포함
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ✅ Read: 전체 게시글 페이징 조회 (Oracle 네이티브 페이징)
    @Transactional(readOnly = true)
    public List<PostResponseDto> getAllPostsPaged(int page, int size) {
        int start = (page - 1) * size + 1;
        int end = page * size;
        List<Post> posts = postRepository.findPostsWithPaging(start, end);

        return posts.stream()
                .map(post -> {
                    PostResponseDto dto = PostResponseDto.from(post);
                    dto.setRetweetCount(retweetRepository.countByOriginalPostId(post.getId())); // ✅ 리트윗 수 포함
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ✅ Read: 특정 유저가 좋아요한 게시글 페이징 조회
    @Transactional(readOnly = true)
    public List<PostResponseDto> getLikedPostsPaged(Long userId, int page, int size) {
        int start = (page - 1) * size + 1;
        int end = page * size;
        List<Post> posts = postRepository.findLikedPostsWithPaging(userId, start, end);

        return posts.stream()
                .map(post -> {
                    PostResponseDto dto = PostResponseDto.from(post);
                    dto.setRetweetCount(retweetRepository.countByOriginalPostId(post.getId())); // ✅ 리트윗 수 포함
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ✅ Read: 내가 쓴 글 + 내가 리트윗한 글 페이징 조회 (Oracle UNION ALL 기반)
    @Transactional(readOnly = true)
    public List<PostResponseDto> getMyPostsAndRetweetsPaged(Long userId, int page, int size) {
        int start = (page - 1) * size + 1;
        int end = page * size;
        // ✅ 변경: PostRepository에 추가한 UNION ALL 쿼리 호출
        List<Post> posts = postRepository.findMyPostsAndRetweetsWithPaging(userId, start, end);

        return posts.stream()
                .map(post -> {
                    PostResponseDto dto = PostResponseDto.from(post);
                    dto.setRetweetCount(retweetRepository.countByOriginalPostId(post.getId())); // ✅ 리트윗 수 포함
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ✅ Read: 해시태그 검색
    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsByHashtag(String hashtag) {
        String normalized = hashtag.startsWith("#") ? hashtag.substring(1) : hashtag;
        List<Post> posts = postRepository.findByHashtags_NameAndDeletedFalse(normalized);

        return posts.stream()
                .map(post -> {
                    PostResponseDto dto = PostResponseDto.from(post);
                    dto.setRetweetCount(retweetRepository.countByOriginalPostId(post.getId())); // ✅ 리트윗 수 포함
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ✅ Update: 게시글 수정
    public PostResponseDto updatePost(Long userId, Long postId, PostRequestDto dto, List<MultipartFile> files) {
        Post post = postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        if (!post.getUser().getId().equals(userId)) {
            throw new SecurityException("본인 글만 수정할 수 있습니다.");
        }

        // 내용 수정
        post.setContent(dto.getContent());

        // ✅ 이미지 갱신 로직
        if (files != null && !files.isEmpty()) {
            post.getImages().clear();
            files.forEach(file -> {
                String url = fileStorageService.upload(file);
                Image image = new Image();
                image.setSrc(url);
                image.setPost(post);
                post.getImages().add(image);
            });
        }
        // files가 없으면 기존 이미지 유지

        // ✅ 해시태그 갱신
        post.getHashtags().clear();
        if (dto.getHashtags() != null && !dto.getHashtags().isEmpty()) {
            Set<String> distinctTags = Arrays.stream(dto.getHashtags().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());

            distinctTags.forEach(tagStr -> {
                String normalized = tagStr.startsWith("#") ? tagStr.substring(1) : tagStr;
                Hashtag tag = hashtagRepository.findByName(normalized)
                        .orElseGet(() -> {
                            Hashtag newTag = new Hashtag();
                            newTag.setName(normalized);
                            return hashtagRepository.save(newTag);
                        });
                post.getHashtags().add(tag);
            });
        }
 
        Post updated = postRepository.save(post);
        PostResponseDto dtoResponse = PostResponseDto.from(updated);
        dtoResponse.setRetweetCount(retweetRepository.countByOriginalPostId(updated.getId())); // ✅ 리트윗 수 포함
        return dtoResponse;
    }

    // ✅ Delete: 게시글 삭제 (soft delete)
    public void deletePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        if (!post.getUser().getId().equals(userId)) {
            throw new SecurityException("본인 글만 삭제할 수 있습니다.");
        }
        post.setDeleted(true);
        postRepository.save(post);
    }

    // ✅ Count: 전체 게시글 수
    @Transactional(readOnly = true)
    public long countPosts() {
        return postRepository.count();
    }
}


```


```java
package com.thejoa703.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import com.thejoa703.dto.request.RetweetRequestDto;
import com.thejoa703.dto.response.RetweetResponseDto;
import com.thejoa703.entity.AppUser;
import com.thejoa703.entity.Post;
import com.thejoa703.entity.Retweet;
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.repository.PostRepository;
import com.thejoa703.repository.RetweetRepository;

import lombok.RequiredArgsConstructor;

/**
 * ✅ 리트윗 서비스
 * - 리트윗 추가, 취소, 여부 확인, 카운트, 내가 리트윗한 글 목록 조회
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RetweetService {

    private final RetweetRepository retweetRepository;
    private final AppUserRepository userRepository;
    private final PostRepository postRepository;

    // ✅ Create: 리트윗 추가
    public RetweetResponseDto addRetweet(Long userId, RetweetRequestDto dto) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        Post post = postRepository.findById(dto.getOriginalPostId())
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        if (retweetRepository.countByUserAndOriginalPost(userId, dto.getOriginalPostId()) > 0) {
            throw new IllegalStateException("이미 리트윗한 게시글입니다.");
        }

        Retweet saved = retweetRepository.save(new Retweet(user, post));
        long count = retweetRepository.countByOriginalPostId(post.getId()); // ✅ 변경: 최신 카운트 조회

        return RetweetResponseDto.builder()
                .id(saved.getId())
                .userId(user.getId())
                .originalPostId(post.getId())
                .createdAt(saved.getCreatedAt())
                .retweetCount(count) // ✅ 변경
                .build();
    }

    // ✅ Read: 특정 유저가 특정 게시글을 리트윗했는지 여부
    @Transactional(readOnly = true)
    public boolean hasRetweeted(Long userId, Long postId) {
        return retweetRepository.countByUserAndOriginalPost(userId, postId) > 0;
    }

    // ✅ Read: 특정 게시글의 리트윗 수
    @Transactional(readOnly = true)
    public long countRetweets(Long postId) {
        return retweetRepository.countByOriginalPostId(postId);
    }

    // ✅ Delete: 리트윗 취소
    public RetweetResponseDto removeRetweet(Long userId, Long postId) {
        Retweet retweet = retweetRepository.findByUserAndOriginalPost(userId, postId)
                .orElseThrow(() -> new IllegalStateException("리트윗 없음"));

        if (!retweet.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한 없음");
        }

        retweetRepository.delete(retweet);
        long count = retweetRepository.countByOriginalPostId(postId); // ✅ 변경: 최신 카운트 조회

        return RetweetResponseDto.builder()
                .id(retweet.getId())
                .userId(userId)
                .originalPostId(postId)
                .createdAt(retweet.getCreatedAt())
                .retweetCount(count) // ✅ 변경
                .build();
    }

    // ✅ Read: 내가 리트윗한 글 목록 조회
    @Transactional(readOnly = true)
    public List<Long> findMyRetweets(Long userId) {
        return retweetRepository.findOriginalPostIdsByUserId(userId); // ✅ 변경
    }
}

```