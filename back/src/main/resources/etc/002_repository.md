Repository

--- 
[AppUserRepository]
```java
package com.thejoa703.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.thejoa703.entity.AppUser;

/**
 * 사용자 레포지토리
 * - email + provider 기반 조회
 * - soft delete 고려한 조회 메서드 추가
 * - Oracle 환경 호환성을 고려해 existsBy 대신 countBy 기반 메서드 사용
 */
@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    // email + provider로 사용자 조회 (Unique 제약 반영)
    Optional<AppUser> findByEmailAndProvider(String email, String provider);

	//    // soft delete 고려한 조회
	//    Optional<AppUser> findByEmailAndProviderAndDeletedFalse(String email, String provider);
    
    // ✅ ID로 삭제
    void deleteById(Long id);
    

    // provider 구분 없는 조회 (특수 케이스에서만 사용)
    Optional<AppUser> findByEmail(String email);

    // 닉네임 중복 검증 (count 기반)
    long countByNickname(String nickname);

    // 이메일 중복 검증 (count 기반)
    long countByEmail(String email);

    // ✅ 닉네임 중복 체크 (Oracle 호환)
    default boolean existsByNicknameSafe(String nickname) {
        return countByNickname(nickname) > 0;
    }

    // ✅ 이메일 중복 체크 (Oracle 호환)
    default boolean existsByEmailSafe(String email) {
        return countByEmail(email) > 0;
    }
}


```


---
```java
package com.thejoa703.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.thejoa703.entity.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {

    // 특정 차단 관계 단건 조회
    Optional<Block> findByBlocker_IdAndBlockedUser_Id(Long blockerId, Long blockedUserId);

    // 차단 관계 존재 여부 (Oracle 호환: countBy 사용)
    long countByBlocker_IdAndBlockedUser_Id(Long blockerId, Long blockedUserId);
}


```



---
```java
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
 

```



---
```java
package com.thejoa703.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import com.thejoa703.entity.Follow;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    // 팔로우 관계 단건 조회
    Optional<Follow> findByFollower_IdAndFollowee_Id(Long followerId, Long followeeId);

    // 팔로잉 목록 조회 (지연 로딩 방지: followee 조인)
    @EntityGraph(attributePaths = {"followee"})
    List<Follow> findByFollower_Id(Long followerId);

    // 팔로워 목록 조회 (지연 로딩 방지: follower 조인)
    @EntityGraph(attributePaths = {"follower"})
    List<Follow> findByFollowee_Id(Long followeeId);

    // 팔로잉 수 집계
    long countByFollower_Id(Long followerId);

    // 팔로워 수 집계
    long countByFollowee_Id(Long followeeId);
}


```



---
```java
package com.thejoa703.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.thejoa703.entity.Hashtag;

//HashtagRepository.java
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
	Optional<Hashtag> findByName(String name);

	@Query("SELECT DISTINCT h FROM Hashtag h JOIN FETCH h.posts WHERE h.name = :name")
	Optional<Hashtag> findByNameWithPosts(@Param("name") String name);

	List<Hashtag> findByNameContaining(String keyword); // ✅ 수정
}


```



---
```java
// ImageRepository.java
package com.thejoa703.repository;

import com.thejoa703.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image, Long> {}


```



---
```java
// ImageRepository.java
package com.thejoa703.repository;

import com.thejoa703.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image, Long> {}


```



---
```java
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


```



---
```java
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


```




---
```java
package com.thejoa703.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.thejoa703.entity.Post;
import com.thejoa703.entity.Retweet;

/**
 * ✅ RetweetRepository
 * - 특정 유저의 특정 게시글 리트윗 조회
 * - 중복 리트윗 방지 (count 기반)
 * - 리트윗 취소
 * - 특정 게시글의 리트윗 수 집계
 */
public interface RetweetRepository extends JpaRepository<Retweet, Long> {

    // 특정 유저의 특정 게시글 리트윗 조회 (JPQL로 직접 작성 → Oracle 11g 호환)
    @Query("SELECT r FROM Retweet r WHERE r.user.id = :userId AND r.originalPost.id = :postId")
    Optional<Retweet> findByUserAndOriginalPost(@Param("userId") Long userId, @Param("postId") Long postId);

    // 중복 리트윗 방지 (count 기반 체크)
    @Query("SELECT COUNT(r) FROM Retweet r WHERE r.user.id = :userId AND r.originalPost.id = :postId")
    long countByUserAndOriginalPost(@Param("userId") Long userId, @Param("postId") Long postId);

    // 리트윗 취소 (삭제 쿼리 실행 시 트랜잭션 필요)
    @Modifying
    @Transactional
    @Query("DELETE FROM Retweet r WHERE r.user.id = :userId AND r.originalPost.id = :postId")
    void deleteByUserAndOriginalPost(@Param("userId") Long userId, @Param("postId") Long postId);

    // 특정 게시글의 리트윗 수 집계
    long countByOriginalPostId(Long postId);
    
    // ✅ 변경: 특정 유저가 리트윗한 글 목록 조회
    @Query("SELECT r.originalPost.id FROM Retweet r WHERE r.user.id = :userId")
    List<Long> findOriginalPostIdsByUserId(@Param("userId") Long userId);
    
    ///////////////////////////////////////////////////// 내가 리트윗
    @Query(
      value = "SELECT * FROM ( " +
              "SELECT p.*, ROWNUM AS rnum " +
              "FROM ( " +
              "   SELECT po.* " +
              "   FROM POSTS po " +
              "   WHERE po.ID IN ( " +
              "       SELECT DISTINCT r.ORIGINAL_POST_ID " +
              "       FROM RETWEETS r " +
              "       WHERE r.APP_USER_ID = :userId " +
              "   ) AND po.deleted = 0 " +
              "   ORDER BY po.created_at DESC " +
              ") p " +
              ") " +
              "WHERE rnum BETWEEN :start AND :end",
      nativeQuery = true
    )
    List<Post> findRetweetedPostsWithPaging(@Param("userId") Long userId,
                                            @Param("start") int start,
                                            @Param("end") int end);

}
//Spring Data JPA 메서드 이름 규칙 

```
