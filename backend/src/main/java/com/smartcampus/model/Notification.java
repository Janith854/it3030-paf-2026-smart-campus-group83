package com.smartcampus.model;

import java.time.LocalDateTime;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Data
@Document(collection = "notifications")
public class Notification {
    @Id private String id;
    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;
    private boolean read = false;
    @CreatedDate private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING_CREATED, BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
        TICKET_CREATED, TICKET_STATUS_CHANGED, TICKET_COMMENT_ADDED,
        TICKET_ASSIGNED, URGENT_PRIORITY_ALERT, GENERAL
    }
}
