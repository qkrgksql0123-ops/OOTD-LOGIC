package com.trion.ootd.controller;

import com.trion.ootd.entity.User;
import com.trion.ootd.service.BedrockService;
import com.trion.ootd.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final BedrockService bedrockService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        log.info("Creating user: {}", user.getUserId());
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(createdUser);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUser(@PathVariable String userId) {
        log.info("Getting user: {}", userId);
        Optional<User> user = userService.getUserById(userId);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        log.info("Getting user by email: {}", email);
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateUser(@PathVariable String userId, @RequestBody User user) {
        log.info("Updating user: {}", userId);
        user.setUserId(userId);
        userService.updateUser(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/settings")
    public ResponseEntity<Void> updateUserSettings(
            @PathVariable String userId,
            @RequestParam(required = false) Integer tempSensitivity,
            @RequestParam(required = false) String skinTone) {
        log.info("Updating settings for user: {}", userId);
        userService.updateUserSettings(userId, tempSensitivity, skinTone);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        log.info("Deleting user: {}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/analyze-profile")
    public ResponseEntity<?> analyzeProfile(
            @PathVariable String userId,
            @RequestBody Map<String, String> body) {
        log.info("Analyzing profile for user: {}", userId);
        try {
            String imageUrl = body.get("imageUrl");
            String result = bedrockService.analyzeUserProfile(imageUrl);

            // JSON 추출 (```json ... ``` 감싸진 경우 처리)
            String json = result;
            int start = result.indexOf('{');
            int end = result.lastIndexOf('}');
            if (start >= 0 && end > start) json = result.substring(start, end + 1);

            JsonNode node = objectMapper.readTree(json);

            // 유저 프로필에 자동 반영
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (node.has("personalTone"))  user.setPersonalTone(node.get("personalTone").asText());
                if (node.has("toneSeason"))    user.setToneSeason(node.get("toneSeason").asText());
                if (node.has("faceShape"))     user.setFaceShape(node.get("faceShape").asText());
                if (node.has("fitPreference")) user.setFitPreference(node.get("fitPreference").asText());
                userService.updateUser(user);
            }

            return ResponseEntity.ok(objectMapper.readTree(json));
        } catch (Exception e) {
            log.error("Profile analysis failed", e);
            return ResponseEntity.status(500).body("분석 실패: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}/exists")
    public ResponseEntity<Boolean> userExists(@PathVariable String userId) {
        log.info("Checking if user exists: {}", userId);
        return ResponseEntity.ok(userService.userExists(userId));
    }
}
