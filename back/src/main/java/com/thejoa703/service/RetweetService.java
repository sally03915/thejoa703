package com.thejoa703.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

import com.thejoa703.dto.request.RetweetRequestDto;
import com.thejoa703.dto.response.RetweetResponseDto;
import com.thejoa703.entity.AppUser;
import com.thejoa703.entity.Post;
import com.thejoa703.entity.Retweet;
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.repository.PostRepository;
import com.thejoa703.repository.RetweetRepository;

import lombok.RequiredArgsConstructor;

/**
 * ✅ 리트윗 서비스
 * - 리트윗 추가, 취소, 여부 확인, 카운트, 내가 리트윗한 글 목록 조회
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RetweetService {

    private final RetweetRepository retweetRepository;
    private final AppUserRepository userRepository;
    private final PostRepository postRepository;

    // ✅ Create: 리트윗 추가
    public RetweetResponseDto addRetweet(Long userId, RetweetRequestDto dto) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        Post post = postRepository.findById(dto.getOriginalPostId())
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        if (retweetRepository.countByUserAndOriginalPost(userId, dto.getOriginalPostId()) > 0) {
            throw new IllegalStateException("이미 리트윗한 게시글입니다.");
        }

        Retweet saved = retweetRepository.save(new Retweet(user, post));
        long count = retweetRepository.countByOriginalPostId(post.getId()); // ✅ 변경: 최신 카운트 조회

        return RetweetResponseDto.builder()
                .id(saved.getId())
                .userId(user.getId())
                .originalPostId(post.getId())
                .createdAt(saved.getCreatedAt())
                .retweetCount(count) // ✅ 변경
                .build();
    }

    // ✅ Read: 특정 유저가 특정 게시글을 리트윗했는지 여부
    @Transactional(readOnly = true)
    public boolean hasRetweeted(Long userId, Long postId) {
        return retweetRepository.countByUserAndOriginalPost(userId, postId) > 0;
    }

    // ✅ Read: 특정 게시글의 리트윗 수
    @Transactional(readOnly = true)
    public long countRetweets(Long postId) {
        return retweetRepository.countByOriginalPostId(postId);
    }

    // ✅ Delete: 리트윗 취소
    public RetweetResponseDto removeRetweet(Long userId, Long postId) {
        Retweet retweet = retweetRepository.findByUserAndOriginalPost(userId, postId)
                .orElseThrow(() -> new IllegalStateException("리트윗 없음"));

        if (!retweet.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("권한 없음");
        }

        retweetRepository.delete(retweet);
        long count = retweetRepository.countByOriginalPostId(postId); // ✅ 변경: 최신 카운트 조회

        return RetweetResponseDto.builder()
                .id(retweet.getId())
                .userId(userId)
                .originalPostId(postId)
                .createdAt(retweet.getCreatedAt())
                .retweetCount(count) // ✅ 변경
                .build();
    }

    // ✅ Read: 내가 리트윗한 글 목록 조회
    @Transactional(readOnly = true)
    public List<Long> findMyRetweets(Long userId) {
        return retweetRepository.findOriginalPostIdsByUserId(userId); // ✅ 변경
    }
}
