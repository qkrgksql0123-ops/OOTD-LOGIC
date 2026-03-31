package com.trion.ootd.controller;

import com.trion.ootd.entity.Recommendation;
import com.trion.ootd.service.GeminiService;
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
    private final GeminiService geminiService;

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

    @GetMapping("/generate")
    public ResponseEntity<String> generateOutfitRecommendation(
            @PathVariable String userId,
            @RequestParam(required = false) String temperature,
            @RequestParam(required = false) String weather,
            @RequestParam(required = false) String preferences) {
        log.info("Generating outfit recommendation for user: {}", userId);

        String temp = temperature != null ? temperature : "중간(20도)";
        String weatherCond = weather != null ? weather : "맑음";
        String pref = preferences != null ? preferences : "편안함";

        String recommendation = geminiService.generateOutfitRecommendation(temp, weatherCond, pref);
        return ResponseEntity.ok(recommendation);
    }

    /**
     * OpenRouter AI를 사용하여 맞춤형 코디 추천 생성
     *
     * @param userId 사용자 ID
     * @param clothingData 사용자의 옷장 데이터 (JSON 또는 텍스트)
     * @return 저장된 AI 코디 추천
     */
    @PostMapping("/ai-recommend")
    public ResponseEntity<Recommendation> generateAIRecommendation(
            @PathVariable String userId,
            @RequestBody String clothingData) {
        log.info("Generating AI outfit recommendation for user: {} using OpenRouter", userId);

        try {
            Recommendation recommendation = recommendationService.generateAIRecommendation(
                    userId,
                    clothingData
            );
            return ResponseEntity.ok(recommendation);
        } catch (Exception e) {
            log.error("Error generating AI recommendation", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 빠른 AI 코디 추천 (저장하지 않음)
     *
     * @param userId 사용자 ID
     * @param clothingData 사용자의 옷장 데이터
     * @return AI 코디 추천 문장
     */
    @PostMapping("/ai-recommend-quick")
    public ResponseEntity<String> quickAIRecommendation(
            @PathVariable String userId,
            @RequestBody String clothingData) {
        log.info("Quick AI outfit recommendation for user: {}", userId);

        try {
            String recommendation = recommendationService.quickAIRecommendation(clothingData);
            return ResponseEntity.ok(recommendation);
        } catch (Exception e) {
            log.error("Error in quick AI recommendation", e);
            return ResponseEntity.internalServerError().body("코디 추천 생성에 실패했습니다.");
        }
    }
}
