# 🚀 지금 해야 할 것 - 순서대로 정리

**작성일**: 2026.03.31  
**팀장**: 한비  
**현재 상태**: STEP 1 분석 완료 → STEP 2-3 구현 시작

---

## 📋 전체 순서 (10개 단계)

```
┌─ 단계 1-2: 의존성 추가 (15분)
├─ 단계 3-4: JWT 토큰 처리 구현 (2-3시간)
├─ 단계 5-6: 필터 체인 & 보안 (1-2시간)
├─ 단계 7: AuthController 완성 (1시간)
├─ 단계 8: 테스트 (1시간)
└─ 단계 9-10: 커밋 & 정리 (30분)
```

---

## ✅ 단계 1: build.gradle에 JWT 라이브러리 추가 (5분)

### 지금 할 것
1. 파일 열기: `backend/build.gradle`
2. **44번째 줄** (annotationProcessor 'org.projectlombok:lombok' 아래)에 다음 추가:

```gradle
// JWT
implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'
```

### 확인 할 것
```gradle
✅ dependencies { } 안에 있어야 함
✅ 다른 implementation과 같은 위치에 추가
```

### 완료 기준
```
파일이 저장되고 컴파일 오류가 없어야 함
```

---

## ✅ 단계 2: application.yml에 JWT 설정 추가 (10분)

### 지금 할 것
1. 파일 열기: `backend/src/main/resources/application.yml`
2. **30번째 줄** (logging 섹션 위에) 다음 추가:

```yaml
jwt:
  secret: ${JWT_SECRET_KEY:your-secret-key-minimum-256-bits-long-change-in-production}
  expiration: 3600000
  refreshExpiration: 604800000
```

### 설명
```
jwt.secret: JWT 서명 키 (최소 256비트)
jwt.expiration: Access Token 만료 시간 (3600000ms = 1시간)
jwt.refreshExpiration: Refresh Token 만료 시간 (604800000ms = 7일)
```

### 완료 기준
```
YAML 포맷이 정확 (들여쓰기 2칸)
```

---

## ✅ 단계 3: JwtTokenProvider.java 구현 (1-2시간)

### 지금 할 것
1. **새 파일** 생성: `backend/src/main/java/com/trion/ootd/util/JwtTokenProvider.java`

### 파일 내용

```java
package com.trion.ootd.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
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

    // Access Token 생성 (1시간)
    public String generateAccessToken(String userId) {
        return createToken(userId, accessTokenExpiration, "ACCESS");
    }

    // Refresh Token 생성 (7일)
    public String generateRefreshToken(String userId) {
        return createToken(userId, refreshTokenExpiration, "REFRESH");
    }

    // 토큰 생성 (공통)
    private String createToken(String userId, long expirationTime, String tokenType) {
        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiresAt = new Date(now + expirationTime);

        try {
            return Jwts.builder()
                    .subject(userId)
                    .claim("type", tokenType)
                    .issuedAt(issuedAt)
                    .expiration(expiresAt)
                    .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (JwtException e) {
            log.error("Failed to create token for user: {}", userId, e);
            throw new RuntimeException("Token creation failed", e);
        }
    }

    // 토큰에서 userId 추출
    public String getUserIdFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (JwtException e) {
            log.error("Failed to get userId from token", e);
            throw new RuntimeException("Invalid token", e);
        }
    }

    // 토큰 유효성 검사
    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
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

    // 토큰 만료 시간 반환 (밀리초)
    public long getTokenExpirationTime(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
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
```

### 확인 할 것
```
✅ Package 경로: com.trion.ootd.util
✅ @Component 어노테이션 있음
✅ @Value로 jwt.secret, jwt.expiration 주입
✅ 5개 메서드 구현됨:
   - generateAccessToken()
   - generateRefreshToken()
   - getUserIdFromToken()
   - isTokenValid()
   - getTokenExpirationTime()
```

### 완료 기준
```
파일 생성되고 컴파일 오류 없음
```

---

## ✅ 단계 4: JwtAuthenticationFilter.java 구현 (1-2시간)

### 지금 할 것
1. **새 파일** 생성: `backend/src/main/java/com/trion/ootd/config/JwtAuthenticationFilter.java`

### 파일 내용

```java
package com.trion.ootd.config;

import com.trion.ootd.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final String[] PUBLIC_URLS = {
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/environment",
            "/"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // 공개 경로 체크
        if (isPublicUrl(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = extractTokenFromRequest(request);
            
            if (token != null && jwtTokenProvider.isTokenValid(token)) {
                String userId = jwtTokenProvider.getUserIdFromToken(token);
                
                // SecurityContext에 인증 정보 설정
                Authentication auth = new UsernamePasswordAuthenticationToken(
                        userId, null, null
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
                
                log.info("Token validated for user: {}", userId);
            }
        } catch (Exception e) {
            log.error("Token validation failed", e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Unauthorized");
            return;
        }

        filterChain.doFilter(request, response);
    }

    // Authorization 헤더에서 토큰 추출
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        return null;
    }

    // 공개 경로 확인
    private boolean isPublicUrl(String requestPath) {
        for (String publicUrl : PUBLIC_URLS) {
            if (requestPath.startsWith(publicUrl)) {
                return true;
            }
        }
        return false;
    }
}
```

