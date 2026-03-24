package com.trion.ootd.service;

import com.trion.ootd.entity.Recommendation;
import com.trion.ootd.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;

    public Recommendation saveRecommendation(String userId, String recommendedOutfits,
                                           Double temperature, String weatherCondition) {
        log.info("Saving recommendation for user: {}", userId);

        Recommendation recommendation = Recommendation.builder()
                .userId(userId)
                .recommendDate(LocalDate.now().toString())
                .recommendedOutfits(recommendedOutfits)
                .temperature(temperature)
                .weatherCondition(weatherCondition)
                .generatedByModel("gemini-pro")
                .modelVersion("1.0")
                .createdAt(LocalDateTime.now().toString())
                .build();

        recommendationRepository.save(recommendation);
        log.info("Recommendation saved successfully for user: {}", userId);

        return recommendation;
    }

    public Optional<Recommendation> getTodayRecommendation(String userId) {
        log.info("Getting today's recommendation for user: {}", userId);
        String today = LocalDate.now().toString();
        return recommendationRepository.findByUserIdAndDate(userId, today);
    }

    public List<Recommendation> getUserRecommendations(String userId) {
        log.info("Getting all recommendations for user: {}", userId);
        return recommendationRepository.findByUserId(userId);
    }

    public List<Recommendation> getRecentRecommendations(String userId, int limit) {
        log.info("Getting {} recent recommendations for user: {}", limit, userId);
        return recommendationRepository.findLatestRecommendations(userId, limit);
    }

    public void saveUserFeedback(String userId, String recommendDate, Integer score, String feedback) {
        log.info("Saving feedback for user: {} on date: {}", userId, recommendDate);

        Optional<Recommendation> recOptional = recommendationRepository.findByUserIdAndDate(userId, recommendDate);
        if (recOptional.isPresent()) {
            Recommendation recommendation = recOptional.get();
            recommendation.setUserFeedbackScore(score);
            recommendation.setUserFeedbackText(feedback);
            recommendationRepository.save(recommendation);
            log.info("Feedback saved successfully");
        } else {
            log.warn("Recommendation not found for user: {} on date: {}", userId, recommendDate);
        }
    }

    public void deleteRecommendation(String userId, String recommendDate) {
        log.info("Deleting recommendation for user: {} on date: {}", userId, recommendDate);
        recommendationRepository.delete(userId, recommendDate);
        log.info("Recommendation deleted successfully");
    }
}
