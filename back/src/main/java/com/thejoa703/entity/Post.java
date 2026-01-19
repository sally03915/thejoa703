package com.thejoa703.entity; // 엔티티 패키지

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*; // JPA 관련 어노테이션
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "POSTS") // 게시글 테이블
@Getter @Setter
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_seq")
    @SequenceGenerator(name = "post_seq", sequenceName = "POST_SEQ", allocationSize = 1)
    private Long id; // PK

    @Lob
    @Column(nullable = false)
    private String content; // 게시글 내용 (긴 텍스트 가능)

    @ManyToOne
    @JoinColumn(name = "APP_USER_ID", nullable = false)
    private AppUser user; // 작성자 (AppUser와 N:1 관계)

    // ✅ 이미지 연관관계
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images = new ArrayList<>(); // 게시글에 달린 이미지들

    // ✅ 댓글 연관관계
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>(); // 게시글에 달린 댓글들

    // ✅ 해시태그 연관관계
    @ManyToMany
    @JoinTable(
        name = "POST_HASHTAG", // 중간 테이블
        joinColumns = @JoinColumn(name = "POST_ID"),
        inverseJoinColumns = @JoinColumn(name = "HASHTAG_ID")
    )
    private List<Hashtag> hashtags = new ArrayList<>(); // 게시글에 연결된 해시태그들

    // ✅ 좋아요 연관관계
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> likes = new ArrayList<>(); // 게시글에 달린 좋아요들

    @Column(name = "CREATED_AT", nullable = false) // ✅ 변경
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT") // ✅ 변경
    private LocalDateTime updatedAt;


    @Column
    private boolean deleted = false; // 삭제 여부

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now(); // 저장될 때 자동 생성일시 기록
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now(); // 업데이트될 때 수정일시 기록
    }

    // ✅ 좋아요 수 계산 메서드
    public int getLikeCount() {
        return likes != null ? likes.size() : 0;
    }

    // ✅ 댓글 수 계산 메서드
    public int getCommentCount() {
        return comments != null ? comments.size() : 0;
    }
}
