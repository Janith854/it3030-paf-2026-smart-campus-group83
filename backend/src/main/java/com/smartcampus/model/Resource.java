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
    private List<String> availabilityWindows;
    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;

    public enum ResourceType { LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT }
    public enum ResourceStatus { ACTIVE, OUT_OF_SERVICE, MAINTENANCE }
}
