package com.smartcampus.dto;

import com.smartcampus.model.Resource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ResourceDTO {
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private Resource.ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    @NotNull(message = "Status is required")
    private Resource.ResourceStatus status;

    private List<String> availabilityWindows;

    // Helper method to convert Entity to DTO
    public static ResourceDTO fromEntity(Resource entity) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setCapacity(entity.getCapacity());
        dto.setLocation(entity.getLocation());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setAvailabilityWindows(entity.getAvailabilityWindows());
        return dto;
    }

    // Helper method to convert DTO to Entity
    public Resource toEntity() {
        Resource entity = new Resource();
        entity.setId(this.id);
        entity.setName(this.name);
        entity.setType(this.type);
        entity.setCapacity(this.capacity);
        entity.setLocation(this.location);
        entity.setDescription(this.description);
        entity.setStatus(this.status);
        entity.setAvailabilityWindows(this.availabilityWindows);
        return entity;
    }
}
