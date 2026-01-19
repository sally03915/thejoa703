package com.thejoa703.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Refresh Token 저장소 (Redis 기반)
 * - 키 네임스페이스: refresh:<userId>
 * - TTL: props.getRefreshTokenExpSeconds() 기준
 */
@Component
@RequiredArgsConstructor
public class TokenStore {

    private final RedisTemplate<String, String> redisTemplate;

    /**
     * Refresh Token 저장
     * @param userId 사용자 ID (String)
     * @param token Refresh Token
     * @param ttlSeconds 만료 시간 (초)
     */
    public void saveRefreshToken(String userId, String token, long ttlSeconds) {
        String key = buildKey(userId);
        redisTemplate.opsForValue().set(key, token, ttlSeconds, TimeUnit.SECONDS);
    }

    /**
     * Refresh Token 조회
     * @param userId 사용자 ID (String)
     * @return 저장된 Refresh Token (없으면 null)
     */
    public String getRefreshToken(String userId) {
        String key = buildKey(userId);
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * Refresh Token 삭제 (로그아웃 시)
     * @param userId 사용자 ID (String)
     */
    public void deleteRefreshToken(String userId) {
        String key = buildKey(userId);
        redisTemplate.delete(key);
    }

    /**
     * Redis 키 생성 규칙
     * @param userId 사용자 ID
     * @return refresh:<userId>
     */
    private String buildKey(String userId) {
        return "refresh:" + userId;
    }
}
