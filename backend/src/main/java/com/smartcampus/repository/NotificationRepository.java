package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

/** data model for store alter notifications panel queries */
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndRead(String userId, boolean read);

    long countByUserIdAndRead(String userId, boolean read);
}
