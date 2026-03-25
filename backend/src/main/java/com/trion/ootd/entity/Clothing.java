package com.trion.ootd.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.time.LocalDateTime;
import java.util.List;

@DynamoDbBean
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Clothing {

    private String id;
    private String userId;
    private String category;
    private String imageUrl;
    private List<String> tags;
    private String createdAt;
    private Boolean isInLaundry;

    @DynamoDbSortKey
    @DynamoDbAttribute("id")
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @DynamoDbAttribute("category")
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @DynamoDbAttribute("imageUrl")
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @DynamoDbAttribute("tags")
    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    @DynamoDbAttribute("createdAt")
    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCreatedAtAsLocalDateTime() {
        return createdAt != null ? LocalDateTime.parse(createdAt) : null;
    }

    public void setCreatedAtFromLocalDateTime(LocalDateTime dateTime) {
        this.createdAt = dateTime != null ? dateTime.toString() : null;
    }

    @DynamoDbAttribute("isInLaundry")
    public Boolean getIsInLaundry() {
        return isInLaundry != null ? isInLaundry : false;
    }

    public void setIsInLaundry(Boolean isInLaundry) {
        this.isInLaundry = isInLaundry;
    }
}
