package com.thejoa703.entity; // 엔티티 패키지

import jakarta.persistence.*; // JPA 관련 어노테이션들
import lombok.*;              // Lombok으로 getter/setter, 생성자 자동 생성
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 사용자 엔티티
 * - local + oauth2 통합
 * - (email, provider) 유니크 제약
 * - 소셜 사용자는 password가 null일 수 있음
 */
@Entity // JPA 엔티티 선언
@Table(name = "APPUSER",
    uniqueConstraints = @UniqueConstraint(
        name = "UK_APPUSER_EMAIL_PROVIDER", // 이메일+provider 조합 유니크
        columnNames = {"EMAIL", "PROVIDER"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appuser_seq") // 시퀀스 사용
    @SequenceGenerator(name = "appuser_seq", sequenceName = "APPUSER_SEQ", allocationSize = 1)
    @Column(name = "APP_USER_ID")
    private Long id; // PK

    @Column(length = 120, nullable = false)
    private String email; // 이메일 (필수)

    @Column(length = 200, nullable = true) 
    private String password; // 소셜 로그인은 null 허용

    @Column(length = 50, nullable = false)
    private String nickname; // 닉네임

    @Column(name = "MBTI_TYPE_ID")
    private Integer mbtitype; // MBTI 타입 (nullable)

    @Column(length = 255)
    private String ufile; // 프로필 이미지 URL

    @Column(length = 30)
    private String mobile; // 휴대폰 번호

    @Column(nullable = false, name = "PROVIDER", length = 50)
    private String provider = "local"; // 로그인 제공자(local, google 등)

    @Column(name = "PROVIDER_ID", length = 150)
    private String providerId; // 소셜 provider에서 받은 ID

    @Column(nullable = false, name = "CREATED_AT")
    private LocalDateTime createdAt; // 생성일시

    @Column(nullable = false, name = "UPDATED_AT")
    private LocalDateTime updatedAt; // 수정일시

    @Column
    private boolean deleted = false; // 삭제 여부

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String role = "ROLE_USER"; // 기본 권한

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 테스트용 생성자
    public AppUser(String email, String password, String nickname, String provider) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.provider = provider;
        this.role = "ROLE_USER";
    }

    // 관계 매핑
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts = new ArrayList<>(); // 유저가 작성한 게시글

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>(); // 유저가 작성한 댓글

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> likes = new ArrayList<>(); // 유저가 누른 좋아요

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Retweet> retweets = new ArrayList<>(); // 유저가 리트윗한 글

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Follow> followings = new ArrayList<>(); // 내가 팔로우한 사람들

    @OneToMany(mappedBy = "followee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Follow> followers = new ArrayList<>(); // 나를 팔로우하는 사람들
}
