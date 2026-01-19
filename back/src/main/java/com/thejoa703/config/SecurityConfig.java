package com.thejoa703.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// ✅ CORS 관련 import
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.thejoa703.oauth2.OAuth2SuccessHandler;
import com.thejoa703.security.JwtAuthenticationFilter;
import com.thejoa703.security.JwtProvider;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security 설정
 *
 * - CSRF/FormLogin/HttpBasic 비활성화
 * - 세션을 Stateless로 설정 (JWT 기반 인증)
 * - Swagger/OpenAPI 경로 permitAll
 * - OAuth2 로그인 성공 핸들러 연결
 * - JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
 * - CORS 설정 포함
 * - PasswordEncoder Bean 등록
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 기본 보안 기능 비활성화
            .csrf(csrf -> csrf.disable())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 세션을 Stateless로
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 권한 설정
            .authorizeHttpRequests(auth -> auth
                // Swagger, 인증 관련 경로는 모두 허용
                .requestMatchers(
                    "/auth/**", "/login/**", "/oauth2/**",
                    "/swagger-ui/**", "/v3/api-docs/**",
                    "/swagger-resources/**", "/webjars/**",
                    "/configuration/**", "/upload/**"  , "/api/deptusers/**"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()  // 🔓 공개: 전체 조회만 허용
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()  //🔓 공개: 단건 조회도  필요
                .requestMatchers(HttpMethod.GET, "/api/posts/search/hashtag").permitAll() //해쉬태그
                .requestMatchers("/api/posts/paged").permitAll() 
                // API 요청은 JWT 인증 필요
                .requestMatchers("/api/**").authenticated()

                // 나머지는 모두 허용
                .anyRequest().permitAll()
            )

            // OAuth2 로그인은 소셜 로그인 전용으로만 사용
            .oauth2Login(oauth2 -> oauth2.successHandler(oAuth2SuccessHandler))

            // JWT 필터 추가
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
            throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ 실제 프론트엔드 포트와 맞추기 (3060)
        configuration.setAllowedOrigins(List.of("http://localhost:3060"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
