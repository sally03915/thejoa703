package com.thejoa703.repository;

import com.thejoa703.domain.DeptUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeptUserRepository extends JpaRepository<DeptUser, Long> {
    // 기본 CRUD는 JpaRepository가 자동 제공
}
////save(), findById(), findAll(), deleteById() 같은 CRUD는 바로 사용 가능