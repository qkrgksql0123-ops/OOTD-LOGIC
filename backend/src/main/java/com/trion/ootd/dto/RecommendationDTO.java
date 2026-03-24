package com.trion.ootd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDTO {
    private String userId;
    private String recommendDate;
    private String recommendedOutfits;
    private Double temperature;
    private String weatherCondition;
    private String generatedByModel;
    private String modelVersion;
    private Integer userFeedbackScore;
    private String userFeedbackText;
    private String createdAt;
}
