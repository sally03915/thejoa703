package com.thejoa703;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;

import com.thejoa703.dto.request.*;
import com.thejoa703.dto.response.*;
import com.thejoa703.service.*;

/**
 * ✅ 서비스 통합 테스트
 * - AppUserService, CommentService, FollowService, PostLikeService, PostService
 * - 각 서비스의 CRUD 및 주요 비즈니스 로직 검증
 * - @Transactional: 각 테스트 종료 시 자동 롤백 → DB 상태 깨끗하게 유지
 */
@SpringBootTest
@Transactional
public class BackApplicationTests2_Service {

    // 서비스 주입
    @Autowired private AppUserService appUserService;
    @Autowired private CommentService commentService;
    @Autowired private FollowService followService;
    @Autowired private PostLikeService postLikeService;
    @Autowired private PostService postService;

    // 테스트용 사용자/게시글
    private UserResponseDto user1Dto;
    private UserResponseDto user2Dto;
    private PostResponseDto post;

    @BeforeEach
    void setup() {
        // ✅ 사용자 생성 (회원가입)
        UserRequestDto req1 = new UserRequestDto("user1_" + UUID.randomUUID() + "@test.com", "pass123", "user1", "local");
        UserRequestDto req2 = new UserRequestDto("user2_" + UUID.randomUUID() + "@test.com", "pass123", "user2", "local");

        user1Dto = appUserService.signup(req1, null); // DTO 그대로 사용 → getId()로 PK 접근
        user2Dto = appUserService.signup(req2, null);

        // ✅ 게시글 생성
        PostRequestDto postReq = new PostRequestDto("테스트 게시글", "#tag1,#tag2");
        post = postService.createPost(user1Dto.getId(), postReq, null);
    }

    // ---------------------------------------------------------------------
    // AppUserService 테스트
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("AppUserService - 회원가입/로그인/닉네임 변경/삭제")
    void testAppUserService() {
        // 로그인 성공
        LoginRequest loginReq = new LoginRequest(user1Dto.getEmail(), "pass123", "local");
        UserResponseDto loginUser = appUserService.login(loginReq);
        assertThat(loginUser.getEmail()).isEqualTo(user1Dto.getEmail());

        // 로그인 실패 (비밀번호 불일치)
        LoginRequest wrongLogin = new LoginRequest(user1Dto.getEmail(), "wrong", "local");
        assertThrows(IllegalArgumentException.class, () -> appUserService.login(wrongLogin));

        // 닉네임 변경
        UserResponseDto updated = appUserService.updateNickname(user1Dto.getId(), "newNick");
        assertThat(updated.getNickname()).isEqualTo("newNick");

        // 프로필 이미지 변경
        MultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "dummy".getBytes());
        UserResponseDto updatedImg = appUserService.updateProfileImage(user1Dto.getId(), file);
        assertThat(updatedImg.getUfile()).contains("uploads/");

        // 삭제 후 조회 불가
        appUserService.deleteById(user2Dto.getId());
        assertThrows(IllegalArgumentException.class, () -> appUserService.findById(user2Dto.getId()));
    }

    // ---------------------------------------------------------------------
    // CommentService 테스트
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("CommentService - 댓글 작성/조회/수정/삭제")
    void testCommentService() {
        // 댓글 작성
        CommentRequestDto commentReq = new CommentRequestDto(post.getId(), "테스트 댓글");
        CommentResponseDto comment = commentService.createComment(user2Dto.getId(), commentReq);
        assertThat(comment.getContent()).isEqualTo("테스트 댓글");

        // 댓글 조회
        List<CommentResponseDto> comments = commentService.getCommentsByPost(post.getId());
        assertThat(comments).hasSize(1);

        // 댓글 수정 (작성자 본인)
        CommentRequestDto updateReq = new CommentRequestDto(post.getId(), "수정된 댓글");
        CommentResponseDto updated = commentService.updateComment(user2Dto.getId(), comment.getId(), updateReq);
        assertThat(updated.getContent()).isEqualTo("수정된 댓글");

        // 댓글 수정 (타인) → 예외
        assertThrows(IllegalArgumentException.class, () -> commentService.updateComment(user1Dto.getId(), comment.getId(), updateReq));

        // 댓글 삭제
        commentService.deleteComment(user2Dto.getId(), comment.getId());
        assertThat(commentService.countComments(post.getId())).isEqualTo(0);
    }

    // ---------------------------------------------------------------------
    // FollowService 테스트
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("FollowService - 팔로우/언팔로우/차단/차단해제")
    void testFollowService() {
        // 팔로우
        FollowRequestDto followReq = new FollowRequestDto(user2Dto.getId());
        FollowResponseDto follow = followService.follow(user1Dto.getId(), followReq);
        assertThat(follow.getFolloweeId()).isEqualTo(user2Dto.getId());

        // 자기 자신 팔로우 → 예외
        FollowRequestDto selfFollow = new FollowRequestDto(user1Dto.getId());
        assertThrows(IllegalStateException.class, () -> followService.follow(user1Dto.getId(), selfFollow));

        // 언팔로우
        Long unfollowedId = followService.unfollow(user1Dto.getId(), user2Dto.getId());
        assertThat(unfollowedId).isEqualTo(user2Dto.getId());

        // 차단
        BlockResponseDto block = followService.block(user1Dto.getId(), user2Dto.getId());
        assertThat(block.isBlocked()).isTrue();

        // 차단 해제
        BlockResponseDto unblock = followService.unblock(user1Dto.getId(), user2Dto.getId());
        assertThat(unblock.isBlocked()).isFalse();
    }

    // ---------------------------------------------------------------------
    // PostLikeService 테스트
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("PostLikeService - 좋아요 추가/중복 방지/취소")
    void testPostLikeService() {
        // 좋아요 추가
        LikeRequestDto likeReq = new LikeRequestDto(post.getId());
        LikeResponseDto like = postLikeService.addLike(user2Dto.getId(), likeReq);
        assertThat(like.getCount()).isEqualTo(1);

        // 중복 좋아요 → count 유지
        LikeResponseDto duplicate = postLikeService.addLike(user2Dto.getId(), likeReq);
        assertThat(duplicate.getCount()).isEqualTo(1);

        // 좋아요 취소
        LikeResponseDto removed = postLikeService.removeLike(user2Dto.getId(), post.getId());
        assertThat(removed.getCount()).isEqualTo(0);
    }

    // ---------------------------------------------------------------------
    // PostService 테스트
    // ---------------------------------------------------------------------
    @Test
    @DisplayName("PostService - 게시글 작성/조회/수정/삭제/검색")
    void testPostService() {
        // 게시글 조회
        PostResponseDto found = postService.getPost(post.getId());
        assertThat(found.getContent()).isEqualTo("테스트 게시글");

        // 게시글 수정 (본인)
        PostRequestDto updateReq = new PostRequestDto("수정된 게시글", "#newTag");
        PostResponseDto updated = postService.updatePost(user1Dto.getId(), post.getId(), updateReq, null);
        assertThat(updated.getContent()).isEqualTo("수정된 게시글");

        // 게시글 수정 (타인) → 예외
        assertThrows(SecurityException.class, () -> postService.updatePost(user2Dto.getId(), post.getId(), updateReq, null));

        // 해시태그 검색
        List<PostResponseDto> byTag = postService.getPostsByHashtag("#newTag");
        assertThat(byTag).isNotEmpty();

        // ✅ soft delete: 서비스 메서드 호출로 삭제 반영
        postService.deletePost(user1Dto.getId(), post.getId());
        assertThrows(IllegalArgumentException.class, () -> postService.getPost(post.getId()));
    }
}
