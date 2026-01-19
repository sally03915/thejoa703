package com.thejoa703.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.thejoa703.entity.Hashtag;

//HashtagRepository.java
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
	Optional<Hashtag> findByName(String name);

	@Query("SELECT  h FROM Hashtag h JOIN FETCH h.posts WHERE h.name = :name")
	Optional<Hashtag> findByNameWithPosts(@Param("name") String name);

	List<Hashtag> findByNameContaining(String keyword); // ✅ 수정
}
