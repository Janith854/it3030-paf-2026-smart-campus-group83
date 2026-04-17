package com.smartcampus.dto;

import com.smartcampus.model.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private String id;
    private String userId;
    private String title;
    private String message;
    private boolean read;
    private Notification.NotificationType type;
    private String referenceId;
    private LocalDateTime createdAt;

    public static NotificationDTO fromEntity(Notification entity) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setTitle(entity.getTitle());
        dto.setMessage(entity.getMessage());
        dto.setRead(entity.isRead());
        dto.setType(entity.getType());
        dto.setReferenceId(entity.getReferenceId());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
