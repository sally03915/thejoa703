
## 🛠 Spring Boot 설정 (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@localhost:1521:xe   # Oracle XE 접속 URL
    username: scott                            # DB 사용자명
    password: tiger                            # DB 비밀번호
    driver-class-name: oracle.jdbc.OracleDriver
    hikari:                                    # HikariCP 커넥션 풀 설정
      maximum-pool-size: 10                    # 최대 커넥션 수
      minimum-idle: 5                          # 최소 유휴 커넥션 수
      idle-timeout: 30000                      # 유휴 커넥션 유지 시간(ms)
      connection-timeout: 30000                # 커넥션 획득 대기 시간(ms)
      pool-name: HikariPool                    # 풀 이름

  jpa:
    hibernate:
      ddl-auto: create                         # 테스트: create/update, 운영: validate 권장
    show-sql: true                             # SQL 출력 여부
    properties:
      hibernate:
        format_sql: true                       # SQL 포맷팅
        dialect: org.hibernate.dialect.OracleDialect  # Oracle Dialect 사용
```


---

## 🖼️ 엔티티 관계도 쉽게 설명하기

### 핵심 관계 흐름
- **사람(AppUser)** → 글(Post) → 댓글(Comment)  
- **사람(AppUser)** → 글(Post) → 좋아요(PostLike)  
- **사람(AppUser)** → 다른 사람(AppUser) → 팔로우(Follow) / 차단(Block)  
- **글(Post)** → 해시태그(Hashtag)  
- **글(Post)** → 사진(Image)  
- **사람(AppUser)** → 글(Post) → 리트윗(Retweet)  

---

### 도식화된 그림 
```
👤 User(AppUser)
   ├── 📝 Post(글)
   │     ├── 💬 Comment(댓글)
   │     ├── ❤️ PostLike(좋아요)
   │     ├── 🏷️ Hashtag(해시태그)
   │     ├── 🖼️ Image(사진)
   │     └── 🔄 Retweet(리트윗)
   │
   ├── 👣 Follow(팔로우) → 다른 User
   └── 🚫 Block(차단) → 다른 User
```


### 비유로 설명
- **User**는 친구예요.  
- **Post**는 친구가 쓴 그림일기.  
- **Comment**는 그림일기에 붙은 메모지.  
- **PostLike**는 하트 스티커.  
- **Follow**는 친구 따라가기.  
- **Block**은 친구랑 놀기 금지.  
- **Hashtag**는 꼬리표.  
- **Image**는 그림일기에 붙은 사진.  
- **Retweet**은 친구 글 다시 공유하기.  

--- 


```
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
```

 

## 🧑 AppUser 관계 매핑 

### 1. `@OneToMany(mappedBy = "user") private List<Post> posts`
- **사람 → 글**  
- “내가 쓴 그림일기 모음” 📖  
- 한 사람이 여러 글을 쓸 수 있어요.  
- 글(Post) 쪽에서는 `user`라는 필드로 “누가 썼는지”를 기억해요.

---

### 2. `@OneToMany(mappedBy = "user") private List<Comment> comments`
- **사람 → 댓글**  
- “내가 친구 그림일기에 붙인 메모지 모음” 📝  
- 한 사람이 여러 댓글을 쓸 수 있어요.  
- 댓글(Comment) 쪽에서는 `user`로 “누가 썼는지”를 기억해요.

---

### 3. `@OneToMany(mappedBy = "user") private List<PostLike> likes`
- **사람 → 좋아요**  
- “내가 붙인 하트 스티커 모음” ❤️  
- 한 사람이 여러 글에 좋아요를 누를 수 있어요.  
- 좋아요(PostLike) 쪽에서는 `user`로 “누가 눌렀는지”를 기억해요.

---

### 4. `@OneToMany(mappedBy = "user") private List<Retweet> retweets`
- **사람 → 리트윗**  
- “내가 다시 공유한 글 모음” 🔄  
- 한 사람이 여러 글을 리트윗할 수 있어요.  
- 리트윗(Retweet) 쪽에서는 `user`로 “누가 공유했는지”를 기억해요.

---

### 5. `@OneToMany(mappedBy = "follower") private List<Follow> followings`
- **사람 → 내가 팔로우한 사람들**  
- “내가 따라다니는 친구 목록” 👣  
- Follow 엔티티에서 `follower`가 나를 가리켜요.  
- 즉, 내가 다른 사람을 팔로우하면 기록돼요.

---

### 6. `@OneToMany(mappedBy = "followee") private List<Follow> followers`
- **사람 → 나를 팔로우하는 사람들**  
- “나를 따라다니는 친구 목록” 👥  
- Follow 엔티티에서 `followee`가 나를 가리켜요.  
- 즉, 다른 사람이 나를 팔로우하면 기록돼요.
 

---

```
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

