package com.thejoa703.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "COMMENTS")
@Getter @Setter
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "comment_seq")
    @SequenceGenerator(name = "comment_seq", sequenceName = "COMMENT_SEQ", allocationSize = 1)
    private Long id; // PK

    @Lob @Column(nullable = false)
    private String content; // 댓글 내용 (긴 텍스트 가능)

    @ManyToOne @JoinColumn(name = "APP_USER_ID", nullable = false)
    private AppUser user; // 작성자

    @ManyToOne @JoinColumn(name = "POST_ID", nullable = false)
    private Post post; // 어떤 게시글에 달린 댓글인지

    @Column(nullable = false)
    private LocalDateTime createdAt; // 작성일시

    @Column
    private LocalDateTime updatedAt; // 수정일시

    @Column
    private boolean deleted = false; // 삭제 여부

    @PrePersist void onCreate() { this.createdAt = LocalDateTime.now(); }
    @PreUpdate void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
