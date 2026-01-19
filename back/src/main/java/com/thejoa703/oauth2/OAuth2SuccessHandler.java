package com.thejoa703.oauth2;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.thejoa703.entity.AppUser;
import com.thejoa703.security.JwtProperties;
import com.thejoa703.security.JwtProvider;
import com.thejoa703.security.TokenStore;
import com.thejoa703.service.AppUserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * OAuth2 로그인 성공 핸들러 (리다이렉트 방식)
 * - 공급자별 사용자 정보 매핑 (Google, Kakao, Naver)
 * - DB 저장/조회
 * - JWT 발급 및 Redis 저장
 * - Refresh Token을 HttpOnly 쿠키로 전달
 * - Access Token을 프론트엔드로 리다이렉트하면서 전달
 */
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AppUserService appUserService;
    private final JwtProvider jwtProvider;
    private final TokenStore tokenStore;
    private final JwtProperties props;

    // 프론트엔드 콜백 URL (예: http://localhost:3000/OAuth2Callback)
    @Value("${app.oauth2.redirect-url}")
    private String redirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attrs = oAuth2User.getAttributes();

        // 공급자 식별
        String registrationId = ((OAuth2AuthenticationToken) authentication)
                .getAuthorizedClientRegistrationId();

        // 공급자별 사용자 정보 매핑
        UserInfoOAuth2 userInfo;
        switch (registrationId) {
            case "google": userInfo = new UserInfoGoogle(attrs); break;
            case "kakao":  userInfo = new UserInfoKakao(attrs); break;
            case "naver":  userInfo = new UserInfoNaver(attrs); break;
            default: throw new IllegalArgumentException("지원하지 않는 Provider: " + registrationId);
        }

        // DB 조회/저장
        AppUser user = appUserService.findByEmailAndProvider(userInfo.getEmail(), userInfo.getProvider())
                .orElseGet(() -> appUserService.saveSocialUser(
                        userInfo.getEmail(),
                        userInfo.getProvider(),
                        userInfo.getProviderId(),
                        userInfo.getNickname(),
                        userInfo.getImage()
                ));

        // JWT 발급
        String access = jwtProvider.createAccessToken(user.getId().toString(), Map.of(
                "nickname", user.getNickname(),
                "provider", user.getProvider(),
                "role", user.getRole(),
                "email", user.getEmail()
        ));
        String refresh = jwtProvider.createRefreshToken(user.getId().toString());

        // ✅ Redis에 refresh:<userId> 형태로 저장
        tokenStore.saveRefreshToken(
                user.getId().toString(),
                refresh,
                (long) props.getRefreshTokenExpSeconds()
        );

        // ✅ Refresh Token을 HttpOnly 쿠키로 설정
        Cookie refreshCookie = new Cookie("refreshToken", refresh);
        refreshCookie.setHttpOnly(true);
        boolean isLocal = request.getServerName().equals("localhost") || request.getServerName().equals("127.0.0.1");
        refreshCookie.setSecure(!isLocal);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge((int) props.getRefreshTokenExpSeconds());
        response.addCookie(refreshCookie);

        // ✅ 프론트엔드로 리다이렉트 (Access Token을 쿼리 파라미터로 전달)
        String targetUrl = redirectUrl + "?accessToken=" + access;
        response.sendRedirect(targetUrl);
    }
}



/*
[사용자] ── 소셜 로그인 버튼 클릭 ──▶ [구글/카카오/네이버 인증 서버]

[구글/카카오/네이버] ── 인증 성공 후 콜백 ──▶ http://localhost:8484/login/oauth2/code/{provider}

[Spring Security] ── OAuth2SuccessHandler 실행 ──▶
   1. OAuth2User 정보 추출 (email, nickname, provider 등)
   2. DB 조회/저장 (AppUserService)
   3. JWT Access Token 발급 (jwtProvider)
   4. JWT Refresh Token 발급 + Redis 저장 (tokenStore)
   5. Refresh Token → HttpOnly 쿠키로 내려줌
   6. Access Token → JSON 응답 {"accessToken":"..."} 반환

[React/Next.js - OAuth2Callback.js] ── 응답 수신 ──▶
   1. fetch(...)로 백엔드 콜백 호출
   2. JSON 응답에서 accessToken 추출
   3. localStorage.setItem("accessToken", accessToken)
   4. router.replace("/mypage")로 이동

[React 이후 API 호출] ──▶
   axios / fetch 요청 시
   headers: { Authorization: `Bearer ${accessToken}` }

[Spring Boot API] ── JwtFilter / JwtProvider ──▶
   1. Authorization 헤더에서 Bearer 토큰 추출
   2. 토큰 검증 및 userId(sub) 확인
   3. SecurityContext에 Authentication 저장
   4. Controller에서 authUserJwtService.getCurrentUserId(authentication) 호출
   5. 해당 userId 기반으로 DB 조회 및 응답

*/