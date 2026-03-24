package com.trion.ootd.controller;

import com.trion.ootd.entity.User;
import com.trion.ootd.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

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

    @GetMapping("/{userId}/exists")
    public ResponseEntity<Boolean> userExists(@PathVariable String userId) {
        log.info("Checking if user exists: {}", userId);
        return ResponseEntity.ok(userService.userExists(userId));
    }
}
