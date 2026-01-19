//package com.thejoa703.controller;
//
//import java.util.List;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.thejoa703.domain.DeptUser;
//import com.thejoa703.dto.request.DeptUserUpdateRequestDto;
//import com.thejoa703.service.DeptUserService;
//
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.Parameter;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import lombok.RequiredArgsConstructor;
//
//@Tag(name = "DeptUser", description = "부서 사용자 API")
//@RestController
//@RequestMapping("/api/deptusers")
//@RequiredArgsConstructor
//public class DeptUserController {
//
//    private final DeptUserService deptUserService;
//
//    // 🔓 공개: 전체 조회
//    @Operation(summary = "부서 사용자 전체 조회 (공개)")
//    @GetMapping
//    public ResponseEntity<List<DeptUser>> findAll() {
//        return ResponseEntity.ok(deptUserService.findAll());
//    }
//
//    // 🔓 공개: 단건 조회
//    @Operation(summary = "부서 사용자 단건 조회 (공개)")
//    @GetMapping("/{deptno}")
//    public ResponseEntity<DeptUser> findById(
//            @Parameter(description = "부서 번호", example = "10")
//            @PathVariable(name = "deptno") Long deptno
//    ) {
//        DeptUser deptUser = deptUserService.findById(deptno);
//        return deptUser != null ? ResponseEntity.ok(deptUser) : ResponseEntity.notFound().build();
//    }
//
//    // 🔒 JWT 필요: 생성
//    @Operation(summary = "부서 사용자 생성 (JWT 인증 필요)")
//    @PostMapping
//    public ResponseEntity<DeptUser> create(
//            @RequestBody DeptUser deptUser
//    ) {
//        return ResponseEntity.ok(deptUserService.create(deptUser));
//    }
//
//    // 🔒 JWT 필요: 수정 
//    @Operation(summary = "부서 사용자 수정 (JWT 인증 필요)")
//    @PutMapping("/{deptno}")
//    public ResponseEntity<DeptUser> update(
//            @Parameter(description = "부서 번호", example = "20")
//            @PathVariable("deptno") Long deptno,
//            @RequestBody DeptUserUpdateRequestDto requestDto
//    ) {
//        DeptUser deptUser = new DeptUser();
//        deptUser.setDeptno(deptno);
//        deptUser.setDname(requestDto.getDname());
//        deptUser.setLoc(requestDto.getLoc());
//
//        return ResponseEntity.ok(deptUserService.update(deptUser));
//    }
//
//
//    // 🔒 JWT 필요: 삭제
//    @Operation(summary = "부서 사용자 삭제 (JWT 인증 필요)")
//    @DeleteMapping("/{deptno}")
//    public ResponseEntity<Void> delete(
//            @Parameter(description = "부서 번호", example = "30")
//            @PathVariable(name = "deptno") Long deptno
//    ) {
//        deptUserService.delete(deptno);
//        return ResponseEntity.noContent().build();
//    }
//
//    // ✅ MyBatis 특수 쿼리: 지역 검색
//    @Operation(summary = "특정 지역으로 부서 사용자 검색 (MyBatis)")
//    @GetMapping("/location/{loc}")
//    public ResponseEntity<List<DeptUser>> findByLocation(
//            @Parameter(description = "지역명", example = "DALLAS")
//            @PathVariable(name = "loc") String loc
//    ) {
//        return ResponseEntity.ok(deptUserService.findByLocation(loc));
//    }
//
//    // ✅ MyBatis 특수 쿼리: 이름 키워드 검색
//    @Operation(summary = "부서명 키워드로 검색 (MyBatis)")
//    @GetMapping("/search")
//    public ResponseEntity<List<DeptUser>> findByNameKeyword(
//            @Parameter(description = "검색 키워드", example = "SALES")
//            @RequestParam(name = "keyword") String keyword
//    ) {
//        return ResponseEntity.ok(deptUserService.findByNameKeyword(keyword));
//    }
//}
