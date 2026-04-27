package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopResourceDTO {
    private String resourceId;
    private String resourceName;
    private String type;
    private String location;
    private long totalBookings;
}
