package com.thejoa703.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

// ✅ JWT 토큰 발급/검증 담당
@Component
public class JwtProvider {
    private final JwtProperties props;
    private final SecretKey key;

    public JwtProvider(JwtProperties props) {
        this.props = props;
        this.key = Keys.hmacShaKeyFor(props.getSecret().getBytes());
    }

    // Access Token 발급
    public String createAccessToken(String subject, Map<String, Object> claims) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.getAccessTokenExpSeconds());
        return Jwts.builder()
                .setIssuer(props.getIssuer())
                .setSubject(subject) // ✅ userId 저장
                .addClaims(claims)   // ✅ role 등 추가
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh Token 발급
    public String createRefreshToken(String subject) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.getRefreshTokenExpSeconds());
        return Jwts.builder()
                .setIssuer(props.getIssuer())
                .setSubject(subject)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰 검증
    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .requireIssuer(props.getIssuer())
                .build()
                .parseClaimsJws(token);
    }
}
