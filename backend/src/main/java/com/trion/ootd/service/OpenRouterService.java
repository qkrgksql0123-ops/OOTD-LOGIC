package com.trion.ootd.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenRouterService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.api.model}")
    private String model;

    /**
     * OpenRouter API를 호출하여 AI 코디 추천 생성
     *
     * @param userClothing 사용자의 옷장 데이터
     * @param weatherInfo 날씨 정보
     * @return 코디 추천 문장
     */
    public String generateOutfitRecommendation(String userClothing, String weatherInfo) {
        log.info("Generating outfit recommendation using OpenRouter API");

        try {
            String prompt = buildPrompt(userClothing, weatherInfo);
            String recommendation = callOpenRouterAPI(prompt);
            log.info("Successfully generated recommendation");
            return recommendation;
        } catch (Exception e) {
            log.error("Error generating outfit recommendation", e);
            return "코디 추천을 생성할 수 없습니다. 나중에 다시 시도해주세요.";
        }
    }

    /**
     * OpenRouter API 호출
     */
    private String callOpenRouterAPI(String prompt) {
        try {
            // 요청 바디 구성
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", List.of(
                    Map.of("role", "user", "content", prompt)
            ));
            body.put("temperature", 0.7);
            body.put("max_tokens", 500);

            // 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            // API 호출
            log.info("Calling OpenRouter API at {}", apiUrl);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                String responseBody = response.getBody();
                log.info("OpenRouter API response received");
                return parseOpenRouterResponse(responseBody);
            } else {
                log.error("OpenRouter API error: {}", response.getStatusCode());
                return "API 호출 중 오류가 발생했습니다.";
            }
        } catch (Exception e) {
            log.error("Error calling OpenRouter API", e);
            throw new RuntimeException("OpenRouter API 호출 실패", e);
        }
    }

    /**
     * OpenRouter API 응답 파싱
     */
    private String parseOpenRouterResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.get("choices");

            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).get("message");
                if (message != null) {
                    String content = message.get("content").asText();
                    log.info("Successfully parsed OpenRouter response");
                    return content;
                }
            }

            log.warn("Unexpected OpenRouter response format");
            return "응답 형식이 올바르지 않습니다.";
        } catch (Exception e) {
            log.error("Error parsing OpenRouter response", e);
            return "응답 파싱 중 오류가 발생했습니다.";
        }
    }

    /**
     * 코디 추천 프롬프트 구성
     */
    private String buildPrompt(String userClothing, String weatherInfo) {
        return String.format("""
                당신은 전문 스타일리스트입니다. 사용자의 옷장 데이터와 날씨 정보를 바탕으로 오늘의 최적의 코디를 추천해주세요.

                [사용자의 옷장]
                %s

                [오늘의 날씨]
                %s

                요청사항:
                1. 위의 옷장 데이터에서만 옷을 선택하여 코디를 구성해주세요.
                2. 날씨 정보를 고려하여 적절한 옷을 추천해주세요.
                3. 추천하는 코디를 한 문장으로 간결하게 설명해주세요.
                4. 추천 이유를 한 문장으로 설명해주세요.

                형식:
                추천 코디: [상의], [하의], [외투]
                추천 이유: [이유]
                """, userClothing, weatherInfo);
    }
}
