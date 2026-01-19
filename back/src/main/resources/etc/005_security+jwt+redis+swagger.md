
## 🔑 전체 순서 흐름
1. **Security 먼저** → 보안 틀을 먼저 짜야 합니다. (JWT, Redis, 필터)  
   → 그래야 OAuth2SuccessHandler가 발급한 토큰을 검증할 수 있습니다.  
2. **OAuth2SuccessHandler** → 소셜 로그인 성공 시 JWT 발급 + Refresh Token 저장.  
3. **React/Next.js 프론트** → Access Token을 받아서 localStorage에 저장하고 API 호출 시 Authorization 헤더에 붙임.  
4. **JwtAuthenticationFilter** → API 요청마다 헤더에서 토큰 꺼내 검증, 사용자 인증정보(SecurityContext)에 심음.  
5. **Controller/Service** → SecurityContext에 있는 사용자 ID로 DB 조회 후 응답.

---

### 1. `JwtProperties`
- **설정값 바인딩**: `issuer`, `secret`, `expSeconds` 같은 토큰 기본 속성.  
- **꽂히는 단어**: **토큰 DNA** → 토큰이 태어날 때 필요한 기본 유전자.

---

### 2. `JwtProvider`
- **토큰 발급/검증 담당**: Access Token, Refresh Token 생성, 파싱.  
- **꽂히는 단어**: **토큰 공장** → 토큰을 찍어내고 검사하는 공장.

---

### 3. `TokenStore`
- **Redis 저장소**: Refresh Token을 `refresh:<userId>` 키로 저장/조회/삭제.  
- **꽂히는 단어**: **토큰 냉장고** → Refresh Token을 안전하게 보관하는 냉장고.

---

### 4. `JwtAuthenticationFilter`
- **요청 필터**: 매 요청마다 Authorization 헤더 확인 → 토큰 검증 → SecurityContext에 사용자 정보 저장.  
- **꽂히는 단어**: **보안 게이트** → API 입구에서 신분증 검사하는 게이트.

---

### 5. `OAuth2SuccessHandler`
- **소셜 로그인 성공 처리**: 공급자별 사용자 정보 추출 → DB 저장 → JWT 발급 → Refresh Token 쿠키로 내려줌 → Access Token 프론트로 전달.  
- **꽂히는 단어**: **입국 심사대** → 구글/카카오/네이버에서 넘어온 사람을 확인하고 우리 시스템에 등록.

---

### 6. 프론트엔드 흐름
- **Access Token 저장**: localStorage에 저장.  
- **API 호출 시 헤더에 붙임**: `Authorization: Bearer <token>`  
- **꽂히는 단어**: **출입증** → API 호출할 때마다 출입증 제시.

---

### 7. 서버 API 처리
- **JwtFilter → SecurityContext**: 토큰 검증 후 사용자 ID를 컨텍스트에 저장.  
- **Controller/Service**: `getCurrentUserId()`로 현재 사용자 ID 확인 후 DB 조회.  
- **꽂히는 단어**: **사원증 스캔** → 컨트롤러에서 현재 로그인한 사람을 바로 확인.

---

## ✅ 정리
- 순서: **Security → OAuth2SuccessHandler → 프론트 저장 → JwtFilter → Controller**  
- 각 부분을 꽂히는 단어로 기억하면:  
  - JwtProperties = 토큰 DNA  
  - JwtProvider = 토큰 공장  
  - TokenStore = 토큰 냉장고  
  - JwtFilter = 보안 게이트  
  - OAuth2SuccessHandler = 입국 심사대  
  - Access Token = 출입증  
  - Controller = 사원증 스캔
 

네 사장님 👍 지금 보여주신 **각 설정 파일(WebConfig, RedisConfig, SecurityConfig)**은 OAuth2 + JWT 구조에서 꼭 필요한 퍼즐 조각들이고, 순서도 잘 맞습니다. 이해하기 쉽게 “꽂히는 단어”로 정리해드릴게요.

