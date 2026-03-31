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
    private final OpenRouterService openRouterService;
    private final EnvironmentService environmentService;

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

    /**
     * OpenRouter AI를 사용하여 사용자 맞춤형 코디 추천 생성
     *
     * @param userId 사용자 ID
     * @param userClothingData 사용자의 옷장 데이터
     * @return 저장된 추천 정보
     */
    public Recommendation generateAIRecommendation(String userId, String userClothingData) {
        log.info("Generating AI outfit recommendation for user: {}", userId);

        try {
            // 날씨 정보 조회
            String weatherInfo = getWeatherInfoForRecommendation();

            // OpenRouter API를 통한 AI 코디 추천 생성
            String aiRecommendation = openRouterService.generateOutfitRecommendation(
                    userClothingData,
                    weatherInfo
            );

            // 추천 정보 저장
            Recommendation recommendation = Recommendation.builder()
                    .userId(userId)
                    .recommendDate(LocalDate.now().toString())
                    .recommendedOutfits(aiRecommendation)
                    .generatedByModel("openrouter-mistral-7b")
                    .modelVersion("1.0")
                    .createdAt(LocalDateTime.now().toString())
                    .build();

            recommendationRepository.save(recommendation);
            log.info("AI recommendation saved successfully for user: {}", userId);

            return recommendation;
        } catch (Exception e) {
            log.error("Error generating AI recommendation for user: {}", userId, e);
            throw new RuntimeException("AI 코디 추천 생성 실패", e);
        }
    }

    /**
     * 빠른 AI 코디 추천 (저장하지 않음)
     *
     * @param userClothingData 사용자의 옷장 데이터
     * @return 코디 추천 문장
     */
    public String quickAIRecommendation(String userClothingData) {
        log.info("Generating quick AI outfit recommendation");

        try {
            String weatherInfo = getWeatherInfoForRecommendation();
            return openRouterService.generateOutfitRecommendation(
                    userClothingData,
                    weatherInfo
            );
        } catch (Exception e) {
            log.error("Error in quick AI recommendation", e);
            return "코디 추천을 생성할 수 없습니다. 나중에 다시 시도해주세요.";
        }
    }

    /**
     * 추천용 날씨 정보 조회
     */
    private String getWeatherInfoForRecommendation() {
        try {
            // 기본값 반환 (클라이언트가 날씨 정보를 함께 전달함)
            return "기온: 20°C, 날씨: 맑음, 습도: 60%";
        } catch (Exception e) {
            log.warn("Failed to get weather info, using default", e);
            return "날씨 정보를 조회할 수 없습니다. 기본 코디 추천을 제공합니다.";
        }
    }
}
