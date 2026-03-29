package com.trion.ootd.controller;

import com.trion.ootd.entity.EnvironmentData;
import com.trion.ootd.service.EnvironmentService;
import com.trion.ootd.util.WeatherParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@RestController
@RequestMapping("/api/environment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EnvironmentController {

    private final EnvironmentService environmentService;
    private final WeatherParser weatherParser;

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

    @GetMapping("/weather")
    public ResponseEntity<EnvironmentData> getWeatherFromKMA(
            @RequestParam(required = false) String date) {
        try {
            if (date == null || date.isEmpty()) {
                date = LocalDate.now().minusDays(1).format(DateTimeFormatter.ISO_DATE);
            }
            log.info("Fetching weather from KMA for date: {}", date);
            EnvironmentData weatherData = weatherParser.getWeatherData(date);
            return ResponseEntity.ok(weatherData);
        } catch (Exception e) {
            log.error("Error fetching weather data", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/weather/{region}")
    public ResponseEntity<EnvironmentData> getWeatherByRegion(
            @PathVariable String region,
            @RequestParam(required = false) String date) {
        try {
            if (date == null || date.isEmpty()) {
                date = LocalDate.now().minusDays(1).format(DateTimeFormatter.ISO_DATE);
            }
            log.info("Fetching weather for region: {}, date: {}", region, date);
            EnvironmentData weatherData = weatherParser.getWeatherDataByRegion(date, region);
            return ResponseEntity.ok(weatherData);
        } catch (Exception e) {
            log.error("Error fetching weather data for region: {}", region, e);
            return ResponseEntity.status(500).build();
        }
    }
}
