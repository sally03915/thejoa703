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
