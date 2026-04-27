package com.smartcampus.model;

import java.time.LocalDateTime;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    @Indexed(unique = true)
    private String email;
    private String name;
    private String password;
    private String department;
    private String empId;
    private String picture;
    private String googleId;

    private NotificationPreferences notificationPreferences = new NotificationPreferences();

    private Role role = Role.USER;

    @Data
    public static class NotificationPreferences {
        private boolean bookingApproved = true;
        private boolean bookingRejected = true;
        private boolean ticketStatusChanged = true;
        private boolean newCommentOnTicket = true;
        private boolean technicianAssigned = true;
        private boolean generalAlerts = true;
    }

    @CreatedDate
    private LocalDateTime createdAt;
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Role {
        USER, ADMIN, TECHNICIAN
    }
}
