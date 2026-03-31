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
    private String subcategory;
    private String color;
    private String material;
    private String season;
    private Integer thickness;
    private String imageUrl;
    private List<String> tags;
    private String createdAt;
    private Boolean isInLaundry;
    private String lastWornDate;
    private Integer wearCount;

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

    @DynamoDbAttribute("subcategory")
    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    @DynamoDbAttribute("color")
    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    @DynamoDbAttribute("material")
    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    @DynamoDbAttribute("season")
    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    @DynamoDbAttribute("thickness")
    public Integer getThickness() {
        return thickness;
    }

    public void setThickness(Integer thickness) {
        this.thickness = thickness;
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

    @DynamoDbAttribute("lastWornDate")
    public String getLastWornDate() {
        return lastWornDate;
    }

    public void setLastWornDate(String lastWornDate) {
        this.lastWornDate = lastWornDate;
    }

    @DynamoDbAttribute("wearCount")
    public Integer getWearCount() {
        return wearCount != null ? wearCount : 0;
    }

    public void setWearCount(Integer wearCount) {
        this.wearCount = wearCount;
    }
}
