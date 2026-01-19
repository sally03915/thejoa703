// ImageRepository.java
package com.thejoa703.repository;

import com.thejoa703.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image, Long> {}
