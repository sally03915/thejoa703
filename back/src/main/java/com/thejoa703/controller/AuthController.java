package com.thejoa703.controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.thejoa703.dto.request.LoginRequest;
import com.thejoa703.dto.request.UserRequestDto;
import com.thejoa703.dto.response.UserResponseDto;
import com.thejoa703.security.JwtProperties;
import com.thejoa703.security.JwtProvider;
import com.thejoa703.security.TokenStore;
import com.thejoa703.service.AppUserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * 인증/사용자 관련 컨트롤러
 * - 회원가입, 로그인, 닉네임 변경, 프로필 이미지 업로드, 삭제
 * - JWT + Redis 기반 토큰 발급/재발급/로그아웃 포함
 */
@Tag(name = "Auth", description = "회원 인증 관련 API (Oracle 호환)")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtProvider jwtProvider;     
    private final TokenStore tokenStore;       
    private final JwtProperties props;         
    private final AppUserService appUserService; 

    // ✅ 회원가입
    @Operation(summary = "회원가입")
    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDto> signup(
            @ModelAttribute UserRequestDto request,
            @RequestPart(name = "ufile", required = false) MultipartFile ufile
    ) {
        return ResponseEntity.ok(appUserService.signup(request, ufile));
    }

    // ✅ 로그인 (Access Token + Refresh Token 발급)
    @Operation(summary = "로그인 (Access Token + Refresh Token 발급)")
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        UserResponseDto user = appUserService.login(request);

        String accessToken = jwtProvider.createAccessToken(
                user.getId().toString(),
                Map.of("role", user.getRole())
        );

        String refreshToken = jwtProvider.createRefreshToken(user.getId().toString());

        tokenStore.saveRefreshToken(
                user.getId().toString(),
                refreshToken,
                (long) props.getRefreshTokenExpSeconds()
        );

        // ✅ Refresh Token을 HttpOnly Cookie로 내려줌
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(props.getRefreshTokenExpSeconds())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "user", user
        ));
    }

    // ✅ 현재 로그인한 사용자 정보 조회
    @Operation(summary = "현재 로그인한 사용자 정보 조회")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> me(HttpServletRequest request,
                                              @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        try {
            // 우선 Authorization 헤더에서 Access Token 확인
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                var claims = jwtProvider.parse(token).getBody();
                String userId = claims.getSubject();
                UserResponseDto user = appUserService.findById(Long.valueOf(userId));
                return ResponseEntity.ok(user);
            }
            // Access Token이 없으면 refreshToken 쿠키로 확인
            if (refreshToken != null) {
                var claims = jwtProvider.parse(refreshToken).getBody();
                String userId = claims.getSubject();
                UserResponseDto user = appUserService.findById(Long.valueOf(userId));
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    // ✅ 닉네임 변경
    @Operation(summary = "닉네임 변경")
    @PatchMapping("/{userId}/nickname")
    public ResponseEntity<UserResponseDto> updateNickname(
            @PathVariable("userId") Long userId,
            @RequestParam("nickname") String nickname
    ) {
        return ResponseEntity.ok(appUserService.updateNickname(userId, nickname));
    }

    // ✅ 프로필 이미지 업로드/교체
    @Operation(summary = "프로필 이미지 업로드/교체")
    @PostMapping(value = "/{userId}/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponseDto> updateProfileImage(
            @PathVariable("userId") Long userId,
            @RequestParam("ufile") MultipartFile ufile
    ) {
        return ResponseEntity.ok(appUserService.updateProfileImage(userId, ufile));
    }
    ///////////////////////////
    /*
    // ✅ 사용자 삭제 (soft delete)
    @Operation(summary = "사용자 삭제(soft delete)")
    @DeleteMapping
    public ResponseEntity<Void> deleteByEmail(@RequestParam("email") String email) {
        appUserService.deleteByEmail(email);
        return ResponseEntity.noContent().build();
    }*/
    
 // ✅ 회원 탈퇴 (현재 로그인 사용자 기준)
    @Operation(summary = "회원 탈퇴")
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(HttpServletRequest request,
                                         HttpServletResponse response,
                                         @CookieValue(name = "refreshToken", required = false) String refreshToken) {
        try {
            // 1. Access Token 확인 (Authorization 헤더 필수)
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // Swagger나 React에서 Bearer 토큰을 헤더에 붙이지 않으면 401
                return ResponseEntity.status(401).build();
            }

            // 2. Access Token 파싱 → 사용자 ID 추출
            String accessToken = authHeader.substring(7);
            var claims = jwtProvider.parse(accessToken).getBody();
            String userId = claims.getSubject();

            // 3. 사용자 삭제 (soft delete 또는 hard delete)
            appUserService.deleteById(Long.valueOf(userId));

            // 4. Refresh Token 제거 (Redis 등 토큰 저장소에서 삭제)
            if (refreshToken != null) {
                tokenStore.deleteRefreshToken(userId);
            }

            // 5. Refresh Token 쿠키 삭제 (HttpOnly 쿠키 제거)
            ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(0)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // 토큰 파싱 실패나 기타 예외 발생 시 401 반환
            return ResponseEntity.status(401).build();
        }
    }



    // ✅ 전체 사용자 수 조회
    @Operation(summary = "전체 사용자 수 조회")
    @GetMapping("/count")
    public ResponseEntity<Long> countUsers() {
        return ResponseEntity.ok(appUserService.countUsers());
    }

    // ✅ 이메일 중복 확인
    @Operation(summary = "이메일 중복 확인")
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(appUserService.existsByEmail(email));
    }

    // ✅ 닉네임 중복 확인
    @Operation(summary = "닉네임 중복 확인")
    @GetMapping("/check-nickname")
    public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
        return ResponseEntity.ok(appUserService.existsByNickname(nickname));
    }

    // ✅ Access Token 재발급
    @Operation(summary = "Access Token 재발급")
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@CookieValue("refreshToken") String refreshToken) {
        var claims = jwtProvider.parse(refreshToken).getBody();
        String userId = claims.getSubject();

        String stored = tokenStore.getRefreshToken(userId);
        if (stored == null || !stored.equals(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid refresh token"));
        }

        String role = appUserService.findRoleByUserId(Long.valueOf(userId));

        String newAccessToken = jwtProvider.createAccessToken(
                userId,
                Map.of("role", role)
        );

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    // ✅ 로그아웃
    @Operation(summary = "로그아웃")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue("refreshToken") String refreshToken,
                                       HttpServletResponse response) {
        var claims = jwtProvider.parse(refreshToken).getBody();
        String userId = claims.getSubject();

        tokenStore.deleteRefreshToken(userId);

        // ✅ Refresh Token 쿠키 삭제 (MaxAge=0)
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

        return ResponseEntity.noContent().build();
    }
}
