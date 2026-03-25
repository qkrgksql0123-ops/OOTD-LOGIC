package com.trion.ootd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentDTO {
    private String region;
    private String dataDate;
    private Double temperature;
    private Double minTemp;
    private Double maxTemp;
    private Double humidity;
    private String weatherCondition;
    private Integer pm25;
    private Integer pm10;
    private String fetchedAt;
}
