package com.new_cafe.app.backend.auth.adapter.out.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 발급 및 검증 (BFF 인증: 세션 없이 JWT + 쿠키)
 */
@Service
public class JwtService {

    private static final String CLAIM_USERNAME = "username";
    private static final String CLAIM_ROLE = "role";
    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000L; // 24시간

    private final SecretKey key;

    public JwtService(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(Long memberId, String username, String role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + EXPIRATION_MS);
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .claim(CLAIM_USERNAME, username)
                .claim(CLAIM_ROLE, role)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    /** Bearer 토큰 검증 후 claims 반환. 유효하지 않으면 null */
    public Claims parseToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            return null;
        }
        String token = bearerToken.substring(7).trim();
        if (token.isEmpty()) return null;
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException | io.jsonwebtoken.security.SecurityException |
                 io.jsonwebtoken.MalformedJwtException e) {
            return null;
        }
    }

    /** claims에서 userId(subject) 추출. subject가 없거나 숫자가 아니면 null (500 방지) */
    public Long getUserIdFromClaims(Claims claims) {
        if (claims == null) return null;
        String sub = claims.getSubject();
        if (sub == null || sub.isBlank()) return null;
        try {
            return Long.parseLong(sub.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
