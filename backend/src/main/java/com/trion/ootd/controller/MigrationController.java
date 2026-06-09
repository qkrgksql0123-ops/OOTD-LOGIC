package com.trion.ootd.controller;

import com.trion.ootd.entity.Clothing;
import com.trion.ootd.repository.DynamoDbClothingRepository;
import com.trion.ootd.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MigrationController {

    private final DynamoDbClothingRepository clothingRepository;
    private final S3Service s3Service;

    @PostMapping("/migrate-images")
    public ResponseEntity<?> migrateImagesToS3() {
        log.info("Starting DynamoDB Base64 → S3 migration");

        int total = 0, migrated = 0, skipped = 0, failed = 0;

        List<Clothing> all = clothingRepository.scanAll();
        total = all.size();

        for (Clothing clothing : all) {
            String imageUrl = clothing.getImageUrl();
            if (imageUrl == null || !imageUrl.startsWith("data:")) {
                skipped++;
                continue;
            }
            try {
                String s3Url = s3Service.uploadBase64Image(imageUrl, clothing.getUserId());
                clothing.setImageUrl(s3Url);
                clothingRepository.save(clothing);
                migrated++;
                log.info("Migrated: {}/{} - {}", clothing.getUserId(), clothing.getId(), s3Url);
            } catch (Exception e) {
                failed++;
                log.error("Failed to migrate: {}/{}", clothing.getUserId(), clothing.getId(), e);
            }
        }

        log.info("Migration complete. total={}, migrated={}, skipped={}, failed={}", total, migrated, skipped, failed);
        return ResponseEntity.ok(Map.of(
            "total", total,
            "migrated", migrated,
            "skipped", skipped,
            "failed", failed
        ));
    }
}