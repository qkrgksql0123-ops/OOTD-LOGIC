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

import java.time.LocalDateTime;
import java.util.Map;
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

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        log.info("Signup request for email: {}", request.getEmail());

        Optional<User> existingUser = userService.getUserByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            log.warn("User already exists: {}", request.getEmail());
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "이미 가입된 이메일입니다.", null, null
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
                .createdAt(LocalDateTime.now().toString())
                .build();

        User createdUser = userService.createUser(user);
        log.info("User created successfully: {}", userId);

        String accessToken = jwtTokenProvider.generateAccessToken(userId);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userId);

        return ResponseEntity.ok(new AuthResponse(
                createdUser.getUserId(),
                createdUser.getEmail(),
                createdUser.getNickname(),
                "회원가입 성공",
                accessToken,
                refreshToken
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());

        Optional<User> user = userService.getUserByEmail(request.getEmail());
        if (user.isEmpty()) {
            log.warn("User not found: {}", request.getEmail());
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "이메일 또는 비밀번호가 잘못되었습니다.", null, null
            ));
        }

        User foundUser = user.get();
        if (!passwordEncoder.matches(request.getPassword(), foundUser.getPasswordHash())) {
            log.warn("Invalid password for user: {}", request.getEmail());
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "이메일 또는 비밀번호가 잘못되었습니다.", null, null
            ));
        }

        foundUser.setLastLoginAt(LocalDateTime.now().toString());
        userService.updateUser(foundUser);

        String accessToken = jwtTokenProvider.generateAccessToken(foundUser.getUserId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(foundUser.getUserId());

        log.info("User logged in successfully: {}", request.getEmail());

        return ResponseEntity.ok(new AuthResponse(
                foundUser.getUserId(),
                foundUser.getEmail(),
                foundUser.getNickname(),
                "로그인 성공",
                accessToken,
                refreshToken
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        log.info("Logout request received");

        return ResponseEntity.ok(new AuthResponse(
                null, null, null, "로그아웃 성공", null, null
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || !jwtTokenProvider.isTokenValid(refreshToken)) {
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "유효하지 않은 Refresh Token입니다.", null, null
            ));
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        Optional<User> user = userService.getUserById(userId);

        if (user.isEmpty()) {
            return ResponseEntity.badRequest().body(new AuthResponse(
                    null, null, null, "사용자를 찾을 수 없습니다.", null, null
            ));
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(userId);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId);

        log.info("Token refreshed for user: {}", userId);

        return ResponseEntity.ok(new AuthResponse(
                userId,
                user.get().getEmail(),
                user.get().getNickname(),
                "토큰 갱신 성공",
                newAccessToken,
                newRefreshToken
        ));
    }
}