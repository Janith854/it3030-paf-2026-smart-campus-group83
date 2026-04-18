package com.smartcampus.service;

import com.smartcampus.model.Notification;
import java.util.List;

/** Member 4 implements this */
public interface NotificationService {
    Notification createNotification(String userId, String title, String message,
                                    Notification.NotificationType type, String referenceId);
    List<Notification> getMyNotifications(String userId);
    long getUnreadCount(String userId);
    Notification markAsRead(String id, String userId);
    void markAllAsRead(String userId);
    void deleteNotification(String id, String userId);
}
