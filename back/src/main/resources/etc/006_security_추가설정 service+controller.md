## 🚦 실행 순서
1. **Redis 서버 실행**  
   - Refresh Token을 저장하는 **토큰 냉장고** 역할.  
   - 반드시 켜둬야 로그인/재발급/로그아웃이 정상 동작합니다.

2. **Spring Boot 서버 실행**  
   - SecurityConfig에서 JWT 필터, OAuth2SuccessHandler, Redis 연결까지 다 준비되어 있습니다.  
   - 서버가 뜨면 Swagger UI도 자동으로 열립니다.

3. **Swagger UI 접속**  
   - `/swagger-ui/index.html` 들어가서 API 테스트.  
   - 회원가입 → 로그인 → Access Token/Refresh Token 발급 → 이후 API 호출 시 Authorization 헤더에 `Bearer <accessToken>` 붙여서 테스트.

---

## 📝 Swagger에서 테스트할 때 체크 포인트
- **회원가입**: `/auth/signup` → 사용자 생성.  
- **로그인**: `/auth/login` → Access Token + Refresh Token 쿠키 발급.  
- **me 조회**: `/auth/me` → 현재 로그인 사용자 정보 확인.  
- **닉네임 변경/프로필 이미지 업로드**: JWT 인증 필요.  
- **게시글/댓글/팔로우/좋아요 API**: JWT 인증 필요. Swagger에서 Authorize 버튼 눌러 Access Token 입력.  
- **Refresh Token 재발급**: `/auth/refresh` → Redis에 저장된 Refresh Token으로 새 Access Token 발급.  
- **로그아웃/회원탈퇴**: Refresh Token 삭제 + 쿠키 제거.

---

## ✅ 정리
- 네, 지금처럼 설정하고 **Redis 켜고 → 서버 실행 → Swagger로 API 호출**하면 됩니다.  
- Swagger에서 Access Token을 붙여 호출하면 JWT 필터가 인증을 처리하고, Redis는 Refresh Token을 관리합니다.  
- 즉, **Redis는 토큰 냉장고, Swagger는 테스트 무대**라고 생각하시면 됩니다.
 



```java
package com.thejoa703.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import com.thejoa703.oauth2.CustomOAuth2User;

/**
 * ✅ JWT 인증 사용자 정보 서비스
 * - Authentication에서 CustomOAuth2User를 꺼내 현재 로그인한 사용자 정보를 제공
 */
@Component
public class AuthUserJwtService {

    /**
     * 현재 로그인한 사용자 ID 반환
     */
    public Long getCurrentUserId(Authentication authentication) {
        CustomOAuth2User userPrincipal = (CustomOAuth2User) authentication.getPrincipal();
        return userPrincipal.getId();
    }

    /**
     * 현재 로그인한 사용자 이메일 반환 (OAuth2 사용자용)
     */
    public String getCurrentUserEmail(Authentication authentication) {
        CustomOAuth2User userPrincipal = (CustomOAuth2User) authentication.getPrincipal();
        return userPrincipal.getEmail();
    }

    /**
     * 현재 로그인한 사용자 닉네임 반환
     */
    public String getCurrentUserNickname(Authentication authentication) {
        CustomOAuth2User userPrincipal = (CustomOAuth2User) authentication.getPrincipal();
        return userPrincipal.getNickname();
    }
}

```

★ 추가 컨트롤러
---

```java
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

```



```java
package com.thejoa703.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*; // ✅ import 정리: 모든 mapping 어노테이션 포함

import com.thejoa703.dto.request.CommentRequestDto;
import com.thejoa703.dto.response.CommentResponseDto;
import com.thejoa703.service.AuthUserJwtService;
import com.thejoa703.service.CommentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter; // ✅ Swagger 파라미터 설명 추가
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Comment", description = "댓글 API")
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final AuthUserJwtService authUserJwtService; // ✅ JWT 토큰에서 userId 추출 서비스

    // 🔒 JWT 필요: 댓글 작성
    @Operation(summary = "댓글 작성 (JWT 인증 필요)")
    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            Authentication authentication,
            @RequestBody CommentRequestDto dto
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(commentService.createComment(userId, dto));
    }

    // 🔓 공개: 게시글의 댓글 조회
    @Operation(summary = "게시글의 댓글 조회 (공개)")
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponseDto>> getCommentsByPost(
            @Parameter(description = "조회할 게시글 ID") 
            @PathVariable("postId") Long postId
    ) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    // 🔒 JWT 필요: 댓글 수정
    @Operation(summary = "댓글 수정 (JWT 인증 필요)")
    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            Authentication authentication,
            @Parameter(description = "수정할 댓글 ID") 
            @PathVariable("commentId") Long commentId,
            @RequestBody CommentRequestDto dto // ✅ 변경: RequestParam → RequestBody DTO
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(commentService.updateComment(userId, commentId, dto)); // ✅ userId 전달
    }

    // 🔒 JWT 필요: 댓글 삭제
    @Operation(summary = "댓글 삭제 (JWT 인증 필요)")
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            Authentication authentication,
            @Parameter(description = "삭제할 댓글 ID") 
            @PathVariable("commentId") Long commentId
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        commentService.deleteComment(userId, commentId); // ✅ userId 전달
        return ResponseEntity.noContent().build();
    }
}

```



