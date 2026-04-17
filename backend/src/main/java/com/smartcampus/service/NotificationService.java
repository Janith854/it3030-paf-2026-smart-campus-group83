package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.model.Notification;
import java.util.List;

/** Member 4 implements this */
public interface NotificationService {
    NotificationDTO createNotification(String userId, String title, String message,
                                    Notification.NotificationType type, String referenceId);
    List<NotificationDTO> getMyNotifications(String userId);
    List<NotificationDTO> getUnreadNotifications(String userId);
    long getUnreadCount(String userId);
    NotificationDTO markAsRead(String id, String userId);
    void markAllAsRead(String userId);
}