```

## 🚫 Block 관계 매핑

### 1. `@ManyToOne @JoinColumn(name = "BLOCKER_ID") private AppUser blocker`
- **차단 → 나(차단한 사람)**  
- “내가 누구랑 안 놀기로 했는지” 🚫  
- Block 엔티티에서 `blocker`가 나를 가리켜요.

### 2. `@ManyToOne @JoinColumn(name = "BLOCKED_ID") private AppUser blockedUser`
- **차단 → 상대방(차단당한 사람)**  
- “누가 나랑 못 놀게 됐는지” 🙅  
- Block 엔티티에서 `blockedUser`가 상대방을 가리켜요.



```
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

```

## 💬 Comment 관계 매핑

### 1. `@ManyToOne @JoinColumn(name = "APP_USER_ID") private AppUser user`
- **댓글 → 사람**  
- “이 메모지를 누가 썼는지” 🧑

### 2. `@ManyToOne @JoinColumn(name = "POST_ID") private Post post`
- **댓글 → 글**  
- “이 메모지가 어떤 그림일기에 붙었는지” 📖




```
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

```


## 👣 Follow 관계 매핑

### 1. `@ManyToOne @JoinColumn(name = "FOLLOWER_ID") private AppUser follower`
- **팔로우 → 나(팔로우한 사람)**  
- “내가 누구를 따라다니는지” 👣

### 2. `@ManyToOne @JoinColumn(name = "FOLLOWEE_ID") private AppUser followee`
- **팔로우 → 상대방(팔로우 당한 사람)**  
- “누가 나를 따라다니는지” 👥



```
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


```


## 🏷️ Hashtag 관계 매핑

### 1. `@ManyToMany(mappedBy = "hashtags") private List<Post> posts`
- **해시태그 ↔ 글**  
- “이 꼬리표가 붙은 그림일기들” 📖  
- 해시태그 하나가 여러 글에 붙을 수 있고, 글 하나에 여러 해시태그가 붙을 수 있어요.



```
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

```

## 🖼️ Image 관계 매핑

### 1. `@ManyToOne @JoinColumn(name = "POST_ID") private Post post`
- **사진 → 글**  
- “이 사진이 어떤 그림일기에 붙었는지” 📖  
- 사진은 글 하나에만 속해요.



```
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

```

## 📖 Post 관계 매핑

### 1. `@ManyToOne @JoinColumn(name = "APP_USER_ID") private AppUser user`
- **글 → 사람**  
- “이 그림일기를 누가 썼는지” 🧑

### 2. `@OneToMany(mappedBy = "post") private List<Image> images`
- **글 → 사진들**  
- “그림일기에 붙은 사진 모음” 📷

### 3. `@OneToMany(mappedBy = "post") private List<Comment> comments`
- **글 → 댓글들**  
- “그림일기에 붙은 메모지 모음” 📝

### 4. `@ManyToMany @JoinTable(name = "POST_HASHTAG") private List<Hashtag> hashtags`
- **글 ↔ 해시태그**  
- “그림일기에 붙은 꼬리표들” 🏷️

### 5. `@OneToMany(mappedBy = "post") private List<PostLike> likes`
- **글 → 좋아요들**  
- “그림일기에 붙은 하트 스티커 모음” ❤️



```
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

```


## ❤️ PostLike 관계 매핑

### 1. `@ManyToOne @JoinColumn(name = "APP_USER_ID") private AppUser user`
- **좋아요 → 사람**  
- “이 하트를 누가 붙였는지” 🧑

### 2. `@ManyToOne @JoinColumn(name = "POST_ID") private Post post`
- **좋아요 → 글**  
- “이 하트가 어떤 그림일기에 붙었는지” 📖



```
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

```


## 🔄 Retweet 관계 매핑

### 1. `@ManyToOne @JoinColumn(name = "APP_USER_ID") private AppUser user`
- **리트윗 → 사람**  
- “누가 글을 다시 공유했는지” 🧑

### 2. `@ManyToOne @JoinColumn(name = "ORIGINAL_POST_ID") private Post originalPost`
- **리트윗 → 원본 글**  
- “어떤 그림일기를 다시 공유했는지” 📖
 