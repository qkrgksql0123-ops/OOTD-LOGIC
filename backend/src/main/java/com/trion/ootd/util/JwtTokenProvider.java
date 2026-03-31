package com.trion.ootd.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refreshExpiration}")
    private long refreshTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateAccessToken(String userId) {
        return createToken(userId, accessTokenExpiration, "ACCESS");
    }

    public String generateRefreshToken(String userId) {
        return createToken(userId, refreshTokenExpiration, "REFRESH");
    }

    private String createToken(String userId, long expirationTime, String tokenType) {
        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiresAt = new Date(now + expirationTime);

        try {
            return Jwts.builder()
                    .setSubject(userId)
                    .claim("type", tokenType)
                    .setIssuedAt(issuedAt)
                    .setExpiration(expiresAt)
                    .signWith(SignatureAlgorithm.HS256, getSigningKey())
                    .compact();
        } catch (JwtException e) {
            log.error("Failed to create token for user: {}", userId, e);
            throw new RuntimeException("Token creation failed", e);
        }
    }

    public String getUserIdFromToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (JwtException e) {
            log.error("Failed to get userId from token", e);
            throw new RuntimeException("Invalid token", e);
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Token expired");
            return false;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid token");
            return false;
        }
    }

    public long getTokenExpirationTime(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .parseClaimsJws(token)
                    .getBody();
            Date expiresAt = claims.getExpiration();
            return expiresAt != null ? expiresAt.getTime() : 0;
        } catch (JwtException e) {
            log.error("Failed to get expiration time", e);
            return 0;
        }
    }
}