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