```java
// src/main/java/com/thejoa703/controller/FollowController.java
package com.thejoa703.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.thejoa703.dto.request.BlockRequestDto;
import com.thejoa703.dto.request.FollowRequestDto;
import com.thejoa703.dto.response.BlockResponseDto;
import com.thejoa703.dto.response.FollowResponseDto;
import com.thejoa703.service.AuthUserJwtService;
import com.thejoa703.service.FollowService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowService followService;
    private final AuthUserJwtService authUserJwtService;

    @PostMapping
    public ResponseEntity<?> follow(Authentication authentication,
                                    @Valid @RequestBody FollowRequestDto dto) {
        try {
            Long followerId = authUserJwtService.getCurrentUserId(authentication);
            FollowResponseDto body = followService.follow(followerId, dto);
            // Idempotent: always 200 OK with current state
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping("/me/followings")
    public ResponseEntity<List<FollowResponseDto>> getMyFollowings(Authentication authentication) {
        Long followerId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(followService.getFollowings(followerId));
    }

    @GetMapping("/me/followers")
    public ResponseEntity<List<FollowResponseDto>> getMyFollowers(Authentication authentication) {
        Long followeeId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(followService.getFollowers(followeeId));
    }

    @GetMapping("/me/followings/count")
    public ResponseEntity<Long> countMyFollowings(Authentication authentication) {
        Long followerId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(followService.countFollowings(followerId));
    }

    @GetMapping("/me/followers/count")
    public ResponseEntity<Long> countMyFollowers(Authentication authentication) {
        Long followeeId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(followService.countFollowers(followeeId));
    }

    @DeleteMapping
    public ResponseEntity<?> unfollow(Authentication authentication,
                                      @Valid @RequestBody FollowRequestDto dto) {
        Long followerId = authUserJwtService.getCurrentUserId(authentication);
        Long followeeId = followService.unfollow(followerId, dto.getFolloweeId());
        return ResponseEntity.ok().body(followeeId);
    }

    @PatchMapping("/block")
    public ResponseEntity<?> updateBlock(Authentication authentication,
                                         @Valid @RequestBody BlockRequestDto dto) {
        try {
            Long currentUserId = authUserJwtService.getCurrentUserId(authentication);
            if (Boolean.TRUE.equals(dto.getBlocked())) {
                followService.block(currentUserId, dto.getTargetUserId());
                return ResponseEntity.ok(new BlockResponseDto(currentUserId, dto.getTargetUserId(), true));
            } else {
                followService.unblock(currentUserId, dto.getTargetUserId());
                return ResponseEntity.ok(new BlockResponseDto(currentUserId, dto.getTargetUserId(), false));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}

```



