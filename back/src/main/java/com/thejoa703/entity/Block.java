// src/main/java/com/thejoa703/entity/Block.java
package com.thejoa703.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "BLOCKS",
    uniqueConstraints = @UniqueConstraint(columnNames = {"BLOCKER_ID", "BLOCKED_ID"}))
@Getter @Setter @NoArgsConstructor
public class Block {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "block_seq")
    @SequenceGenerator(name = "block_seq", sequenceName = "BLOCK_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "BLOCKER_ID", nullable = false)
    private AppUser blocker; // 차단을 수행한 사용자

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "BLOCKED_ID", nullable = false)
    private AppUser blockedUser; // 차단된 사용자

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist void onCreate() { this.createdAt = LocalDateTime.now(); }

    public Block(AppUser blocker, AppUser blockedUser) {
        this.blocker = blocker;
        this.blockedUser = blockedUser;
    }
}
