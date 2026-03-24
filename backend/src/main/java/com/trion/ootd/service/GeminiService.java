package com.trion.ootd.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String generateRecommendation(String prompt) {
        try {
            String requestBody = String.format(
                "{\"contents\": [{\"parts\": [{\"text\": \"%s\"}]}]}",
                prompt.replace("\"", "\\\"")
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GEMINI_API_URL + "?key=" + geminiApiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                log.info("Gemini API Response received");
                return parseGeminiResponse(response.body());
            } else {
                log.error("Gemini API Error: {}", response.statusCode());
                return "추천을 생성할 수 없습니다.";
            }
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "오류가 발생했습니다.";
        }
    }

    public String analyzeClothing(String imageDescription) {
        String prompt = String.format(
            "다음 의류를 분석해주세요: %s. 색상, 소재, 계절, 스타일을 JSON 형식으로 반환하세요.",
            imageDescription
        );
        return generateRecommendation(prompt);
    }

    public String generateOutfitRecommendation(String temperature, String weather, String preferences) {
        String prompt = String.format(
            "사용자의 온도 민감도: %s, 현재 날씨: %s, 사용자 스타일: %s 를 고려하여 " +
            "오늘의 최적 코디를 추천해주세요. JSON 형식으로 반환하세요.",
            temperature, weather, preferences
        );
        return generateRecommendation(prompt);
    }

    private String parseGeminiResponse(String response) {
        try {
            if (response.contains("\"text\"")) {
                int textStart = response.indexOf("\"text\"");
                int contentStart = response.indexOf(":", textStart) + 1;
                int contentEnd = response.indexOf("\"", contentStart + 1);
                return response.substring(contentStart, contentEnd).trim().replaceAll("\\\\n", "\n");
            }
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
        }
        return response;
    }
}
