package com.smartcampus.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
@Data
@Document(collection = "tickets")
public class Ticket {
    @Id private String id;
    private String resourceId;
    private String reportedByUserId;
    private String assignedTechnicianId;
    @NotBlank(message = "Category is required") private String category;
    @NotBlank(message = "Description is required") private String description;
    @NotNull(message = "Priority is required") private Priority priority;
    private String location;
    private String preferredContact;
    private List<String> imageAttachments = new ArrayList<>();
    private TicketStatus status = TicketStatus.OPEN;
    private String resolutionNotes;
    private String rejectionReason;
    private List<Comment> comments = new ArrayList<>();
    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;

    public enum TicketStatus { OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED }
    public enum Priority { LOW, MEDIUM, HIGH, CRITICAL }

    @Data
    public static class Comment {
        private String id;
        private String userId;
        private String content;
        private LocalDateTime createdAt;
    }
}
