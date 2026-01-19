package com.thejoa703;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

// 엔티티 임포트
import com.thejoa703.entity.AppUser;
import com.thejoa703.entity.Block;
import com.thejoa703.entity.Comment;
import com.thejoa703.entity.Follow;
import com.thejoa703.entity.Hashtag;
import com.thejoa703.entity.Image;
import com.thejoa703.entity.Post;
import com.thejoa703.entity.PostLike;
import com.thejoa703.entity.Retweet;

// 레포지토리 임포트
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.repository.BlockRepository;
import com.thejoa703.repository.CommentRepository;
import com.thejoa703.repository.FollowRepository;
import com.thejoa703.repository.HashtagRepository;
import com.thejoa703.repository.ImageRepository;
import com.thejoa703.repository.PostLikeRepository;
import com.thejoa703.repository.PostRepository;
import com.thejoa703.repository.RetweetRepository;

/**
 * ✅ Repository CRUD 통합 테스트
 * - 순서: AppUser → Post → Comment → Follow → Block → Hashtag → Image → PostLike → Retweet
 * - 각 Repository의 기본 CRUD + 커스텀 메서드 검증
 * - Oracle 호환: count 기반 중복 체크, soft delete 플래그 활용
 * - 트랜잭션 롤백으로 테스트 간 독립성 유지
 */
@SpringBootTest
@Transactional
public class BackApplicationTests1_Repository {

    // Repository 주입
    @Autowired private AppUserRepository appUserRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private FollowRepository followRepository;
    @Autowired private BlockRepository blockRepository;
    @Autowired private HashtagRepository hashtagRepository;
    @Autowired private ImageRepository imageRepository;
    @Autowired private PostLikeRepository postLikeRepository;
    @Autowired private RetweetRepository retweetRepository;

    // 테스트 공통 데이터
    private AppUser user1;
    private AppUser user2;
    private Post post;

    /**
     * ✅ 공통 준비: 사용자 2명 + 게시글 1개
     * - AppUser: email+provider 유니크 제약에 맞춰 랜덤 이메일 생성
     * - Post: user1이 작성한 게시글
     */
    @BeforeEach
    void setup() {
        // 사용자 생성
        String email1 = "user1_" + UUID.randomUUID() + "@test.com";
        String email2 = "user2_" + UUID.randomUUID() + "@test.com";

        user1 = new AppUser();
        user1.setEmail(email1);
        user1.setPassword("pass123");
        user1.setNickname("user1");
        user1.setProvider("local");
        user1.setDeleted(false);

        user2 = new AppUser();
        user2.setEmail(email2);
        user2.setPassword("pass123");
        user2.setNickname("user2");
        user2.setProvider("local");
        user2.setDeleted(false);

        appUserRepository.save(user1);
        appUserRepository.save(user2);

        // 게시글 생성
        post = new Post();
        post.setContent("테스트 게시글");
        post.setUser(user1);
        post.setDeleted(false);
        postRepository.save(post);
    }

    // ---------------------------------------------------------------------
    // AppUserRepository
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("AppUserRepository - CRUD + 커스텀 메서드")
    void testAppUserRepository() {
        // email + provider 기반 조회 (유니크 제약 반영)
        Optional<AppUser> found = appUserRepository.findByEmailAndProvider(user1.getEmail(), "local");
        assertThat(found).isPresent();

        // 닉네임 수정 후 중복 체크 (Oracle 호환: count 기반)
        user1.setNickname("newNick");
        appUserRepository.save(user1);
        assertThat(appUserRepository.existsByNicknameSafe("newNick")).isTrue();

        // 이메일 중복 체크 (count 기반)
        assertThat(appUserRepository.existsByEmailSafe(user1.getEmail())).isTrue();

        // provider 구분 없는 조회 (특수 케이스)
        assertThat(appUserRepository.findByEmail(user2.getEmail())).isPresent();

        // 삭제 후 조회 불가 확인 (deleteById)
        Long deleteId = user2.getId();
        appUserRepository.deleteById(deleteId);
        assertThat(appUserRepository.findById(deleteId)).isEmpty();
    }

