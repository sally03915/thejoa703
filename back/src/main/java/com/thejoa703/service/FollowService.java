// src/main/java/com/thejoa703/service/FollowService.java
package com.thejoa703.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thejoa703.dto.request.FollowRequestDto;
import com.thejoa703.dto.response.FollowResponseDto;
import com.thejoa703.dto.response.BlockResponseDto;
import com.thejoa703.entity.AppUser;
import com.thejoa703.entity.Follow;
import com.thejoa703.entity.Block;
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.repository.BlockRepository;
import com.thejoa703.repository.FollowRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class FollowService {

    private final FollowRepository followRepository;
    private final BlockRepository blockRepository;
    private final AppUserRepository userRepository;

    // ✅ Follow
    public FollowResponseDto follow(Long followerId, FollowRequestDto dto) {
        Long followeeId = dto.getFolloweeId();
        if (followerId.equals(followeeId)) {
            throw new IllegalStateException("자기 자신은 팔로우할 수 없습니다.");
        }

        AppUser follower = userRepository.findById(followerId)
                .orElseThrow(() -> new IllegalArgumentException("팔로워 없음"));
        AppUser followee = userRepository.findById(followeeId)
                .orElseThrow(() -> new IllegalArgumentException("팔로잉 대상 없음"));

        if (blockRepository.countByBlocker_IdAndBlockedUser_Id(followerId, followeeId) > 0) {
            throw new IllegalStateException("차단 중인 사용자입니다.");
        }
        if (blockRepository.countByBlocker_IdAndBlockedUser_Id(followeeId, followerId) > 0) {
            throw new IllegalStateException("상대가 나를 차단하여 팔로우할 수 없습니다.");
        }

        Follow existing = followRepository.findByFollower_IdAndFollowee_Id(followerId, followeeId).orElse(null);
        if (existing != null) {
            boolean blocked = blockRepository.countByBlocker_IdAndBlockedUser_Id(followerId, followeeId) > 0;
            return FollowResponseDto.of(existing, followee, blocked);
        }

        Follow saved = followRepository.save(new Follow(follower, followee));
        return FollowResponseDto.of(saved, followee, false);
    }

    // ✅ Unfollow
    public Long unfollow(Long followerId, Long followeeId) {
        followRepository.findByFollower_IdAndFollowee_Id(followerId, followeeId)
            .ifPresent(followRepository::delete);
        return followeeId;
    }

    // ✅ Block
    public BlockResponseDto block(Long blockerId, Long targetUserId) {
        AppUser blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> new IllegalArgumentException("차단자 없음"));
        AppUser target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("대상 사용자 없음"));

        if (blockRepository.countByBlocker_IdAndBlockedUser_Id(blockerId, targetUserId) == 0) {
            blockRepository.save(new Block(blocker, target));
        }

        followRepository.findByFollower_IdAndFollowee_Id(blockerId, targetUserId)
            .ifPresent(followRepository::delete);
        followRepository.findByFollower_IdAndFollowee_Id(targetUserId, blockerId)
            .ifPresent(followRepository::delete);

        return new BlockResponseDto(blockerId, targetUserId, true);
    }

    // ✅ Unblock
    public BlockResponseDto unblock(Long blockerId, Long targetUserId) {
        blockRepository.findByBlocker_IdAndBlockedUser_Id(blockerId, targetUserId)
            .ifPresent(blockRepository::delete);
        return new BlockResponseDto(blockerId, targetUserId, false);
    }

    // ✅ Followings 조회 (blocked 포함)
    @Transactional(readOnly = true)
    public List<FollowResponseDto> getFollowings(Long followerId) {
        return followRepository.findByFollower_Id(followerId).stream()
            .map(f -> {
                boolean blocked = blockRepository.countByBlocker_IdAndBlockedUser_Id(followerId, f.getFollowee().getId()) > 0;
                return FollowResponseDto.of(f, f.getFollowee(), blocked);
            })
            .collect(Collectors.toList());
    }

    // ✅ Followers 조회 (blocked 포함)
    @Transactional(readOnly = true)
    public List<FollowResponseDto> getFollowers(Long followeeId) {
        return followRepository.findByFollowee_Id(followeeId).stream()
            .map(f -> {
                boolean blocked = blockRepository.countByBlocker_IdAndBlockedUser_Id(followeeId, f.getFollower().getId()) > 0;
                return FollowResponseDto.of(f, f.getFollower(), blocked);
            })
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countFollowings(Long followerId) {
        return getFollowings(followerId).size();
    }

    @Transactional(readOnly = true)
    public long countFollowers(Long followeeId) {
        return getFollowers(followeeId).size();
    }
}
