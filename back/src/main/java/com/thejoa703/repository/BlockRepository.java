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
