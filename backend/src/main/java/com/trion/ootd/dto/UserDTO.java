package com.trion.ootd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String userId;
    private String email;
    private Integer tempSensitivity;
    private String skinTone;
    private String createdAt;
    private String updatedAt;
    private Boolean deactivated;
}
