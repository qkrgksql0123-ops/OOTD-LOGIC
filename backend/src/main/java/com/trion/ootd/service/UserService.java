package com.trion.ootd.service;

import com.trion.ootd.entity.User;
import com.trion.ootd.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User createUser(User user) {
        log.info("Creating user: {}", user.getUserId());

        user.setCreatedAt(LocalDateTime.now().toString());
        user.setUpdatedAt(LocalDateTime.now().toString());
        user.setTempSensitivity(user.getTempSensitivity() != null ? user.getTempSensitivity() : 5);
        user.setDeactivated(false);

        userRepository.save(user);
        log.info("User created successfully: {}", user.getUserId());

        return user;
    }

    public Optional<User> getUserById(String userId) {
        log.info("Getting user: {}", userId);
        return userRepository.findById(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        log.info("Getting user by email: {}", email);
        return userRepository.findByEmail(email);
    }

    public void updateUser(User user) {
        log.info("Updating user: {}", user.getUserId());

        user.setUpdatedAt(LocalDateTime.now().toString());
        userRepository.save(user);

        log.info("User updated successfully: {}", user.getUserId());
    }

    public void updateUserSettings(String userId, Integer tempSensitivity, String skinTone) {
        log.info("Updating settings for user: {}", userId);

        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (tempSensitivity != null) {
                user.setTempSensitivity(tempSensitivity);
            }
            if (skinTone != null) {
                user.setSkinTone(skinTone);
            }
            user.setUpdatedAt(LocalDateTime.now().toString());
            userRepository.save(user);
            log.info("User settings updated successfully");
        } else {
            log.warn("User not found: {}", userId);
        }
    }

    public void deleteUser(String userId) {
        log.info("Deleting user: {}", userId);
        userRepository.delete(userId);
        log.info("User deleted successfully");
    }

    public boolean userExists(String userId) {
        return userRepository.existsById(userId);
    }
}