    // ---------------------------------------------------------------------
    // PostRepository
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("PostRepository - CRUD + soft delete + 해시태그 검색")
    void testPostRepository() {
        // 삭제되지 않은 게시글 조회
        assertThat(postRepository.findByDeletedFalse()).hasSize(1);

        // 게시글 수정
        post.setContent("수정된 게시글");
        postRepository.save(post);
        assertThat(postRepository.findById(post.getId()).get().getContent()).isEqualTo("수정된 게시글");

        // 해시태그 연결 후 검색 (JPA 메서드)
        Hashtag tag = new Hashtag();
        tag.setName("스프링부트");
        hashtagRepository.save(tag);

        post.getHashtags().add(tag);
        postRepository.save(post);

        List<Post> byTag = postRepository.findByHashtags_NameAndDeletedFalse("스프링부트");
        assertThat(byTag).isNotEmpty();

        // soft delete 처리 후 조회 불가 확인
        post.setDeleted(true);
        postRepository.save(post);
        assertThat(postRepository.findByDeletedFalse()).isEmpty();
    }

    // ---------------------------------------------------------------------
    // CommentRepository
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("CommentRepository - CRUD + 삭제되지 않은 댓글 조회/집계")
    void testCommentRepository() {
        // 댓글 생성
        Comment comment = new Comment();
        comment.setContent("테스트 댓글");
        comment.setUser(user2);
        comment.setPost(post);
        comment.setDeleted(false);
        commentRepository.save(comment);

        // 특정 게시글의 삭제되지 않은 댓글 목록 조회
        List<Comment> comments = commentRepository.findByPostIdAndDeletedFalse(post.getId());
        assertThat(comments).hasSize(1);

        // 댓글 수정
        comment.setContent("수정된 댓글");
        commentRepository.save(comment);
        assertThat(commentRepository.findById(comment.getId()).get().getContent()).isEqualTo("수정된 댓글");

        // soft delete 처리 후 count 확인
        comment.setDeleted(true);
        commentRepository.save(comment);
        assertThat(commentRepository.countByPostIdAndDeletedFalse(post.getId())).isEqualTo(0L);
    }

    // ---------------------------------------------------------------------
    // FollowRepository
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("FollowRepository - CRUD + 팔로잉/팔로워 조회/집계")
    void testFollowRepository() {
        // 팔로우 생성 (user1 → user2)
        Follow follow = new Follow(user1, user2);
        followRepository.save(follow);

        // 팔로우 단건 조회
        assertThat(followRepository.findByFollower_IdAndFollowee_Id(user1.getId(), user2.getId())).isPresent();

        // 팔로잉 목록 조회 (EntityGraph로 followee 조인)
        List<Follow> followings = followRepository.findByFollower_Id(user1.getId());
        assertThat(followings).hasSize(1);
        assertThat(followings.get(0).getFollowee().getId()).isEqualTo(user2.getId());

        // 팔로워 목록 조회 (EntityGraph로 follower 조인)
        List<Follow> followers = followRepository.findByFollowee_Id(user2.getId());
        assertThat(followers).hasSize(1);
        assertThat(followers.get(0).getFollower().getId()).isEqualTo(user1.getId());

        // 팔로잉/팔로워 수 집계
        assertThat(followRepository.countByFollower_Id(user1.getId())).isEqualTo(1L);
        assertThat(followRepository.countByFollowee_Id(user2.getId())).isEqualTo(1L);

        // 삭제 후 조회 불가 확인
        followRepository.delete(follow);
        assertThat(followRepository.findByFollower_IdAndFollowee_Id(user1.getId(), user2.getId())).isEmpty();
    }

    // ---------------------------------------------------------------------
    // BlockRepository
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("BlockRepository - CRUD + 차단 관계 조회/존재 여부")
    void testBlockRepository() {
        // 차단 생성 (user1 → user2)
        Block block = new Block(user1, user2);
        blockRepository.save(block);

        // 특정 차단 관계 단건 조회
        Optional<Block> found = blockRepository.findByBlocker_IdAndBlockedUser_Id(user1.getId(), user2.getId());
        assertThat(found).isPresent();

        // 차단 관계 존재 여부 (count 기반)
        long existsCount = blockRepository.countByBlocker_IdAndBlockedUser_Id(user1.getId(), user2.getId());
        assertThat(existsCount).isEqualTo(1L);

        // 삭제 후 존재 여부 확인
        blockRepository.delete(block);
        assertThat(blockRepository.countByBlocker_IdAndBlockedUser_Id(user1.getId(), user2.getId())).isEqualTo(0L);
    }

