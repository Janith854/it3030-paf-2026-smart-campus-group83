package com.smartcampus.service.impl;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Module D — Notifications
 * Member 4: feature/auth
 */
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationDTO createNotification(String userId, String title, String message,
                                           Notification.NotificationType type, String referenceId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setReferenceId(referenceId);
        n.setCreatedAt(java.time.LocalDateTime.now());
        Notification saved = notificationRepository.save(n);
        return NotificationDTO.fromEntity(saved);
    }

    @Override
    public List<NotificationDTO> getMyNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(NotificationDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndRead(userId, false).stream()
            .map(NotificationDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    @Override
    public NotificationDTO markAsRead(String id, String userId) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        if (!n.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found: " + id);
        }
        n.setRead(true);
        Notification saved = notificationRepository.save(n);
        return NotificationDTO.fromEntity(saved);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
