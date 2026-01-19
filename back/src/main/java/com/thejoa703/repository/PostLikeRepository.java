package com.thejoa703.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;

import com.thejoa703.entity.PostLike;

/**
 * ✅ PostLikeRepository
 * - 특정 유저의 특정 게시글 좋아요 조회
 * - 중복 체크 (count 기반)
 * - 좋아요 취소
 * - 특정 게시글의 좋아요 수 집계
 */
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    // ✅ 특정 유저의 특정 게시글 좋아요 조회
    Optional<PostLike> findByUser_IdAndPost_Id(Long userId, Long postId); // ✅ 바뀐 부분 (JPQL 대신 네이밍 규칙 활용)

    // ✅ 특정 게시글의 좋아요 수 집계
    long countByPost_Id(Long postId); // ✅ 바뀐 부분 (postId → post_Id)

    // ✅ 특정 유저가 특정 게시글에 좋아요 했는지 여부
    long countByUser_IdAndPost_Id(Long userId, Long postId); // ✅ 바뀐 부분 (JPQL 대신 네이밍 규칙 활용)

    // ✅ 좋아요 취소 (조회 없이 바로 삭제)
    @Modifying
    @Transactional
    @Query("DELETE FROM PostLike pl WHERE pl.user.id = :userId AND pl.post.id = :postId")
    void deleteByUserAndPost(@Param("userId") Long userId, @Param("postId") Long postId);
}
