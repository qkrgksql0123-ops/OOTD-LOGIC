package com.trion.ootd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * 의류(Clothing) 정보 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingDTO {

    private String id;
    private String userId;
    private String category;
    private String subcategory;
    private String imageUrl;
    private String color;
    private String material;
    private String season;
    private Integer thickness;
    private List<String> tags;
    private String createdAt;
    private Boolean isInLaundry;
    private String lastWornDate;
    private Integer wearCount;
}