### 확인 할 것
```
✅ Package 경로: com.trion.ootd.config
✅ OncePerRequestFilter 상속
✅ doFilterInternal() 구현
✅ extractTokenFromRequest() - Authorization 헤더 파싱
✅ 공개 경로 배열 설정
```

### 완료 기준
```
파일 생성되고 컴파일 오류 없음
```

---

## ✅ 단계 5: SecurityConfig 업데이트 (필터 등록) (30분)

### 지금 할 것
1. 파일 열기: `backend/src/main/java/com/trion/ootd/config/SecurityConfig.java`
2. **securityFilterChain 메서드 수정**:

```java
package com.trion.ootd.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/environment/**").permitAll()
                .requestMatchers("/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 변경 사항
```
✅ JwtAuthenticationFilter 생성자 주입 추가
✅ .addFilterBefore(jwtAuthenticationFilter, ...) 추가
```

### 완료 기준
```
컴파일 오류 없음
```

---

## ✅ 단계 6: AuthController 업데이트 (login/logout/refresh) (1시간)

### 지금 할 것
1. 파일 열기: `backend/src/main/java/com/trion/ootd/controller/AuthController.java`
2. 다음과 같이 수정:

```java
package com.trion.ootd.controller;

import com.trion.ootd.dto.SignupRequest;
import com.trion.ootd.dto.LoginRequest;
import com.trion.ootd.dto.AuthResponse;
import com.trion.ootd.entity.User;
import com.trion.ootd.service.UserService;
import com.trion.ootd.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        log.info("Signup request for email: {}", request.getEmail());

        Optional<User> existingUser = userService.getUserByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            log.warn("User already exists: {}", request.getEmail());
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "이미 가입된 이메일입니다."
            ));
        }

        String userId = UUID.randomUUID().toString();
        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .userId(userId)
                .email(request.getEmail())
                .passwordHash(passwordHash)
                .nickname(request.getNickname())
                .tempSensitivity(5)
                .createdAt(java.time.LocalDateTime.now().toString())
                .build();

        User createdUser = userService.createUser(user);
        log.info("User created successfully: {}", userId);

        String accessToken = jwtTokenProvider.generateAccessToken(userId);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userId);

        return ResponseEntity.ok(new AuthResponse(
                createdUser.getUserId(),
                createdUser.getEmail(),
                createdUser.getNickname(),
                "회원가입 성공"
        ));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());

        Optional<User> user = userService.getUserByEmail(request.getEmail());
        if (user.isEmpty()) {
            log.warn("User not found: {}", request.getEmail());
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "이메일 또는 비밀번호가 잘못되었습니다."
            ));
        }

        User foundUser = user.get();
        if (!passwordEncoder.matches(request.getPassword(), foundUser.getPasswordHash())) {
            log.warn("Invalid password for user: {}", request.getEmail());
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "이메일 또는 비밀번호가 잘못되었습니다."
            ));
        }

        foundUser.setLastLoginAt(java.time.LocalDateTime.now().toString());
        userService.updateUser(foundUser);

        String accessToken = jwtTokenProvider.generateAccessToken(foundUser.getUserId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(foundUser.getUserId());

        log.info("User logged in successfully: {}", request.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                foundUser.getUserId(),
                foundUser.getEmail(),
                foundUser.getNickname(),
                "로그인 성공"
        ));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestHeader("Authorization") String authHeader) {
        log.info("Logout request received");
        
        return ResponseEntity.ok(new AuthResponse(
                null, null, null, "로그아웃 성공"
        ));
    }

    // 토큰 갱신
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || !jwtTokenProvider.isTokenValid(refreshToken)) {
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "유효하지 않은 Refresh Token입니다."
            ));
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        Optional<User> user = userService.getUserById(userId);

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "사용자를 찾을 수 없습니다."
            ));
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(userId);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId);

        log.info("Token refreshed for user: {}", userId);

        return ResponseEntity.ok(new AuthResponse(
                userId,
                user.get().getEmail(),
                user.get().getNickname(),
                "토큰 갱신 성공"
        ));
    }
}

