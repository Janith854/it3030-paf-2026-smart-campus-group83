package com.smartcampus.model;

import lombok.Data;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Module C — Maintenance & Incident Ticketing
 * Owner: Member 3 (feature/tickets)
 */
@Data
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;

    private String resourceId;
    private String reportedByUserId;
    private String assignedTechnicianId;

    private String category;
    private String description;
    private Priority priority;
    private String location;
    private String preferredContact;

    // Up to 3 image attachment paths
    private List<String> imageAttachments = new ArrayList<>();

    private TicketStatus status = TicketStatus.OPEN;
    private String resolutionNotes;
    private String rejectionReason;

    private List<Comment> comments = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    @Data
    public static class Comment {
        private String id;
        private String userId;
        private String content;
        private LocalDateTime createdAt;
    }
}