---

## 🔑 WebConfig
- **역할**: 정적 리소스 매핑 + CORS 전역 설정
- **핵심 포인트**
  - `/uploads/**` → 실제 서버의 `uploads` 폴더와 연결  
    👉 **이미지 창고 문 열기**
  - `addCorsMappings` → 모든 경로에 대해 CORS 허용  
    👉 **외부 출입 허용증** (프론트엔드에서 API 호출 가능하게)
- **꽂히는 단어**: **문 열어주기** (리소스/외부 접근 허용)

---

## 🔑 RedisConfig
- **역할**: Redis 연결 설정
- **핵심 포인트**
  - `LettuceConnectionFactory` → Redis 서버 연결
  - `StringRedisTemplate` → 문자열 기반 Redis 연산 지원
  - Refresh Token 저장소(TokenStore)에서 사용
- **꽂히는 단어**: **토큰 냉장고 전원 연결** (Redis에 Refresh Token 보관)

---

## 🔑 SecurityConfig
- **역할**: Spring Security 핵심 설정
- **핵심 포인트**
  - **기본 보안 비활성화**: CSRF, FormLogin, HttpBasic → JWT 기반으로만 인증
    👉 **기존 자물쇠 제거**
  - **세션 Stateless**: 서버 세션 대신 JWT로 인증 유지
    👉 **세션 없는 출입증**
  - **권한 설정**:
    - Swagger, 로그인, 업로드 등 → permitAll
    - 게시글 조회(GET) → permitAll
    - `/api/**` → JWT 인증 필요
    👉 **출입구마다 다른 보안 레벨**
  - **OAuth2 로그인 성공 핸들러 연결**: 소셜 로그인 성공 시 JWT 발급
    👉 **입국 심사대 연결**
  - **JWT 필터 추가**: 모든 요청 앞에서 토큰 검사
    👉 **보안 게이트 설치**
  - **CORS 설정**: 프론트엔드 포트(`3060`) 허용
    👉 **프론트와 백엔드 다리 연결**
- **꽂히는 단어**: **보안 관제실** (전체 출입 관리)

---  
1. **WebConfig** → 기본 문 열어주기 (리소스 + CORS)  
2. **RedisConfig** → 토큰 냉장고 준비  
3. **SecurityConfig** → 보안 관제실 세팅 (JWT + OAuth2 핸들러 + 필터)
 



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
```





★ security 먼저
---
```java
package com.thejoa703.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 설정값 바인딩
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String issuer;
    private String secret;
    private int accessTokenExpSeconds;
    private int refreshTokenExpSeconds;
    private String header;
    private String prefix;
}

```


```java
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

```



```java
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

```



```java
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

```




★ oauth2
---
```java
package com.thejoa703.oauth2;

/**
 * OAuth2 사용자 정보 인터페이스
 * - 공급자별 공통 속성 추출을 위한 계약
 */
public interface UserInfoOAuth2 {
    String getProvider();     // 공급자 이름 (google, kakao, naver)
    String getProviderId();   // 공급자 고유 사용자 ID
    String getEmail();        // 사용자 이메일
    String getNickname();     // 사용자 닉네임
    String getImage();        // 프로필 이미지 URL
}

```

```java
package com.thejoa703.oauth2;

import java.util.Map;
import lombok.AllArgsConstructor;

/**
 * Google OAuth2 사용자 정보 매핑
 */
@AllArgsConstructor
public class UserInfoGoogle implements UserInfoOAuth2 {
    private final Map<String, Object> attributes;

    @Override
    public String getProvider() { return "google"; }

    @Override
    public String getProviderId() {
        Object sub = attributes.get("sub");
        return sub != null ? sub.toString() : null;
    }

    @Override
    public String getEmail() {
        Object email = attributes.get("email");
        return email != null ? email.toString() : null;
    }

