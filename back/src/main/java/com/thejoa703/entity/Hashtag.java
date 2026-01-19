package com.thejoa703.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "HASHTAGS")
@Getter @Setter
public class Hashtag {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hashtag_seq")
    @SequenceGenerator(name = "hashtag_seq", sequenceName = "HASHTAG_SEQ", allocationSize = 1)
    private Long id; // PK

    @Column(length = 200, nullable = false, unique = true)
    private String name; // 해시태그 이름 (#springboot)

    @ManyToMany(mappedBy = "hashtags")
    private List<Post> posts = new ArrayList<>(); // 어떤 게시글들이 이 해시태그를 쓰는지
}
