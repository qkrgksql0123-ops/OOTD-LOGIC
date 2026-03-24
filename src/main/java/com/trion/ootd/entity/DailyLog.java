package com.trion.ootd.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.util.List;

@DynamoDbBean
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyLog {

    private String userId;
    private String logDate;
    private String outwearClothingId;
    private String topClothingId;
    private String bottomClothingId;
    private String shoeClothingId;
    private List<String> accessories;
    private Double temperature;
    private Double humidity;
    private Integer uvIndex;
    private Integer microDust;
    private Integer fineDust;
    private Double windSpeed;
    private String weatherCondition;
    private String scheduledEvents;
    private Integer userComfort;
    private String feedback;
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
    @DynamoDbAttribute("logDate")
    public String getLogDate() {
        return logDate;
    }

    public void setLogDate(String logDate) {
        this.logDate = logDate;
    }

    @DynamoDbAttribute("outwearClothingId")
    public String getOutwearClothingId() {
        return outwearClothingId;
    }

    public void setOutwearClothingId(String outwearClothingId) {
        this.outwearClothingId = outwearClothingId;
    }

    @DynamoDbAttribute("topClothingId")
    public String getTopClothingId() {
        return topClothingId;
    }

    public void setTopClothingId(String topClothingId) {
        this.topClothingId = topClothingId;
    }

    @DynamoDbAttribute("bottomClothingId")
    public String getBottomClothingId() {
        return bottomClothingId;
    }

    public void setBottomClothingId(String bottomClothingId) {
        this.bottomClothingId = bottomClothingId;
    }

    @DynamoDbAttribute("shoeClothingId")
    public String getShoeClothingId() {
        return shoeClothingId;
    }

    public void setShoeClothingId(String shoeClothingId) {
        this.shoeClothingId = shoeClothingId;
    }

    @DynamoDbAttribute("accessories")
    public List<String> getAccessories() {
        return accessories;
    }

    public void setAccessories(List<String> accessories) {
        this.accessories = accessories;
    }

    @DynamoDbAttribute("temperature")
    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    @DynamoDbAttribute("humidity")
    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    @DynamoDbAttribute("uvIndex")
    public Integer getUvIndex() {
        return uvIndex;
    }

    public void setUvIndex(Integer uvIndex) {
        this.uvIndex = uvIndex;
    }

    @DynamoDbAttribute("microDust")
    public Integer getMicroDust() {
        return microDust;
    }

    public void setMicroDust(Integer microDust) {
        this.microDust = microDust;
    }

    @DynamoDbAttribute("fineDust")
    public Integer getFineDust() {
        return fineDust;
    }

    public void setFineDust(Integer fineDust) {
        this.fineDust = fineDust;
    }

    @DynamoDbAttribute("windSpeed")
    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    @DynamoDbAttribute("weatherCondition")
    public String getWeatherCondition() {
        return weatherCondition;
    }

    public void setWeatherCondition(String weatherCondition) {
        this.weatherCondition = weatherCondition;
    }

    @DynamoDbAttribute("scheduledEvents")
    public String getScheduledEvents() {
        return scheduledEvents;
    }

    public void setScheduledEvents(String scheduledEvents) {
        this.scheduledEvents = scheduledEvents;
    }

    @DynamoDbAttribute("userComfort")
    public Integer getUserComfort() {
        return userComfort;
    }

    public void setUserComfort(Integer userComfort) {
        this.userComfort = userComfort;
    }

    @DynamoDbAttribute("feedback")
    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    @DynamoDbAttribute("createdAt")
    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
