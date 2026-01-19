package com.thejoa703.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "RETWEETS",
    uniqueConstraints = @UniqueConstraint(
        name = "UK_RETWEET_USER_ORIG",
        columnNames = {"APP_USER_ID", "ORIGINAL_POST_ID"})) // 유저+원본글 조합 유니크
@Getter @Setter @NoArgsConstructor
public class Retweet {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "retweet_seq")
    @SequenceGenerator(name = "retweet_seq", sequenceName = "RETWEET_SEQ", allocationSize = 1)
    private Long id; // PK

    @ManyToOne @JoinColumn(name = "APP_USER_ID", nullable = false)
    private AppUser user; // 리트윗한 사람

    @ManyToOne @JoinColumn(name = "ORIGINAL_POST_ID", nullable = false)
    private Post originalPost; // 원본 게시글

    @Column(nullable = false)
    private LocalDateTime createdAt; // 리트윗 시점

    @PrePersist void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Retweet(AppUser user, Post originalPost) {
        this.user = user;
        this.originalPost = originalPost;
    }
}
