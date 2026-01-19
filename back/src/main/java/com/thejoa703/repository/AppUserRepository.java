package com.thejoa703.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.thejoa703.entity.AppUser;

/**
 * 사용자 레포지토리
 * - email + provider 기반 조회
 * - soft delete 고려한 조회 메서드 추가
 * - Oracle 환경 호환성을 고려해 existsBy 대신 countBy 기반 메서드 사용
 */
@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    // email + provider로 사용자 조회 (Unique 제약 반영)
    Optional<AppUser> findByEmailAndProvider(String email, String provider);

	//    // soft delete 고려한 조회
	//    Optional<AppUser> findByEmailAndProviderAndDeletedFalse(String email, String provider);
    
    // ✅ ID로 삭제
    void deleteById(Long id);
    

    // provider 구분 없는 조회 (특수 케이스에서만 사용)
    Optional<AppUser> findByEmail(String email);

    // 닉네임 중복 검증 (count 기반)
    long countByNickname(String nickname);

    // 이메일 중복 검증 (count 기반)
    long countByEmail(String email);

    // ✅ 닉네임 중복 체크 (Oracle 호환)
    default boolean existsByNicknameSafe(String nickname) {
        return countByNickname(nickname) > 0;
    }

    // ✅ 이메일 중복 체크 (Oracle 호환)
    default boolean existsByEmailSafe(String email) {
        return countByEmail(email) > 0;
    }
}
