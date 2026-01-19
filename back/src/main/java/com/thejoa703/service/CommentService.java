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
