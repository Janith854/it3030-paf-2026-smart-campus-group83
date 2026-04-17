package com.smartcampus.model;

import lombok.Data;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Module A — Facilities & Assets Catalogue
 * Owner: Member 1 (feature/facilities)
 */
@Data
@Document(collection = "resources")
public class Resource {
    @Id
    private String id;

    @NotBlank(message = "Name cannot be empty")
    private String name;
    
    private ResourceType type;
    
    @Min(value = 1, message = "Capacity must be greater than 0")
    private Integer capacity;
    
    @NotBlank(message = "Location cannot be empty")
    private String location;

    private String description;
    private ResourceStatus status = ResourceStatus.ACTIVE;

    // Availability windows e.g. ["08:00-18:00"]
    private List<String> availabilityWindows;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ResourceType {
        LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    }

    public enum ResourceStatus {
        ACTIVE, OUT_OF_SERVICE, MAINTENANCE
    }
}
