package com.trion.ootd.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * 애플리케이션 공통 설정
 * - RestTemplate: OpenRouter API 호출용
 * - ObjectMapper: JSON 직렬화/역직렬화
 */
@Configuration
public class AppConfig {

    /**
     * RestTemplate 빈 생성
     * - OpenRouter API 호출용
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * ObjectMapper 빈 생성
     * - JSON 직렬화/역직렬화 용도
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
