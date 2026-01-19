package com.thejoa703.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.thejoa703.oauth2.CustomOAuth2User;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * ✅ JWT 인증 필터 (통합 클래스 사용)
 * - Authorization 헤더에서 Bearer 토큰 추출
 * - JwtProvider로 Claims 파싱
 * - CustomUserPrincipal 기반 principal 생성 후 SecurityContext에 저장
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    public JwtAuthenticationFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtProvider.parse(token).getBody();

                // ✅ subject → userId(Long), role 추출
                Long userId = Long.parseLong(claims.getSubject());
                String role = claims.get("role", String.class);

                // ✅ principal을 CustomUserPrincipal로 교체
                CustomOAuth2User userPrincipal = new CustomOAuth2User(userId, role);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userPrincipal, null, userPrincipal.getAuthorities()
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);

                // ✅ 로그 확인용 (필요 시)
                // log.debug("JWT 인증 성공: userId={}, role={}", userId, role);

            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                // log.warn("JWT 인증 실패: {}", e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }
}
