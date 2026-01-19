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

