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
        return generateOutfitRecommendationWithProfile(userClothing, "", weatherInfo);
    }

    public String generateOutfitRecommendationWithProfile(String userClothing, String styleProfile, String weatherInfo) {
        log.info("Generating outfit recommendation using AWS Bedrock");
        try {
            String prompt = buildPrompt(userClothing, styleProfile, weatherInfo);
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

    private String buildPrompt(String userClothing, String styleProfile, String weatherInfo) {
        String styleSection = (styleProfile != null && !styleProfile.isBlank())
                ? "\n[사용자 스타일 프로필]\n" + styleProfile : "";

        return String.format("""
                당신은 전문 스타일리스트입니다. 사용자의 옷장과 스타일 프로필, 날씨를 분석해 오늘의 최적 코디를 추천해주세요.

                [사용자의 옷장]
                %s
                %s
                [오늘의 날씨]
                %s

                요청사항:
                1. 옷장에 있는 옷만 선택해주세요.
                2. 스타일 프로필(선호 스타일, 퍼스널 톤, 얼굴형, 핏)을 최대한 반영해주세요.
                3. 날씨에 맞는 옷을 선택해주세요.
                4. 한국어로 간결하게 답해주세요.

                형식:
                추천 코디: [상의], [하의], [아우터]
                추천 이유: [이유]
                """, userClothing, styleSection, weatherInfo);
    }
}
