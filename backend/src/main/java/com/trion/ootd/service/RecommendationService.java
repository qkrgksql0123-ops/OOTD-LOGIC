package com.trion.ootd.service;

import com.trion.ootd.dto.ClothingDTO;
import com.trion.ootd.entity.Recommendation;
import com.trion.ootd.entity.User;
import com.trion.ootd.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final BedrockService bedrockService;
    private final EnvironmentService environmentService;
    private final ClothingService clothingService;
    private final UserService userService;

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

            // Bedrock AI를 통한 코디 추천 생성
            String aiRecommendation = bedrockService.generateOutfitRecommendation(
                    userClothingData,
                    weatherInfo
            );

            // 추천 정보 저장
            Recommendation recommendation = Recommendation.builder()
                    .userId(userId)
                    .recommendDate(LocalDate.now().toString())
                    .recommendedOutfits(aiRecommendation)
                    .generatedByModel("bedrock-claude-3-haiku")
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
            return bedrockService.generateOutfitRecommendation(
                    userClothingData,
                    weatherInfo
            );
        } catch (Exception e) {
            log.error("Error in quick AI recommendation", e);
            return "코디 추천을 생성할 수 없습니다. 나중에 다시 시도해주세요.";
        }
    }

    /**
     * 옷장 + 스타일 프로필 + 실제 날씨 기반 AI 추천
     */
    public String generateFullAIRecommendation(String userId, String temp, String weather, String humidity) {
        return generateFullAIRecommendation(userId, temp, weather, humidity, null);
    }

    public String generateFullAIRecommendation(String userId, String temp, String weather, String humidity, String style) {
        log.info("Generating full AI recommendation for user: {}, style: {}", userId, style);

        List<ClothingDTO> clothingList = clothingService.getAllClothing(userId).stream()
                .filter(c -> !Boolean.TRUE.equals(c.getIsInLaundry()))
                .collect(java.util.stream.Collectors.toList());
        String clothingData = formatClothingData(clothingList);

        String styleProfile = "";
        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isPresent()) {
            styleProfile = formatStyleProfile(userOpt.get());
        }

        String weatherInfo = buildWeatherInfo(temp, weather, humidity);

        return bedrockService.generateOutfitRecommendationWithProfile(clothingData, styleProfile, weatherInfo, style);
    }

    private String buildWeatherInfo(String temp, String weather, String humidity) {
        if (temp != null && weather != null) {
            String info = "기온: " + temp + "°C, 날씨: " + weather;
            if (humidity != null) info += ", 습도: " + humidity + "%";
            return info;
        }
        return "기온: 20°C, 날씨: 맑음, 습도: 60%";
    }

    private String formatClothingData(List<ClothingDTO> list) {
        if (list == null || list.isEmpty()) return "등록된 옷이 없습니다.";
        StringBuilder sb = new StringBuilder();
        for (ClothingDTO c : list) {
            // 색상과 서브카테고리를 앞에 명확히 표기 (AI 매칭 정확도 향상)
            sb.append("- ");
            if (c.getColor() != null && !c.getColor().isBlank()) sb.append(c.getColor()).append(" ");
            if (c.getSubcategory() != null && !c.getSubcategory().isBlank()) {
                sb.append(c.getSubcategory());
            } else {
                sb.append(c.getCategory() != null ? c.getCategory() : "의류");
            }
            if (c.getSeason() != null && !c.getSeason().isBlank()) sb.append(" (").append(c.getSeason()).append(")");
            sb.append("\n");
        }
        return sb.toString();
    }

    private String formatStyleProfile(User user) {
        StringBuilder sb = new StringBuilder();
        if (str(user.getStyleTypes()))    sb.append("선호 스타일: ").append(user.getStyleTypes()).append("\n");
        if (str(user.getPreferredColors())) sb.append("선호 색상: ").append(user.getPreferredColors()).append("\n");
        if (str(user.getPersonalTone())) {
            sb.append("퍼스널 톤: ").append(user.getPersonalTone());
            if (str(user.getToneSeason())) sb.append(" (").append(user.getToneSeason()).append(")");
            sb.append("\n");
        }
        if (str(user.getFaceShape()))      sb.append("얼굴형: ").append(user.getFaceShape()).append("\n");
        if (str(user.getFitPreference()))  sb.append("선호 핏: ").append(user.getFitPreference()).append("\n");
        if (user.getHeight() != null)      sb.append("키: ").append(user.getHeight()).append("cm\n");
        return sb.toString();
    }

    private boolean str(String s) { return s != null && !s.isBlank(); }

    /**
     * 추천용 날씨 정보 조회
     */
    private String getWeatherInfoForRecommendation() {
        try {
            return "기온: 20°C, 날씨: 맑음, 습도: 60%";
        } catch (Exception e) {
            log.warn("Failed to get weather info, using default", e);
            return "날씨 정보를 조회할 수 없습니다. 기본 코디 추천을 제공합니다.";
        }
    }
}
