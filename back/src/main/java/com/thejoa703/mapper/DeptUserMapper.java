package com.thejoa703.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.thejoa703.domain.DeptUser;

@Mapper
public interface DeptUserMapper {
    // ✅ 특수 쿼리: 특정 지역(loc)으로 검색
    List<DeptUser> findByLocation(String loc);

    // ✅ 특수 쿼리: 이름에 특정 키워드 포함
    List<DeptUser> findByNameKeyword(String keyword);
}
