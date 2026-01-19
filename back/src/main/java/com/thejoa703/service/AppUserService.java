package com.thejoa703.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.thejoa703.dto.request.UserRequestDto;
import com.thejoa703.dto.request.LoginRequest;
import com.thejoa703.dto.response.UserResponseDto;
import com.thejoa703.entity.AppUser;
import com.thejoa703.repository.AppUserRepository;
import com.thejoa703.util.FileStorageService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AppUserService {

    private final AppUserRepository appUserRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PROFILE_IMAGE = "uploads/default.png";

    // ✅ Create: 회원가입
    public UserResponseDto signup(UserRequestDto request, MultipartFile profileImage) {
        String provider = request.getProvider() != null ? request.getProvider() : "local";

        if (appUserRepository.findByEmailAndProvider(request.getEmail(), provider).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 사용자입니다.");
        }

        if (appUserRepository.countByNickname(request.getNickname()) > 0) {
            throw new IllegalArgumentException("이미 사용중인 닉네임입니다.");
        }

        AppUser user = new AppUser();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        user.setProvider(provider);
        user.setRole("ROLE_USER");
        user.setUfile(profileImage != null && !profileImage.isEmpty()
                ? fileStorageService.upload(profileImage)
                : DEFAULT_PROFILE_IMAGE);

        return UserResponseDto.fromEntity(appUserRepository.save(user));
    }

    // ✅ Read: 로그인
    public UserResponseDto login(LoginRequest request) {
        AppUser user = appUserRepository.findByEmailAndProvider(
                request.getEmail(),
                request.getProvider() != null ? request.getProvider() : "local"
        ).orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }
        return UserResponseDto.fromEntity(user);
    }

    // ✅ Read: 사용자 조회 by email+provider
    public Optional<AppUser> findByEmailAndProvider(String email, String provider) {
        return appUserRepository.findByEmailAndProvider(email, provider);
    }

    // ✅ Read: 사용자 조회 by ID (추가)
    public UserResponseDto findById(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        return UserResponseDto.fromEntity(user);
    }

    // ✅ Update: 닉네임 변경
    public UserResponseDto updateNickname(Long userId, String newNickname) {
        if (appUserRepository.countByNickname(newNickname) > 0) {
            throw new IllegalArgumentException("이미 사용중인 닉네임입니다.");
        }
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        user.setNickname(newNickname);
        return UserResponseDto.fromEntity(appUserRepository.save(user));
    }

    // ✅ Update: 프로필 이미지 변경
    public UserResponseDto updateProfileImage(Long userId, MultipartFile profileImage) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        user.setUfile(profileImage != null && !profileImage.isEmpty()
                ? fileStorageService.upload(profileImage)
                : DEFAULT_PROFILE_IMAGE);
        return UserResponseDto.fromEntity(appUserRepository.save(user));
    }

	//    // ✅ Delete: soft delete
	//    public void deleteByEmail(String email) {
	//        AppUser user = appUserRepository.findByEmailAndProvider(email, "local")
	//                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
	//        user.setDeleted(true);
	//        appUserRepository.save(user);
	//    }
    
    // ✅ 신규: ID로 삭제
    public void deleteById(Long userId) { appUserRepository.deleteById(userId); }

    // ✅ Count: 전체 사용자 수
    public long countUsers() {
        return appUserRepository.count();
    }

    // ✅ 이메일 중복 여부 확인
    public boolean existsByEmail(String email) {
        return appUserRepository.countByEmail(email) > 0;
    }

    // ✅ 닉네임 중복 여부 확인
    public boolean existsByNickname(String nickname) {
        return appUserRepository.countByNickname(nickname) > 0;
    }

    // ✅ 소셜 사용자 저장
    public AppUser saveSocialUser(String email,
                                  String provider,
                                  String providerId,
                                  String nickname,
                                  String image) {
        AppUser user = AppUser.builder()
                .email(email)
                .provider(provider)
                .providerId(providerId)
                .nickname(nickname)
                .ufile(image)
                .role("ROLE_USER")
                .build();
        return appUserRepository.save(user);
    }

    // ✅ 권한 조회
    public String findRoleByUserId(Long userId) {
        return appUserRepository.findById(userId)
                .map(AppUser::getRole)
                .orElse("ROLE_USER");
    }
}
