package com.trion.ootd.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@DynamoDbBean
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {

    private String userId;
    private String recommendDate;
    private String recommendedOutfits;
    private Double temperature;
    private String weatherCondition;
    private String weatherWarning;
    private String upcomingSchedules;
    private String generatedByModel;
    private String modelVersion;
    private Integer userFeedbackScore;
    private String userFeedbackText;
    private String createdAt;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @DynamoDbSortKey
    @DynamoDbAttribute("recommendDate")
    public String getRecommendDate() {
        return recommendDate;
    }

    public void setRecommendDate(String recommendDate) {
        this.recommendDate = recommendDate;
    }

    @DynamoDbAttribute("recommendedOutfits")
    public String getRecommendedOutfits() {
        return recommendedOutfits;
    }

    public void setRecommendedOutfits(String recommendedOutfits) {
        this.recommendedOutfits = recommendedOutfits;
    }

    @DynamoDbAttribute("temperature")
    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    @DynamoDbAttribute("weatherCondition")
    public String getWeatherCondition() {
        return weatherCondition;
    }

    public void setWeatherCondition(String weatherCondition) {
        this.weatherCondition = weatherCondition;
    }

    @DynamoDbAttribute("weatherWarning")
    public String getWeatherWarning() {
        return weatherWarning;
    }

    public void setWeatherWarning(String weatherWarning) {
        this.weatherWarning = weatherWarning;
    }

    @DynamoDbAttribute("upcomingSchedules")
    public String getUpcomingSchedules() {
        return upcomingSchedules;
    }

    public void setUpcomingSchedules(String upcomingSchedules) {
        this.upcomingSchedules = upcomingSchedules;
    }

    @DynamoDbAttribute("generatedByModel")
    public String getGeneratedByModel() {
        return generatedByModel;
    }

    public void setGeneratedByModel(String generatedByModel) {
        this.generatedByModel = generatedByModel;
    }

    @DynamoDbAttribute("modelVersion")
    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    @DynamoDbAttribute("userFeedbackScore")
    public Integer getUserFeedbackScore() {
        return userFeedbackScore;
    }

    public void setUserFeedbackScore(Integer userFeedbackScore) {
        this.userFeedbackScore = userFeedbackScore;
    }

    @DynamoDbAttribute("userFeedbackText")
    public String getUserFeedbackText() {
        return userFeedbackText;
    }

    public void setUserFeedbackText(String userFeedbackText) {
        this.userFeedbackText = userFeedbackText;
    }

    @DynamoDbAttribute("createdAt")
    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
