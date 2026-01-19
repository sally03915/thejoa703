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