```java
package com.thejoa703.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.thejoa703.dto.request.LikeRequestDto;
import com.thejoa703.dto.response.LikeResponseDto;
import com.thejoa703.service.AuthUserJwtService;
import com.thejoa703.service.PostLikeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Like", description = "좋아요 API")
@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {

    private final PostLikeService likeService;
    private final AuthUserJwtService authUserJwtService;

    // 🔒 JWT 필요: 좋아요 추가
    @Operation(summary = "좋아요 추가 (JWT 인증 필요)")
    @PostMapping
    public ResponseEntity<LikeResponseDto> addLike(
            Authentication authentication,
            @RequestBody LikeRequestDto dto
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        LikeResponseDto response = likeService.addLike(userId, dto);
        return ResponseEntity.ok(response);
    }

    // 🔓 공개: 게시글 좋아요 수 조회
    @Operation(summary = "게시글 좋아요 수 조회 (공개)")
    @GetMapping("/count/{postId}")
    public ResponseEntity<LikeResponseDto> countLikes(
            @Parameter(description = "좋아요 수를 조회할 게시글 ID")
            @PathVariable("postId") Long postId
    ) {
        Long count = likeService.countLikes(postId);
        return ResponseEntity.ok(
            LikeResponseDto.builder()
                .postId(postId)
                .count(count)
                .build()
        );
    }

    // 🔒 JWT 필요: 좋아요 취소
    @Operation(summary = "좋아요 취소 (JWT 인증 필요)")
    @DeleteMapping("/{postId}")
    public ResponseEntity<LikeResponseDto> removeLike(
            Authentication authentication,
            @Parameter(description = "좋아요 취소할 게시글 ID")
            @PathVariable("postId") Long postId
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        LikeResponseDto response = likeService.removeLike(userId, postId); // ✅ 바뀐 부분
        return ResponseEntity.ok(response);
    }
}

```



```java
package com.thejoa703.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // ✅ JWT 인증된 사용자 정보 접근
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile; // ✅ 파일 업로드 처리

import com.thejoa703.dto.request.PostRequestDto;
import com.thejoa703.dto.response.PostResponseDto;
import com.thejoa703.service.AuthUserJwtService;
import com.thejoa703.service.PostService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * ✅ PostController
 * - 게시글 CRUD API
 * - 페이징 조회, 좋아요 조회, 해시태그 검색
 * - 내가 쓴 글 + 내가 리트윗한 글 조회 추가
 */
@Tag(name = "Post", description = "게시글 API")
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final AuthUserJwtService authUserJwtService; // ✅ JWT 토큰에서 userId 추출하는 헬퍼 서비스

    // 🔓 공개: 전체 게시글 조회
    @Operation(summary = "게시글 전체 조회 (공개)")
    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    // 🔓 공개: 게시글 단건 조회
    @Operation(summary = "게시글 단건 조회 (공개)")
    @GetMapping("/{postId}")
    public ResponseEntity<PostResponseDto> getPost(
            @PathVariable(name = "postId") Long postId
    ) {
        return ResponseEntity.ok(postService.getPost(postId));
    }
    
    // ✅ 전체 게시글 페이징 조회
    @Operation(summary = "전체 게시글 페이징 조회 (공개)")
    @GetMapping("/paged")
    public ResponseEntity<List<PostResponseDto>> getAllPostsPaged(
            @RequestParam(name = "page" , defaultValue = "1") int page,
            @RequestParam(name = "size" ,  defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getAllPostsPaged(page, size));
    }

    // ✅ 특정 유저가 좋아요한 게시글 페이징 조회
    @Operation(summary = "좋아요한 게시글 페이징 조회 (JWT 인증 필요)")
    @GetMapping("/liked")
    public ResponseEntity<List<PostResponseDto>> getLikedPostsPaged(
            Authentication authentication,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(postService.getLikedPostsPaged(userId, page, size));
    }

    // 🔒 JWT 필요: 게시글 작성
    @Operation(summary = "게시글 작성 (JWT 인증 필요)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponseDto> createPost(
            Authentication authentication,
            @ModelAttribute PostRequestDto dto,
            @Parameter(description = "업로드할 이미지 파일")
            @RequestPart(name = "files", required = false) List<MultipartFile> files
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(postService.createPost(userId, dto, files));
    }

    // 🔓 공개: 해시태그 검색
    @Operation(summary = "해시태그로 게시글 검색 (공개)")
    @GetMapping("/search/hashtag")
    public ResponseEntity<List<PostResponseDto>> searchByHashtag(
            @RequestParam("tag") String tag
    ) {
        return ResponseEntity.ok(postService.getPostsByHashtag(tag));
    }

    // 🔒 JWT 필요: 게시글 수정
    @Operation(summary = "게시글 수정 (JWT 인증 필요)")
    @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponseDto> updatePost(
            Authentication authentication,
            @PathVariable(name = "postId") Long postId,
            @ModelAttribute PostRequestDto dto,
            @Parameter(description = "업로드할 이미지 파일")
            @RequestPart(name = "files", required = false) List<MultipartFile> files
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(postService.updatePost(userId, postId, dto, files));
    }

    // 🔒 JWT 필요: 게시글 삭제
    @Operation(summary = "게시글 삭제 (JWT 인증 필요)")
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(
            Authentication authentication,
            @PathVariable(name = "postId") Long postId
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        postService.deletePost(userId, postId);
        return ResponseEntity.noContent().build();
    }
    
    // ✅ 변경: 내가 쓴 글 + 내가 리트윗한 글 페이징 조회
    @Operation(summary = "내가 쓴 글 + 내가 리트윗한 글 페이징 조회 (Oracle 11g ROWNUM 기반, JWT 인증 필요)")
    @GetMapping("/myPostRetweets/paged") // ✅ 변경: 엔드포인트 추가
    public ResponseEntity<List<PostResponseDto>> getMyPostsAndRetweetsPaged(
            Authentication authentication,
            @RequestParam(name = "page" , defaultValue = "1") int page,
            @RequestParam(name = "size" ,  defaultValue = "10") int size
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication); 
        List<PostResponseDto> result = postService.getMyPostsAndRetweetsPaged(userId, page, size); // ✅ 변경: 서비스 호출
        return ResponseEntity.ok(result);
    }
}

```



