package com.thejoa703.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;          // ✅ 변경: @Query 사용
import org.springframework.data.repository.query.Param;   // ✅ 변경: @Param 사용
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.thejoa703.entity.Post;

/**
 * ✅ PostRepository
 * - 게시글 관련 JPA/Native Query 정의
 * - Oracle 11g 환경에서 ROWNUM 기반 페이징 지원
 * - 모든 네이티브 쿼리에서 실제 DB 컬럼명(CREATED_AT, DELETED 등) 사용
 */
public interface PostRepository extends JpaRepository<Post, Long> {

    // ✅ Oracle 네이티브 페이징 (전체 게시글 조회)
    @Query(
      value = "SELECT * FROM ( " +
              "SELECT p.*, ROWNUM AS rnum " +
              "FROM (SELECT * FROM POSTS WHERE DELETED = 0 ORDER BY CREATED_AT DESC) p " + // ✅ 변경: CREATED_AT, DELETED
              ") " +
              "WHERE rnum BETWEEN :start AND :end",
      nativeQuery = true
    )
    List<Post> findPostsWithPaging(@Param("start") int start, @Param("end") int end);

    // ✅ 삭제되지 않은 게시글 전체 조회 (JPA 메서드)
    List<Post> findByDeletedFalse();

    // ✅ JPA 페이징 지원 (테스트 환경 및 범용성 확보)
    Page<Post> findByDeletedFalse(Pageable pageable);
    
    // ✅ 해시태그 이름으로 게시글 검색
    List<Post> findByHashtags_NameAndDeletedFalse(String name);
    
    // ✅ Oracle 네이티브 페이징 (특정 유저가 좋아요한 게시물 조회)
    @Query(
      value = "SELECT * FROM ( " +
              "SELECT p.*, ROWNUM AS rnum " +
              "FROM ( " +
              "   SELECT po.* " +
              "   FROM POSTS po " +
              "   WHERE po.ID IN ( " +
              "       SELECT DISTINCT pl.POST_ID " +
              "       FROM POST_LIKES pl " +
              "       WHERE pl.APP_USER_ID = :userId " +
              "   ) AND po.DELETED = 0 " + // ✅ 변경: DELETED
              "   ORDER BY po.CREATED_AT DESC " + // ✅ 변경: CREATED_AT
              ") p " +
              ") " +
              "WHERE rnum BETWEEN :start AND :end",
      nativeQuery = true
    )
    List<Post> findLikedPostsWithPaging(@Param("userId") Long userId,
                                        @Param("start") int start,
                                        @Param("end") int end);

    // ✅ 내가 쓴 글 페이징 조회 (Oracle 11g ROWNUM 기반)
    @Query(
      value = "SELECT * FROM ( " +
              "SELECT p.*, ROWNUM AS rnum " +
              "FROM ( " +
              "   SELECT po.* " +
              "   FROM POSTS po " +
              "   WHERE po.APP_USER_ID = :userId AND po.DELETED = 0 " + // ✅ 변경: DELETED
              "   ORDER BY po.CREATED_AT DESC " + // ✅ 변경: CREATED_AT
              ") p " +
              ") " +
              "WHERE rnum BETWEEN :start AND :end",
      nativeQuery = true
    )
    List<Post> findMyPostsWithPaging(@Param("userId") Long userId,
                                     @Param("start") int start,
                                     @Param("end") int end);

 // ✅ 내가 쓴 글 + 내가 리트윗한 글 합쳐서 조회 (Oracle 11g 호환, UNION ALL + ROWNUM 페이징)
    @Query(
      value = "SELECT * FROM ( " +
              "SELECT p.*, ROWNUM AS rnum " +
              "FROM ( " +
              "   SELECT po.ID, po.CONTENT, po.CREATED_AT, po.DELETED, po.UPDATED_AT, po.APP_USER_ID " + // ✅ 변경: 컬럼 명시
              "   FROM POSTS po " +
              "   WHERE po.APP_USER_ID = :userId AND po.DELETED = 0 " +
              "   UNION ALL " +
              "   SELECT po.ID, po.CONTENT, po.CREATED_AT, po.DELETED, po.UPDATED_AT, po.APP_USER_ID " + // ✅ 변경: 동일하게 컬럼 명시
              "   FROM POSTS po " +
              "   WHERE po.ID IN ( " +
              "       SELECT DISTINCT r.ORIGINAL_POST_ID " +
              "       FROM RETWEETS r " +
              "       WHERE r.APP_USER_ID = :userId " +
              "   ) AND po.DELETED = 0 " +
              "   ORDER BY CREATED_AT DESC " + // ✅ 변경: 전체 결과에 대해 CREATED_AT 기준 정렬
              ") p " +
              ") " +
              "WHERE rnum BETWEEN :start AND :end",
      nativeQuery = true
    )
    List<Post> findMyPostsAndRetweetsWithPaging(@Param("userId") Long userId,
                                                @Param("start") int start,
                                                @Param("end") int end);


}
