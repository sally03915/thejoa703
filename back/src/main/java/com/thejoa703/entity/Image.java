package com.thejoa703.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "IMAGES")
@Getter @Setter
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "image_seq")
    @SequenceGenerator(name = "image_seq", sequenceName = "IMAGE_SEQ", allocationSize = 1)
    private Long id; // PK

    @Column(length = 200, nullable = false)
    private String src; // 이미지 URL

    @ManyToOne @JoinColumn(name = "POST_ID", nullable = false)
    private Post post; // 어떤 게시글에 속한 이미지인지
}
