package com.thejoa703.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "POST_LIKES",
    uniqueConstraints = @UniqueConstraint(columnNames = {"APP_USER_ID", "POST_ID"})) // ✅ 유저+게시글 조합 유니크
@Getter @Setter @NoArgsConstructor
public class PostLike {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_like_seq")
    @SequenceGenerator(name = "post_like_seq", sequenceName = "POST_LIKE_SEQ", allocationSize = 1)
    private Long id; // ✅ PK

    @ManyToOne @JoinColumn(name = "APP_USER_ID", nullable = false)
    private AppUser user; // ✅ 좋아요 누른 사람

    @ManyToOne @JoinColumn(name = "POST_ID", nullable = false)
    private Post post; // ✅ 좋아요 대상 게시글

    @Column(nullable = false)
    private LocalDateTime createdAt; // ✅ 좋아요 누른 시점

    @PrePersist void onCreate() { this.createdAt = LocalDateTime.now(); }

    public PostLike(AppUser user, Post post) {
        this.user = user;
        this.post = post;
    }
}
