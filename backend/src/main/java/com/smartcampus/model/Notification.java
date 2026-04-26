package com.smartcampus.model;

import lombok.Data;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Module D — Notifications
 * Owner: Member 4 (feature/auth)
 */
@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String userId;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;   // bookingId or ticketId
    private boolean read = false;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
        TICKET_STATUS_CHANGED, TICKET_COMMENT_ADDED,
        TICKET_ASSIGNED, GENERAL
    }
}
