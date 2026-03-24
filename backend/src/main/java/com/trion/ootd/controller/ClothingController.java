package com.trion.ootd.controller;

import com.trion.ootd.dto.ClothingDTO;
import com.trion.ootd.service.ClothingService;
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
}
