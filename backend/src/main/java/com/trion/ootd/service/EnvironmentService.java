package com.trion.ootd.service;

import com.trion.ootd.entity.EnvironmentData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnvironmentService {

    public EnvironmentData createEnvironmentData(String region, Double temperature, Double minTemp,
                                                Double maxTemp, Double humidity, String weatherCondition) {
        log.info("Creating environment data for region: {}", region);

        EnvironmentData environmentData = EnvironmentData.builder()
                .region(region)
                .dataDate(LocalDate.now().toString())
                .temperature(temperature)
                .minTemp(minTemp)
                .maxTemp(maxTemp)
                .humidity(humidity)
                .weatherCondition(weatherCondition)
                .fetchedAt(LocalDateTime.now().toString())
                .ttl(getTTL())
                .build();

        log.info("Environment data created for region: {}", region);
        return environmentData;
    }

    public String getWeatherDescription(Double temperature, String weatherCondition) {
        log.info("Getting weather description: temp={}, condition={}", temperature, weatherCondition);

        StringBuilder description = new StringBuilder();
        description.append("현재 날씨: ").append(weatherCondition).append(", ");
        description.append("기온: ").append(temperature).append("°C");

        if (temperature < 0) {
            description.append(" (매우 추움 - 두꺼운 옷 필수)");
        } else if (temperature < 10) {
            description.append(" (추움 - 아우터 필수)");
        } else if (temperature < 20) {
            description.append(" (선선함 - 가벼운 아우터)");
        } else if (temperature < 25) {
            description.append(" (쾌적함 - 반소매 가능)");
        } else {
            description.append(" (더움 - 얇은 옷)");
        }

        return description.toString();
    }

    public String getWeatherWarning(String weatherCondition, Integer pm25, Integer pm10) {
        log.info("Getting weather warning: condition={}, pm25={}, pm10={}", weatherCondition, pm25, pm10);

        StringBuilder warning = new StringBuilder();

        if ("비".equals(weatherCondition) || "눈".equals(weatherCondition)) {
            warning.append("🌧️ 방수 기능의 옷을 입으세요. ");
        }

        if (pm25 != null && pm25 > 50) {
            warning.append("😷 미세먼지 높음 - 마스크 권장. ");
        }

        if (pm10 != null && pm10 > 150) {
            warning.append("😷 미세먼지 매우 높음 - 외출 시 주의하세요. ");
        }

        return warning.length() > 0 ? warning.toString() : "특별한 주의사항 없습니다.";
    }

    private Long getTTL() {
        long currentTime = System.currentTimeMillis() / 1000;
        long thirtyDaysLater = currentTime + (30 * 24 * 60 * 60);
        return thirtyDaysLater;
    }
}
