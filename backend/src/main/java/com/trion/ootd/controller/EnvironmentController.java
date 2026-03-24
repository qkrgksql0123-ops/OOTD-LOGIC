package com.trion.ootd.controller;

import com.trion.ootd.entity.EnvironmentData;
import com.trion.ootd.service.EnvironmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/environment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EnvironmentController {

    private final EnvironmentService environmentService;

    @PostMapping("/data")
    public ResponseEntity<EnvironmentData> createEnvironmentData(
            @RequestParam String region,
            @RequestParam Double temperature,
            @RequestParam Double minTemp,
            @RequestParam Double maxTemp,
            @RequestParam Double humidity,
            @RequestParam String weatherCondition) {
        log.info("Creating environment data for region: {}", region);
        EnvironmentData environmentData = environmentService.createEnvironmentData(
                region, temperature, minTemp, maxTemp, humidity, weatherCondition);
        return ResponseEntity.ok(environmentData);
    }

    @GetMapping("/weather-description")
    public ResponseEntity<String> getWeatherDescription(
            @RequestParam Double temperature,
            @RequestParam String weatherCondition) {
        log.info("Getting weather description: temp={}, condition={}", temperature, weatherCondition);
        String description = environmentService.getWeatherDescription(temperature, weatherCondition);
        return ResponseEntity.ok(description);
    }

    @GetMapping("/weather-warning")
    public ResponseEntity<String> getWeatherWarning(
            @RequestParam String weatherCondition,
            @RequestParam(required = false) Integer pm25,
            @RequestParam(required = false) Integer pm10) {
        log.info("Getting weather warning: condition={}, pm25={}, pm10={}", weatherCondition, pm25, pm10);
        String warning = environmentService.getWeatherWarning(weatherCondition, pm25, pm10);
        return ResponseEntity.ok(warning);
    }
}
