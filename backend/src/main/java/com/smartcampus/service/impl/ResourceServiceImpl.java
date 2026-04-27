package com.smartcampus.service.impl;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.service.ResourceService;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.util.List;
import java.time.LocalDate;

/**
 * Module A — Facilities & Assets
 * Member 1: feature/facilities
 */
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Override
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    @Override
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }

    @Override
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @Override
    public List<Resource> searchResources(String type, Integer minCapacity, String location, String status) {
        Query query = new Query();

        if (type != null && !type.isEmpty()) {
            query.addCriteria(Criteria.where("type").is(Resource.ResourceType.valueOf(type)));
        }

        if (minCapacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(minCapacity));
        }

        if (location != null && !location.isEmpty()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }

        if (status != null && !status.isEmpty()) {
            query.addCriteria(Criteria.where("status").is(Resource.ResourceStatus.valueOf(status)));
        }

        return mongoTemplate.find(query, Resource.class);
    }

    @Override
    public Resource updateResource(String id, Resource resource) {
        Resource existing = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));

        existing.setName(resource.getName());
        existing.setType(resource.getType());
        existing.setCapacity(resource.getCapacity());
        existing.setLocation(resource.getLocation());
        existing.setDescription(resource.getDescription());
        existing.setStatus(resource.getStatus());
        existing.setAvailabilityWindow(resource.getAvailabilityWindow());

        return resourceRepository.save(existing);
    }

    @Override
    public Resource updateStatus(String id, Resource.ResourceStatus status) {
        Resource existing = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        existing.setStatus(status);
        Resource saved = resourceRepository.save(existing);
        
        // Cancel bookings if resource becomes inactive
        if (status == Resource.ResourceStatus.MAINTENANCE || status == Resource.ResourceStatus.OUT_OF_SERVICE) {
            cancelActiveBookingsForResource(saved, status);
        }
        
        return saved;
    }

    private void cancelActiveBookingsForResource(Resource resource, Resource.ResourceStatus newStatus) {
        List<Booking> bookings = bookingRepository.findByResourceId(resource.getId());
        LocalDate today = LocalDate.now();

        for (Booking b : bookings) {
            if ((b.getStatus() == Booking.BookingStatus.PENDING || b.getStatus() == Booking.BookingStatus.APPROVED)
                && (b.getBookingDate().isEqual(today) || b.getBookingDate().isAfter(today))) {
                
                b.setStatus(Booking.BookingStatus.CANCELLED);
                b.setRejectionReason("Resource is currently " + newStatus.name());
                bookingRepository.save(b);

                // Notify the user
                String reason = newStatus == Resource.ResourceStatus.MAINTENANCE ? "maintenance" : "being out of service";
                String message = String.format("Your booking for '%s' on %s has been cancelled due to the resource %s.",
                        resource.getName(), b.getBookingDate(), reason);

                notificationService.createNotification(
                        b.getUserId(),
                        "Booking Cancelled",
                        message,
                        Notification.NotificationType.BOOKING_CANCELLED,
                        b.getId()
                );
            }
        }
    }

    @Override
    public void deleteResource(String id) {
        Resource existing = resourceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));

        // Cascade delete all bookings for this resource
        List<Booking> bookings = bookingRepository.findByResourceId(id);
        LocalDate today = LocalDate.now();

        for (Booking b : bookings) {
            // Notify users if they had a future active booking
            if ((b.getStatus() == Booking.BookingStatus.PENDING || b.getStatus() == Booking.BookingStatus.APPROVED)
                && (b.getBookingDate().isEqual(today) || b.getBookingDate().isAfter(today))) {
                
                String message = String.format("Your booking for '%s' on %s has been cancelled because the resource was permanently deleted by an administrator.",
                        existing.getName(), b.getBookingDate());

                notificationService.createNotification(
                        b.getUserId(),
                        "Booking Cancelled (Resource Deleted)",
                        message,
                        Notification.NotificationType.BOOKING_CANCELLED,
                        b.getId()
                );
            }
            // Delete the booking entirely so it removes it from the dashboard
            bookingRepository.delete(b);
        }

        resourceRepository.deleteById(id);
    }
}
