package com.smartcampus.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
@Data
@Document(collection = "resources")
public class Resource {
    @Id private String id;
    @NotBlank(message = "Name is required") private String name;
    @NotNull(message = "Type is required") private ResourceType type;
    private Integer capacity;
    @NotBlank(message = "Location is required") private String location;
    private String description;
    private ResourceStatus status = ResourceStatus.ACTIVE;
    @org.springframework.data.mongodb.core.mapping.Field("availabilityWindows")
    @com.fasterxml.jackson.annotation.JsonProperty("availabilityWindow")
    private String availabilityWindow;

    /** Fallback for legacy data stored as a list in MongoDB */
    public void setAvailabilityWindows(java.util.List<String> availabilityWindows) {
        if (availabilityWindows != null && !availabilityWindows.isEmpty()) {
            this.availabilityWindow = availabilityWindows.get(0);
        }
    }

    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;

    public enum ResourceType { LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT }
    public enum ResourceStatus { ACTIVE, OUT_OF_SERVICE, MAINTENANCE }
}