    @Override
    public String getNickname() {
        Object name = attributes.get("name");
        return name != null ? name.toString() : null;
    }

    @Override
    public String getImage() {
        Object picture = attributes.get("picture");
        return picture != null ? picture.toString() : "no.png";
    }
}

```


```java
package com.thejoa703.oauth2;

import java.util.Map;
import lombok.AllArgsConstructor;

/**
 * Kakao OAuth2 사용자 정보 매핑
 * - kakao_account / profile 구조를 안전하게 파싱
 */
@AllArgsConstructor
public class UserInfoKakao implements UserInfoOAuth2 {
    private final Map<String, Object> attributes;

    @Override
    public String getProvider() { return "kakao"; }

    @Override
    public String getProviderId() {
        Object id = attributes.get("id");
        return id != null ? id.toString() : null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getAccount() {
        Object account = attributes.get("kakao_account");
        return account instanceof Map ? (Map<String, Object>) account : null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getProfile() {
        Map<String, Object> account = getAccount();
        if (account != null) {
            Object profile = account.get("profile");
            return profile instanceof Map ? (Map<String, Object>) profile : null;
        }
        return null;
    }

    @Override
    public String getEmail() {
        Map<String, Object> account = getAccount();
        Object email = account != null ? account.get("email") : null;
        return email != null ? email.toString() : null;
    }

    @Override
    public String getNickname() {
        Map<String, Object> profile = getProfile();
        Object nickname = profile != null ? profile.get("nickname") : null;
        if (nickname != null) return nickname.toString();

        Object props = attributes.get("properties");
        if (props instanceof Map) {
            Object nk = ((Map<?, ?>) props).get("nickname");
            return nk != null ? nk.toString() : null;
        }
        return null;
    }

    @Override
    public String getImage() {
        Map<String, Object> profile = getProfile();
        Object img = profile != null ? profile.get("profile_image_url") : null; // ✅ 최신 필드명
        if (img != null) return img.toString();

        Object props = attributes.get("properties");
        if (props instanceof Map) {
            Object tn = ((Map<?, ?>) props).get("thumbnail_image");
            return tn != null ? tn.toString() : "no.png";
        }
        return "no.png";
    }
}

```


```java
package com.thejoa703.oauth2;

import java.util.Map;
import lombok.AllArgsConstructor;

/**
 * Naver OAuth2 사용자 정보 매핑
 * - response 객체 내부에서 값 추출
 */
@AllArgsConstructor
public class UserInfoNaver implements UserInfoOAuth2 {
    private final Map<String, Object> attributes;

    @SuppressWarnings("unchecked")
    private Map<String, Object> getResponse() {
        Object response = attributes.get("response");
        return response instanceof Map ? (Map<String, Object>) response : null;
    }

    @Override
    public String getProvider() { return "naver"; }

    @Override
    public String getProviderId() {
        Map<String, Object> resp = getResponse();
        Object id = resp != null ? resp.get("id") : null;
        return id != null ? id.toString() : null;
    }

    @Override
    public String getEmail() {
        Map<String, Object> resp = getResponse();
        Object email = resp != null ? resp.get("email") : null;
        return email != null ? email.toString() : null;
    }

    @Override
    public String getNickname() {
        Map<String, Object> resp = getResponse();
        Object nickname = resp != null ? resp.get("nickname") : null;
        return nickname != null ? nickname.toString() : null;
    }

    @Override
    public String getImage() {
        Map<String, Object> resp = getResponse();
        Object img = resp != null ? resp.get("profile_image") : null;
        return img != null ? img.toString() : "no.png";
    }
}

```


```java
package com.thejoa703.oauth2;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import lombok.Getter;

/**
 * ✅ JWT/OAuth2 사용자 통합 클래스
 * - JWT 사용자와 OAuth2 사용자 모두 UserDetails 기반으로 관리
 * - SecurityContext에서 principal 타입을 일관되게 유지
 */
@Getter
public class CustomOAuth2User implements OAuth2User, UserDetails {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private final Long id;              // ✅ JWT subject
    private final String provider;      // ✅ OAuth2 provider (google, kakao 등)
    private final String email;
    private final String nickname;
    private final String role;
    private final Map<String, Object> attributes;

    // ✅ JWT 사용자용 생성자
    public CustomOAuth2User(Long id, String role) {
        this.id = id;
        this.role = role;
        this.provider = null;
        this.email = null;
        this.nickname = null;
        this.attributes = null;
    }

    // ✅ OAuth2 사용자용 생성자
    public CustomOAuth2User(String provider, String email, String nickname,
                               String role, Map<String, Object> attributes) {
        this.id = null;
        this.provider = provider;
        this.email = email;
        this.nickname = nickname;
        this.role = role;
        this.attributes = attributes;
    }

    // OAuth2User 구현
    @Override
    public Map<String, Object> getAttributes() { return attributes; }

    @Override
    public String getName() { return email != null ? email : String.valueOf(id); }

    // UserDetails 구현
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() { return "N/A"; }    // ✅ JWT/OAuth2 모두 비밀번호 불필요

    @Override
    public String getUsername() { return email != null ? email : String.valueOf(id); }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    // 추가 getter
    public Long getId() { return id; }
    public String getProvider() { return provider; }
    public String getNickname() { return nickname; }
    public String getRole() { return role; }
}


```




```java
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
```



★ 각정설정파일들
---

```java
package com.thejoa703.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")   // application.yml에서 불러오기
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/** 요청을 실제 uploads 디렉토리와 매핑
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 모든 경로에 대해 CORS 허용
        registry.addMapping("/**")
                .allowedOrigins("*") // 필요 시 특정 도메인으로 제한 가능
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}

```



```java
package com.thejoa703.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.host}") 
    private String host;

    @Value("${spring.data.redis.port}") 
    private int port;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(LettuceConnectionFactory factory) {
        return new StringRedisTemplate(factory);
    }
}
```

```java
package com.thejoa703.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// ✅ CORS 관련 import
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.thejoa703.oauth2.OAuth2SuccessHandler;
import com.thejoa703.security.JwtAuthenticationFilter;
import com.thejoa703.security.JwtProvider;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security 설정
 *
 * - CSRF/FormLogin/HttpBasic 비활성화
 * - 세션을 Stateless로 설정 (JWT 기반 인증)
 * - Swagger/OpenAPI 경로 permitAll
 * - OAuth2 로그인 성공 핸들러 연결
 * - JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
 * - CORS 설정 포함
 * - PasswordEncoder Bean 등록
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 기본 보안 기능 비활성화
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 세션을 Stateless로
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 권한 설정
            .authorizeHttpRequests(auth -> auth
                // Swagger, 인증 관련 경로는 모두 허용
                .requestMatchers(
                    "/auth/**", "/login/**", "/oauth2/**",
                    "/swagger-ui/**", "/v3/api-docs/**",
                    "/swagger-resources/**", "/webjars/**",
                    "/configuration/**", "/upload/**"  , "/api/deptusers/**"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()  // 🔓 공개: 전체 조회만 허용
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()  //🔓 공개: 단건 조회도  필요
                .requestMatchers(HttpMethod.GET, "/api/posts/search/hashtag").permitAll() //해쉬태그
                .requestMatchers("/api/posts/paged").permitAll() 
                // API 요청은 JWT 인증 필요
                .requestMatchers("/api/**").authenticated()

                // 나머지는 모두 허용
                .anyRequest().permitAll()
            )

            // OAuth2 로그인은 소셜 로그인 전용으로만 사용
            .oauth2Login(oauth2 -> oauth2.successHandler(oAuth2SuccessHandler))

            // JWT 필터 추가
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
            throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ 실제 프론트엔드 포트와 맞추기 (3060)
        configuration.setAllowedOrigins(List.of("http://localhost:3060"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

```