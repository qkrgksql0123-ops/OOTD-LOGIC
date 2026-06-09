package com.trion.ootd.controller;

import com.trion.ootd.dto.ClothingDTO;
import com.trion.ootd.service.BedrockService;
import com.trion.ootd.service.ClothingService;
import com.trion.ootd.service.S3Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/users/{userId}/clothing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClothingController {

    private final ClothingService clothingService;
    private final BedrockService bedrockService;
    private final S3Service s3Service;

    @PostMapping
    public ResponseEntity<ClothingDTO> addClothing(
            @PathVariable String userId,
            @RequestBody ClothingDTO clothingDTO) {
        log.info("Adding clothing for user: {}", userId);
        ClothingDTO addedClothing = clothingService.addClothing(userId, clothingDTO);
        return ResponseEntity.ok(addedClothing);
    }

    @GetMapping("/{clothingId}")
    public ResponseEntity<ClothingDTO> getClothing(
            @PathVariable String userId,
            @PathVariable String clothingId) {
        log.info("Getting clothing: {} for user: {}", clothingId, userId);
        Optional<ClothingDTO> clothing = clothingService.getClothingById(userId, clothingId);
        return clothing.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<ClothingDTO>> getAllClothing(@PathVariable String userId) {
        log.info("Getting all clothing for user: {}", userId);
        List<ClothingDTO> clothingList = clothingService.getAllClothing(userId);
        return ResponseEntity.ok(clothingList);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ClothingDTO>> getClothingByCategory(
            @PathVariable String userId,
            @PathVariable String category) {
        log.info("Getting clothing by category: {} for user: {}", category, userId);
        List<ClothingDTO> clothingList = clothingService.getClothingByCategory(userId, category);
        return ResponseEntity.ok(clothingList);
    }

    @DeleteMapping("/{clothingId}")
    public ResponseEntity<Void> deleteClothing(
            @PathVariable String userId,
            @PathVariable String clothingId) {
        log.info("Deleting clothing: {} for user: {}", clothingId, userId);
        clothingService.deleteClothing(userId, clothingId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getClothingCount(@PathVariable String userId) {
        log.info("Getting clothing count for user: {}", userId);
        long count = clothingService.getClothingCount(userId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(
            @PathVariable String userId,
            @RequestParam("file") MultipartFile file) {
        log.info("Uploading image for user: {}", userId);
        try {
            String url = s3Service.uploadImage(file, userId);
            return ResponseEntity.ok(java.util.Map.of("imageUrl", url));
        } catch (Exception e) {
            log.error("Image upload failed", e);
            return ResponseEntity.status(500).body("이미지 업로드 실패: " + e.getMessage());
        }
    }

    @PostMapping("/analyze-image")
    public ResponseEntity<String> analyzeClothingImage(
            @PathVariable String userId,
            @RequestParam String imageUrl) {
        log.info("Analyzing clothing image for user: {}", userId);
        String analysis = bedrockService.analyzeClothingImage(imageUrl);
        return ResponseEntity.ok(analysis);
    }

    @PatchMapping("/{clothingId}/wear")
    public ResponseEntity<Void> markAsWorn(
            @PathVariable String userId,
            @PathVariable String clothingId) {
        log.info("Marking clothing as worn: {} for user: {}", clothingId, userId);
        clothingService.markAsWorn(userId, clothingId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{clothingId}/laundry-status")
    public ResponseEntity<Void> updateLaundryStatus(
            @PathVariable String userId,
            @PathVariable String clothingId,
            @RequestBody ClothingDTO clothingDTO) {
        log.info("Updating laundry status for clothing: {} for user: {}", clothingId, userId);
        clothingService.updateLaundryStatus(userId, clothingId, clothingDTO.getIsInLaundry());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{clothingId}")
    public ResponseEntity<ClothingDTO> updateClothing(
            @PathVariable String userId,
            @PathVariable String clothingId,
            @RequestBody ClothingDTO clothingDTO) {
        log.info("Updating clothing: {} for user: {}", clothingId, userId);
        ClothingDTO updatedClothing = clothingService.updateClothing(userId, clothingId, clothingDTO);
        if (updatedClothing != null) {
            return ResponseEntity.ok(updatedClothing);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
