package com.trion.ootd.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@DynamoDbBean
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    private String userId;
    private String email;
    private String passwordHash;
    private String nickname;
    private Integer tempSensitivity;
    private String skinTone;
    private String faceShape;
    private String slackUserId;
    private String googleCalendarToken;
    private String profileImageUrl;
    private String preferredRegion;
    private String gender;
    private String phone;
    private String birthdate;
    private String location;
    private String preferredColors;
    private String styleTypes;
    private Integer height;
    private String fitPreference;
    private String personalTone;
    private String toneSeason;
    private String createdAt;
    private String updatedAt;
    private String lastLoginAt;
    private Boolean deactivated;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @DynamoDbAttribute("email")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @DynamoDbAttribute("passwordHash")
    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    @DynamoDbAttribute("nickname")
    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    @DynamoDbAttribute("tempSensitivity")
    public Integer getTempSensitivity() {
        return tempSensitivity;
    }

    public void setTempSensitivity(Integer tempSensitivity) {
        this.tempSensitivity = tempSensitivity;
    }

    @DynamoDbAttribute("skinTone")
    public String getSkinTone() {
        return skinTone;
    }

    public void setSkinTone(String skinTone) {
        this.skinTone = skinTone;
    }

    @DynamoDbAttribute("faceShape")
    public String getFaceShape() {
        return faceShape;
    }

    public void setFaceShape(String faceShape) {
        this.faceShape = faceShape;
    }

    @DynamoDbAttribute("slackUserId")
    public String getSlackUserId() {
        return slackUserId;
    }

    public void setSlackUserId(String slackUserId) {
        this.slackUserId = slackUserId;
    }

    @DynamoDbAttribute("googleCalendarToken")
    public String getGoogleCalendarToken() {
        return googleCalendarToken;
    }

    public void setGoogleCalendarToken(String googleCalendarToken) {
        this.googleCalendarToken = googleCalendarToken;
    }

    @DynamoDbAttribute("profileImageUrl")
    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    @DynamoDbAttribute("preferredRegion")
    public String getPreferredRegion() {
        return preferredRegion;
    }

    public void setPreferredRegion(String preferredRegion) {
        this.preferredRegion = preferredRegion;
    }

    @DynamoDbAttribute("gender")
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    @DynamoDbAttribute("phone")
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    @DynamoDbAttribute("birthdate")
    public String getBirthdate() { return birthdate; }
    public void setBirthdate(String birthdate) { this.birthdate = birthdate; }

    @DynamoDbAttribute("location")
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    @DynamoDbAttribute("preferredColors")
    public String getPreferredColors() { return preferredColors; }
    public void setPreferredColors(String preferredColors) { this.preferredColors = preferredColors; }

    @DynamoDbAttribute("styleTypes")
    public String getStyleTypes() { return styleTypes; }
    public void setStyleTypes(String styleTypes) { this.styleTypes = styleTypes; }

    @DynamoDbAttribute("height")
    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }

    @DynamoDbAttribute("fitPreference")
    public String getFitPreference() { return fitPreference; }
    public void setFitPreference(String fitPreference) { this.fitPreference = fitPreference; }

    @DynamoDbAttribute("personalTone")
    public String getPersonalTone() { return personalTone; }
    public void setPersonalTone(String personalTone) { this.personalTone = personalTone; }

    @DynamoDbAttribute("toneSeason")
    public String getToneSeason() { return toneSeason; }
    public void setToneSeason(String toneSeason) { this.toneSeason = toneSeason; }

    @DynamoDbAttribute("createdAt")
    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    @DynamoDbAttribute("updatedAt")
    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    @DynamoDbAttribute("lastLoginAt")
    public String getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(String lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    @DynamoDbAttribute("deactivated")
    public Boolean getDeactivated() {
        return deactivated;
    }

    public void setDeactivated(Boolean deactivated) {
        this.deactivated = deactivated;
    }

    @JsonIgnore
    public LocalDateTime getCreatedAtAsLocalDateTime() {
        return createdAt != null ? LocalDateTime.parse(createdAt) : null;
    }

    @JsonIgnore
    public void setCreatedAtFromLocalDateTime(LocalDateTime dateTime) {
        this.createdAt = dateTime != null ? dateTime.toString() : null;
    }
}
