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
