package com.trion.ootd.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class BedrockService {

    private final BedrockRuntimeClient bedrockClient;
    private final ObjectMapper objectMapper;
    private final String modelId;

    public BedrockService(
            @Value("${aws.bedrock.region:us-east-1}") String region,
            @Value("${aws.bedrock.model-id:anthropic.claude-3-haiku-20240307-v1:0}") String modelId,
            ObjectMapper objectMapper) {
        this.modelId = modelId;
        this.objectMapper = objectMapper;
        this.bedrockClient = BedrockRuntimeClient.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public String generateOutfitRecommendation(String userClothing, String weatherInfo) {
        return generateOutfitRecommendationWithProfile(userClothing, "", weatherInfo, null);
    }

    public String generateOutfitRecommendationWithProfile(String userClothing, String styleProfile, String weatherInfo) {
        return generateOutfitRecommendationWithProfile(userClothing, styleProfile, weatherInfo, null);
    }

    public String generateOutfitRecommendationWithProfile(String userClothing, String styleProfile, String weatherInfo, String selectedStyle) {
        log.info("Generating outfit recommendation using AWS Bedrock, style: {}", selectedStyle);
        try {
            String prompt = buildPrompt(userClothing, styleProfile, weatherInfo, selectedStyle);
            return callBedrock(prompt);
        } catch (Exception e) {
            log.error("Error generating outfit recommendation via Bedrock", e);
            return "코디 추천을 생성할 수 없습니다. 나중에 다시 시도해주세요.";
        }
    }

    private String callBedrock(String prompt) throws Exception {
        Map<String, Object> body = Map.of(
                "anthropic_version", "bedrock-2023-05-31",
                "max_tokens", 500,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        String bodyJson = objectMapper.writeValueAsString(body);
        log.info("Calling Bedrock model: {}", modelId);

        InvokeModelRequest request = InvokeModelRequest.builder()
                .modelId(modelId)
                .body(SdkBytes.fromString(bodyJson, StandardCharsets.UTF_8))
                .contentType("application/json")
                .accept("application/json")
                .build();

        InvokeModelResponse response = bedrockClient.invokeModel(request);
        return parseBedrockResponse(response.body().asUtf8String());
    }

    private String parseBedrockResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode content = root.get("content");
        if (content != null && content.isArray() && content.size() > 0) {
            return content.get(0).get("text").asText();
        }
        log.warn("Unexpected Bedrock response format: {}", responseBody);
        return "응답 형식이 올바르지 않습니다.";
    }

    private String buildPrompt(String userClothing, String styleProfile, String weatherInfo, String selectedStyle) {
        String styleSection = (styleProfile != null && !styleProfile.isBlank())
                ? "\n[사용자 스타일 프로필]\n" + styleProfile : "";

        String weatherGuide = buildWeatherGuide(weatherInfo);

        String styleInstruction = "";
        String styleGuide = "";
        if (selectedStyle != null && !selectedStyle.isBlank()) {
            styleInstruction = "요청 스타일: " + selectedStyle + "\n";
            styleGuide = switch (selectedStyle) {
                case "캐주얼" -> "캐주얼 스타일: 티셔츠·맨투맨·청바지·반바지·스니커즈 등 편안하고 일상적인 아이템 우선 선택.";
                case "포멀"   -> "포멀 스타일: 셔츠·블라우스·슬렉스·정장 바지·코트·로퍼·구두 등 격식있는 아이템 우선 선택. 티셔츠·청바지·운동화 지양.";
                case "소프트" -> "소프트 스타일: 블라우스·니트·플리츠 스커트·와이드 팬츠·로퍼·메리제인 등 부드럽고 여성스러운 아이템 우선 선택.";
                default -> selectedStyle + " 스타일에 맞는 아이템 우선 선택.";
            };
        }

        return String.format("""
                당신은 전문 스타일리스트입니다. 사용자의 옷장과 스타일 프로필, 날씨를 분석해 오늘의 최적 코디를 추천해주세요.

                [사용자의 옷장]
                %s
                %s
                [오늘의 날씨]
                %s

                [날씨 착장 규칙 - 반드시 준수]
                %s

                %s
                요청사항:
                1. 옷장에 있는 옷만 선택해주세요.
                2. 위의 날씨 착장 규칙을 반드시 따르세요. 기온에 맞지 않는 옷은 절대 추천하지 마세요.
                3. 스타일 프로필(선호 스타일, 퍼스널 톤, 얼굴형, 핏)을 반영해주세요.
                4. 아우터가 필요 없는 날씨면 아우터 없음으로 표시해주세요.
                5. 요청 스타일이 있으면 그 스타일에 맞는 아이템을 최우선으로 선택해주세요.
                6. 신발과 악세사리가 옷장에 있으면 반드시 포함해주세요.
                7. 한국어로 간결하게 답해주세요.

                형식:
                추천 코디: [상의], [하의], [아우터 또는 없음], [신발], [악세사리 또는 없음]
                추천 이유: [날씨와 스타일 이유]
                """, userClothing, styleSection, weatherInfo, weatherGuide,
                styleGuide.isBlank() ? "" : "[요청 스타일 가이드]\n" + styleGuide + "\n");
    }

    private String buildWeatherGuide(String weatherInfo) {
        if (weatherInfo == null) return "계절에 맞는 옷을 선택하세요.";

        // 기온 파싱
        double temp = 20.0;
        try {
            java.util.regex.Matcher m = java.util.regex.Pattern
                    .compile("기온[:\\s]+(\\d+\\.?\\d*)").matcher(weatherInfo);
            if (m.find()) temp = Double.parseDouble(m.group(1));
        } catch (Exception ignored) {}

        if (temp >= 28) return "기온 " + temp + "°C: 매우 더운 날씨. 반팔·반바지 필수. 아우터 절대 불필요. 패딩·코트·두꺼운 니트 추천 금지.";
        if (temp >= 23) return "기온 " + temp + "°C: 더운 날씨. 반팔·얇은 상의 적합. 두꺼운 아우터(패딩·코트) 추천 금지.";
        if (temp >= 18) return "기온 " + temp + "°C: 따뜻한 날씨. 긴팔 또는 반팔 적합. 얇은 자켓·가디건 가능. 패딩·두꺼운 코트 추천 금지.";
        if (temp >= 12) return "기온 " + temp + "°C: 선선한 날씨. 긴팔·가디건·얇은 자켓 필요. 두꺼운 패딩은 불필요.";
        if (temp >= 5)  return "기온 " + temp + "°C: 쌀쌀한 날씨. 두꺼운 상의·자켓·코트 필요.";
        return "기온 " + temp + "°C: 추운 날씨. 패딩·두꺼운 코트·레이어링 필수.";
    }
}