```java
package com.thejoa703.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.thejoa703.dto.request.RetweetRequestDto;
import com.thejoa703.dto.response.RetweetResponseDto;
import com.thejoa703.service.AuthUserJwtService;
import com.thejoa703.service.RetweetService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * ✅ RetweetController
 * - 리트윗 추가, 여부 확인, 취소, 카운트 조회, 내가 리트윗한 글 목록 조회
 */
@Tag(name = "Retweet", description = "리트윗 API")
@RestController
@RequestMapping("/api/retweets")
@RequiredArgsConstructor
public class RetweetController {

    private final RetweetService retweetService;
    private final AuthUserJwtService authUserJwtService;

    // 🔒 JWT 필요: 리트윗 추가
    @Operation(summary = "리트윗 추가 (JWT 인증 필요)")
    @PostMapping
    public ResponseEntity<RetweetResponseDto> addRetweet(
            Authentication authentication,
            @RequestBody RetweetRequestDto dto
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(retweetService.addRetweet(userId, dto)); // ✅ 변경: 응답에 retweetCount 포함
    }

    // 🔒 JWT 필요: 리트윗 여부 확인
    @Operation(summary = "리트윗 여부 확인 (JWT 인증 필요)")
    @GetMapping("/{postId}")
    public ResponseEntity<Boolean> hasRetweeted(
            Authentication authentication,
            @Parameter(description = "리트윗 여부를 확인할 게시글 ID")
            @PathVariable("postId") Long postId
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(retweetService.hasRetweeted(userId, postId));
    }

    // 🔒 JWT 필요: 리트윗 취소
    @Operation(summary = "리트윗 취소 (JWT 인증 필요)")
    @DeleteMapping("/{postId}")
    public ResponseEntity<RetweetResponseDto> removeRetweet( // ✅ 변경: Void → RetweetResponseDto
            Authentication authentication,
            @Parameter(description = "리트윗 취소할 게시글 ID")
            @PathVariable("postId") Long postId
    ) {
        Long userId = authUserJwtService.getCurrentUserId(authentication);
        return ResponseEntity.ok(retweetService.removeRetweet(userId, postId)); // ✅ 변경: 최신 카운트 포함 응답
    }

    // ✅ 추가: 특정 게시글의 리트윗 수 조회
    @Operation(summary = "특정 게시글의 리트윗 수 조회")
    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> countRetweets(
            @Parameter(description = "리트윗 수를 확인할 게시글 ID")
            @PathVariable("postId") Long postId
    ) {
        return ResponseEntity.ok(retweetService.countRetweets(postId));
    }

    // ✅ 추가: 내가 리트윗한 글 목록 조회
    @Operation(summary = "내가 리트윗한 글 목록 조회 (JWT 인증 필요)")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Long>> getMyRetweets(
            Authentication authentication,
            @Parameter(description = "리트윗한 글을 조회할 사용자 ID")
            @PathVariable("userId") Long userId
    ) {
        Long currentUserId = authUserJwtService.getCurrentUserId(authentication);
        if (!currentUserId.equals(userId)) {
            return ResponseEntity.status(403).build(); // 권한 없음
        }
        return ResponseEntity.ok(retweetService.findMyRetweets(userId)); // ✅ 변경: 내가 리트윗한 글 목록 반환
    }
}

```