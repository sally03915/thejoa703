package com.thejoa703.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * JWT 설정값 바인딩
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String issuer;
    private String secret;
    private int accessTokenExpSeconds;
    private int refreshTokenExpSeconds;
    private String header;
    private String prefix;
}
