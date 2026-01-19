// src/main/java/com/thejoa703/entity/Follow.java
package com.thejoa703.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "FOLLOWS",
    uniqueConstraints = @UniqueConstraint(columnNames = {"FOLLOWER_ID", "FOLLOWEE_ID"}))
@Getter @Setter @NoArgsConstructor
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "follow_seq")
    @SequenceGenerator(name = "follow_seq", sequenceName = "FOLLOW_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "FOLLOWER_ID", nullable = false)
    private AppUser follower;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "FOLLOWEE_ID", nullable = false)
    private AppUser followee;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Follow(AppUser follower, AppUser followee) {
        this.follower = follower;
        this.followee = followee;
    }
}
