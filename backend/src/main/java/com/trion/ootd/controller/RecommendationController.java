package com.trion.ootd.controller;

import com.trion.ootd.entity.Recommendation;
import com.trion.ootd.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/users/{userId}/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    public ResponseEntity<Recommendation> saveRecommendation(
            @PathVariable String userId,
            @RequestParam String recommendedOutfits,
            @RequestParam Double temperature,
            @RequestParam String weatherCondition) {
        log.info("Saving recommendation for user: {}", userId);
        Recommendation recommendation = recommendationService.saveRecommendation(
                userId, recommendedOutfits, temperature, weatherCondition);
        return ResponseEntity.ok(recommendation);
    }

    @GetMapping("/today")
    public ResponseEntity<Recommendation> getTodayRecommendation(@PathVariable String userId) {
        log.info("Getting today's recommendation for user: {}", userId);
        Optional<Recommendation> recommendation = recommendationService.getTodayRecommendation(userId);
        return recommendation.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Recommendation>> getUserRecommendations(@PathVariable String userId) {
        log.info("Getting all recommendations for user: {}", userId);
        List<Recommendation> recommendations = recommendationService.getUserRecommendations(userId);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Recommendation>> getRecentRecommendations(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Getting {} recent recommendations for user: {}", limit, userId);
        List<Recommendation> recommendations = recommendationService.getRecentRecommendations(userId, limit);
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/feedback")
    public ResponseEntity<Void> saveUserFeedback(
            @PathVariable String userId,
            @RequestParam String recommendDate,
            @RequestParam Integer score,
            @RequestParam(required = false) String feedback) {
        log.info("Saving feedback for user: {} on date: {}", userId, recommendDate);
        recommendationService.saveUserFeedback(userId, recommendDate, score, feedback);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteRecommendation(
            @PathVariable String userId,
            @RequestParam String recommendDate) {
        log.info("Deleting recommendation for user: {} on date: {}", userId, recommendDate);
        recommendationService.deleteRecommendation(userId, recommendDate);
        return ResponseEntity.ok().build();
    }
}