// Map import 추가
import java.util.Map;
```

### 확인 할 것
```
✅ JwtTokenProvider 주입 추가
✅ login() 메서드 - 비밀번호 검증 추가
✅ logout() 메서드 구현
✅ refresh() 메서드 구현
✅ 토큰 생성 로직 추가
```

### 완료 기준
```
컴파일 오류 없음
모든 엔드포인트 정상 동작
```

---

## ✅ 단계 7: AuthResponse DTO 업데이트 (10분)

### 지금 할 것
1. 파일 열기: `backend/src/main/java/com/trion/ootd/dto/AuthResponse.java`
2. **accessToken, refreshToken 필드 추가**:

```java
package com.trion.ootd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String userId;
    private String email;
    private String nickname;
    private String message;
    private String accessToken;    // 추가
    private String refreshToken;   // 추가
}
```

### 완료 기준
```
컴파일 오류 없음
```

---

## ✅ 단계 8: 컴파일 테스트 (10분)

### 지금 할 것
```bash
cd C:\workspace\demo\demo
./gradlew clean build
```

### 확인 할 것
```
✅ BUILD SUCCESSFUL 메시지 나타남
❌ 컴파일 오류 없음
❌ 경고 최소화
```

### 문제 발생 시
```
1. "JwtTokenProvider not found" → 파일 경로 확인
2. "JJWT dependency not found" → build.gradle 재확인
3. "SecurityConfig error" → import 문 확인
```

---

## ✅ 단계 9: Postman으로 API 테스트 (1시간)

### 테스트 1: 회원가입
```
POST http://localhost:8090/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "nickname": "테스트"
}

기대 결과:
✅ 200 OK
✅ userId 반환
✅ message: "회원가입 성공"
```

### 테스트 2: 로그인
```
POST http://localhost:8090/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

기대 결과:
✅ 200 OK
✅ accessToken 반환
✅ refreshToken 반환
```

### 테스트 3: 토큰으로 보호된 API 접근
```
GET http://localhost:8090/api/clothing/
Authorization: Bearer {accessToken}

기대 결과:
✅ 200 OK
✅ 데이터 반환
```

### 테스트 4: 잘못된 토큰
```
GET http://localhost:8090/api/clothing/
Authorization: Bearer invalid-token

기대 결과:
✅ 401 Unauthorized
```

---

## ✅ 단계 10: Git 커밋 (10분)

### 지금 할 것
```bash
cd C:\workspace\demo\demo

# 1. 상태 확인
git status

# 2. 파일 추가
git add backend/build.gradle
git add backend/src/main/resources/application.yml
git add backend/src/main/java/com/trion/ootd/util/JwtTokenProvider.java
git add backend/src/main/java/com/trion/ootd/config/JwtAuthenticationFilter.java
git add backend/src/main/java/com/trion/ootd/config/SecurityConfig.java
git add backend/src/main/java/com/trion/ootd/controller/AuthController.java
git add backend/src/main/java/com/trion/ootd/dto/AuthResponse.java

# 3. 커밋
git commit -m "feat: Implement JWT authentication with JwtTokenProvider and JwtAuthenticationFilter"

# 4. 상태 확인
git status
```

### 커밋 메시지 예시
```
feat: Implement JWT authentication with JwtTokenProvider and JwtAuthenticationFilter

- Add JJWT library to build.gradle
- Add JWT configuration to application.yml
- Implement JwtTokenProvider for token generation and validation
- Implement JwtAuthenticationFilter for request filtering
- Update SecurityConfig to register JWT filter
- Complete AuthController with login/logout/refresh endpoints
- Add accessToken and refreshToken to AuthResponse DTO
```

---

## 🎯 완료 체크리스트

- [ ] **단계 1**: build.gradle JWT 라이브러리 추가 ✅
- [ ] **단계 2**: application.yml JWT 설정 추가 ✅
- [ ] **단계 3**: JwtTokenProvider.java 구현 ✅
- [ ] **단계 4**: JwtAuthenticationFilter.java 구현 ✅
- [ ] **단계 5**: SecurityConfig 필터 등록 업데이트 ✅
- [ ] **단계 6**: AuthController 완성 (login/logout/refresh) ✅
- [ ] **단계 7**: AuthResponse DTO 업데이트 ✅
- [ ] **단계 8**: ./gradlew clean build 성공 ✅
- [ ] **단계 9**: Postman 테스트 4개 성공 ✅
- [ ] **단계 10**: Git 커밋 ✅

---

## 📊 진행률 업데이트

```
현재: 40% (25/62)
↓
이 10단계 완료 후: 55% (34/62)
```

---

## 🚀 다음은?

STEP 1-3 완료 후 → STEP 2 (프론트엔드 인증 통합)
- api.js 구현
- login.js, signup.js 업데이트
- localStorage 토큰 저장

---

**작성**: 한비 (팀장)  
**최종 업데이트**: 2026년 3월 31일