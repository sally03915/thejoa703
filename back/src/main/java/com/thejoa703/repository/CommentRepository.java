package com.thejoa703.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.thejoa703.entity.Comment;

/**
 * ✅ CommentRepository
 * - 특정 게시글의 삭제되지 않은 댓글 조회
 * - 삭제되지 않은 댓글 수 집계
 */
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 특정 게시글의 삭제되지 않은 댓글 목록 조회
    List<Comment> findByPostIdAndDeletedFalse(Long postId);

    // 특정 게시글의 삭제되지 않은 댓글 수 집계
    long countByPostIdAndDeletedFalse(Long postId);
}
 