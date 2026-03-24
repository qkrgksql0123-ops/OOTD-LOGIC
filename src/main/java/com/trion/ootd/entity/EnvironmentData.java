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
public class EnvironmentData {

    private String region;
    private String dataDate;
    private Double temperature;
    private Double minTemp;
    private Double maxTemp;
    private Double humidity;
    private Double windSpeed;
    private Double precipitation;
    private Integer uvIndex;
    private Integer pm10;
    private Integer pm25;
    private String weatherCondition;
    private String skyCondition;
    private String fetchedAt;
    private Long ttl;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("region")
    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    @DynamoDbSortKey
    @DynamoDbAttribute("dataDate")
    public String getDataDate() {
        return dataDate;
    }

    public void setDataDate(String dataDate) {
        this.dataDate = dataDate;
    }

    @DynamoDbAttribute("temperature")
    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    @DynamoDbAttribute("minTemp")
    public Double getMinTemp() {
        return minTemp;
    }

    public void setMinTemp(Double minTemp) {
        this.minTemp = minTemp;
    }

    @DynamoDbAttribute("maxTemp")
    public Double getMaxTemp() {
        return maxTemp;
    }

    public void setMaxTemp(Double maxTemp) {
        this.maxTemp = maxTemp;
    }

    @DynamoDbAttribute("humidity")
    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    @DynamoDbAttribute("windSpeed")
    public Double getWindSpeed() {
        return windSpeed;
    }

    public void setWindSpeed(Double windSpeed) {
        this.windSpeed = windSpeed;
    }

    @DynamoDbAttribute("precipitation")
    public Double getPrecipitation() {
        return precipitation;
    }

    public void setPrecipitation(Double precipitation) {
        this.precipitation = precipitation;
    }

    @DynamoDbAttribute("uvIndex")
    public Integer getUvIndex() {
        return uvIndex;
    }

    public void setUvIndex(Integer uvIndex) {
        this.uvIndex = uvIndex;
    }

    @DynamoDbAttribute("pm10")
    public Integer getPm10() {
        return pm10;
    }

    public void setPm10(Integer pm10) {
        this.pm10 = pm10;
    }

    @DynamoDbAttribute("pm25")
    public Integer getPm25() {
        return pm25;
    }

    public void setPm25(Integer pm25) {
        this.pm25 = pm25;
    }

    @DynamoDbAttribute("weatherCondition")
    public String getWeatherCondition() {
        return weatherCondition;
    }

    public void setWeatherCondition(String weatherCondition) {
        this.weatherCondition = weatherCondition;
    }

    @DynamoDbAttribute("skyCondition")
    public String getSkyCondition() {
        return skyCondition;
    }

    public void setSkyCondition(String skyCondition) {
        this.skyCondition = skyCondition;
    }

    @DynamoDbAttribute("fetchedAt")
    public String getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(String fetchedAt) {
        this.fetchedAt = fetchedAt;
    }

    @DynamoDbAttribute("ttl")
    public Long getTtl() {
        return ttl;
    }

    public void setTtl(Long ttl) {
        this.ttl = ttl;
    }
}
