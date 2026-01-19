### Spring Boot + JWT + Redis + OAuth2.0 프로젝트  

---

#### 001. 프로젝트 중점
- Refresh Token은 "집 열쇠" 같은 거라서 꼭 금고(HttpOnly 쿠키)에 넣어야 한다 
- Access Token은 "출입증"이라서 짧게 쓰고 자주 바꿔야 안전
 
1. **Refresh Token은 HttpOnly 쿠키에 저장**
   - 이유: 브라우저에서 자바스크립트로 접근 못 하게 막아야 해요. 그래야 해커가 XSS 공격으로 훔쳐갈 수 없어요.
   - Axios가 자동으로 쿠키를 붙여주니까, 프론트 코드에서 직접 만질 필요가 없어요. → 안전 + 편리.

2. **Access Token 저장 위치**
   - CSR(클라이언트 렌더링): localStorage에 저장하면 새로고침해도 유지돼요.
   - SSR(서버 렌더링): 서버가 쿠키를 읽어서 인증을 확인해요.
   - 이유: 화면을 그리는 방식에 따라 토큰을 어디서 읽을지가 달라져요. 둘 다 맞는 방법이에요.

3. **Axios 인터셉터로 자동 재발급**
   - API 호출하다가 401(만료) 뜨면 → `/auth/refresh`로 새 토큰 받아서 다시 요청.
   - 이유: 사용자가 직접 다시 로그인할 필요 없이, 자동으로 새 토큰 받아서 UX가 좋아져요.

---


#### 002. 설정내용


###### ✅ Gradle 설정 점검 (왜 필요한지)

- **Spring Boot 버전 3.3.5**  
  → 최신 안정 버전이라 버그 적고, 보안 패치도 잘 돼 있어요.

- **Java 17**  
  → Spring Boot 3.x랑 찰떡궁합. 오래된 버전 쓰면 호환성 문제 생겨요.

- **의존성 구성**
  - `spring-boot-starter-security`: 로그인/권한 관리 필수.
  - `spring-boot-starter-data-redis`: 토큰 저장소로 Redis 사용.
  - `spring-boot-starter-oauth2-client`: 구글/카카오 같은 소셜 로그인 붙일 때 필요.
  - `jjwt-api/impl/jackson`: JWT 토큰 만들고 검증하는 도구.
  - `springdoc-openapi`: Swagger UI로 API 문서 자동 생성. → 개발자 편리.
  - `ojdbc11`: Oracle DB 연결 드라이버.
  - Lombok: 코드 줄여주는 도구. → 개발 생산성 ↑

- **테스트 설정**
  - JUnit + `spring-security-test`: 보안 로직까지 테스트 가능.

- **컴파일러 옵션**
  - `-parameters`: Swagger에서 파라미터 이름 그대로 보여주기 위해 필요.

👉 결론: 최신 버전 + 필요한 라이브러리만 딱 넣어서 안정적이고 깔끔한 구성.

---


###### 🔐 보안/토큰 관리 점검 (왜 필요한지)

1. **Refresh Token 쿠키 저장**  
   → JS 접근 차단, CSRF 위험 줄임. 안전하게 서버만 접근 가능.

2. **Access Token 관리**  
   → CSR/SSR 각각 맞는 방식으로 저장해서 인증 흐름이 끊기지 않게 함.

3. **Axios 인터셉터**  
   → 자동으로 토큰 갱신, 사용자 경험 좋아짐.

4. **Redis TTL 관리**  
   → Access Token은 짧게(15분), Refresh Token은 길게(7일).  
   이유: 짧게 줘야 탈취돼도 피해가 최소화돼요.

5. **쿠키 옵션**
   - `Secure: true` → HTTPS에서만 전송.
   - `SameSite: Lax/Strict` → 다른 사이트에서 쿠키 못 쓰게 막음.  
   이유: CSRF 공격 방어.

6. **OAuth2.0 소셜 로그인**
   → 구글/카카오 로그인 붙일 때 client-id, secret, redirect-uri 꼭 확인해야 해요.

7. **Swagger 보안**
   → 개발할 땐 편리하지만, 운영 환경에서는 누구나 API 문서 보면 위험해요. 접근 제한 필요.

8. **예외 처리**
   - Refresh 실패 → 강제 로그아웃.
   - Redis 토큰 만료 → 401 반환 후 로그인 페이지로 이동.

---


#### 003. Gradle 코드

```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.5'   // 최신 안정 버전
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.thejoa703'
version = '0.0.1-SNAPSHOT'
description = 'Demo project for Spring Boot'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17) // Java 17 사용
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // 기본 스타터
    implementation 'org.springframework.boot:spring-boot-starter'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // 보안 + Redis + OAuth2
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    testCompileOnly 'org.projectlombok:lombok'
    testAnnotationProcessor 'org.projectlombok:lombok'

    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    implementation 'io.jsonwebtoken:jjwt-impl:0.11.5'
    implementation 'io.jsonwebtoken:jjwt-jackson:0.11.5'

    // Swagger/OpenAPI
    implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0'
    implementation 'org.springdoc:springdoc-openapi-starter-oauth2:2.5.0'

    // Oracle JDBC Driver
    runtimeOnly 'com.oracle.database.jdbc:ojdbc11'

    // Gson
    implementation 'com.google.code.gson:gson:2.11.0'

    // 테스트
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}

// Swagger에서 파라미터 이름 유지
tasks.withType(JavaCompile).configureEach {
    options.compilerArgs.add("-parameters")
}
```
