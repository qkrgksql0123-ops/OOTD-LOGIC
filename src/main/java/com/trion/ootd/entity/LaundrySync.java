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
public class LaundrySync {

    private String userId;
    private String clothingId;
    private String status;
    private String lastWashedDate;
    private Integer recommendedWashCycle;
    private String nextWashDate;
    private Integer wearCountSinceWash;
    private String updatedAt;
    private Boolean notificationSent;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @DynamoDbSortKey
    @DynamoDbAttribute("clothingId")
    public String getClothingId() {
        return clothingId;
    }

    public void setClothingId(String clothingId) {
        this.clothingId = clothingId;
    }

    @DynamoDbAttribute("status")
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @DynamoDbAttribute("lastWashedDate")
    public String getLastWashedDate() {
        return lastWashedDate;
    }

    public void setLastWashedDate(String lastWashedDate) {
        this.lastWashedDate = lastWashedDate;
    }

    @DynamoDbAttribute("recommendedWashCycle")
    public Integer getRecommendedWashCycle() {
        return recommendedWashCycle;
    }

    public void setRecommendedWashCycle(Integer recommendedWashCycle) {
        this.recommendedWashCycle = recommendedWashCycle;
    }

    @DynamoDbAttribute("nextWashDate")
    public String getNextWashDate() {
        return nextWashDate;
    }

    public void setNextWashDate(String nextWashDate) {
        this.nextWashDate = nextWashDate;
    }

    @DynamoDbAttribute("wearCountSinceWash")
    public Integer getWearCountSinceWash() {
        return wearCountSinceWash;
    }

    public void setWearCountSinceWash(Integer wearCountSinceWash) {
        this.wearCountSinceWash = wearCountSinceWash;
    }

    @DynamoDbAttribute("updatedAt")
    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    @DynamoDbAttribute("notificationSent")
    public Boolean getNotificationSent() {
        return notificationSent;
    }

    public void setNotificationSent(Boolean notificationSent) {
        this.notificationSent = notificationSent;
    }
}