    // ---------------------------------------------------------------------
    // HashtagRepository
    // ---------------------------------------------------------------------
 
    @DisplayName("HashtagRepository - CRUD + 이름 검색 + posts 페치 조인")
    @Test
    void testHashtagRepository() {
        Hashtag tag = new Hashtag();
        tag.setName("테스트");
        hashtagRepository.save(tag);

        // 양방향 관계 동기화
        post.getHashtags().add(tag);
        tag.getPosts().add(post);

        postRepository.save(post);

        Optional<Hashtag> withPosts = hashtagRepository.findByNameWithPosts("테스트");
        assertThat(withPosts).isPresent();
        assertThat(withPosts.get().getPosts()).isNotEmpty(); // ✅ 이제 통과
    }


    // ---------------------------------------------------------------------
    // ImageRepository
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("ImageRepository - CRUD")
    void testImageRepository() {
        // 이미지 생성
        Image image = new Image();
        image.setSrc("http://test.com/img.png");
        image.setPost(post);
        imageRepository.save(image);

        // 단건 조회
        assertThat(imageRepository.findById(image.getId())).isPresent();

        // 삭제 후 조회 불가 확인
        imageRepository.delete(image);
        assertThat(imageRepository.findById(image.getId())).isEmpty();
    }

    // ---------------------------------------------------------------------
    // PostLikeRepository
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("PostLikeRepository - CRUD + 중복 체크 + 좋아요 취소")
    void testPostLikeRepository() {
        // 좋아요 생성 (user2 → post)
        PostLike like = new PostLike(user2, post);
        postLikeRepository.save(like);

        // 특정 유저의 특정 게시글 좋아요 조회
        Optional<PostLike> found = postLikeRepository.findByUser_IdAndPost_Id(user2.getId(), post.getId());
        assertThat(found).isPresent();

        // 특정 게시글의 좋아요 수 집계
        assertThat(postLikeRepository.countByPost_Id(post.getId())).isEqualTo(1L);

        // 특정 유저가 특정 게시글에 좋아요 했는지 여부 (count 기반)
        assertThat(postLikeRepository.countByUser_IdAndPost_Id(user2.getId(), post.getId())).isEqualTo(1L);

        // 좋아요 취소 (조회 없이 바로 삭제)
        postLikeRepository.deleteByUserAndPost(user2.getId(), post.getId());
        assertThat(postLikeRepository.countByUser_IdAndPost_Id(user2.getId(), post.getId())).isEqualTo(0L);
        assertThat(postLikeRepository.countByPost_Id(post.getId())).isEqualTo(0L);
    }

    // ---------------------------------------------------------------------
    // RetweetRepository
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("RetweetRepository - CRUD + 중복 체크 + 리트윗 취소 + ID 목록 조회")
    void testRetweetRepository() {
        // 리트윗 생성 (user2 → post)
        Retweet retweet = new Retweet(user2, post);
        retweetRepository.save(retweet);

        // 특정 유저의 특정 게시글 리트윗 조회 (JPQL)
        Optional<Retweet> found = retweetRepository.findByUserAndOriginalPost(user2.getId(), post.getId());
        assertThat(found).isPresent();

        // 중복 리트윗 방지 (count 기반 체크)
        assertThat(retweetRepository.countByUserAndOriginalPost(user2.getId(), post.getId())).isEqualTo(1L);

        // 특정 게시글의 리트윗 수 집계
        assertThat(retweetRepository.countByOriginalPostId(post.getId())).isEqualTo(1L);

        // 특정 유저가 리트윗한 글 ID 목록 조회
        List<Long> retweetedIds = retweetRepository.findOriginalPostIdsByUserId(user2.getId());
        assertThat(retweetedIds).contains(post.getId());

        // 리트윗 취소
        retweetRepository.deleteByUserAndOriginalPost(user2.getId(), post.getId());
        assertThat(retweetRepository.countByUserAndOriginalPost(user2.getId(), post.getId())).isEqualTo(0L);
        assertThat(retweetRepository.countByOriginalPostId(post.getId())).isEqualTo(0L);
    }
}
