package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

/**
 * Module D — Notifications
 * Member 4: feature/auth
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAll(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(notificationService.getMyNotifications(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    // Member 4: POST method for administrative broadcasts.
    public ResponseEntity<Void> broadcast(@RequestBody Map<String, String> body) {
        notificationService.broadcastNotification(
            body.get("title"), 
            body.get("message"), 
            com.smartcampus.model.Notification.NotificationType.valueOf(body.get("type"))
        );
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}/read")
    // Member 4: PUT method for state updates.
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable String id,
                                                     @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(notificationService.markAsRead(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','LECTURER','TECHNICIAN')")
    // Member 4: DELETE method for notification cleanup.
    public ResponseEntity<Void> deleteNotification(@PathVariable String id,
                                                  @AuthenticationPrincipal UserPrincipal user) {
        notificationService.deleteNotification(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserPrincipal user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.noContent().build();
    }
}
