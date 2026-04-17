package com.smartcampus.service.impl;

import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.time.LocalDateTime;
import java.util.List;

/**
 * TODO Member 2: Implement all methods
 * Branch: feature/bookings
 */
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    @Override
    public Booking createBooking(Booking booking, String userId) {
        // 1. Basic validation: Start must be before End
        if (booking.getStartTime() != null && booking.getEndTime() != null) {
            if (!booking.getStartTime().isBefore(booking.getEndTime())) {
                throw new com.smartcampus.exception.InvalidTicketStatusException("Start time must be before end time");
            }
        }

        // 2. Conflict detection logic:
        // (newStart < existingEnd) AND (newEnd > existingStart)
        // for same resource, same date, and active statuses.
        Query conflictQuery = new Query();
        conflictQuery.addCriteria(Criteria.where("resourceId").is(booking.getResourceId()));
        conflictQuery.addCriteria(Criteria.where("bookingDate").is(booking.getBookingDate()));
        conflictQuery.addCriteria(Criteria.where("status").in(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED));
        
        // Time overlap logic:
        conflictQuery.addCriteria(new Criteria().andOperator(
            Criteria.where("startTime").lt(booking.getEndTime()),
            Criteria.where("endTime").gt(booking.getStartTime())
        ));

        List<Booking> conflicts = mongoTemplate.find(conflictQuery, Booking.class);
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Time slot conflict: The resource is already booked for this period.");
        }

        booking.setUserId(userId);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setStatus(Booking.BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    @Override
    public List<Booking> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Override
    public List<Booking> getAllBookings(String status) {
        if (status != null) {
            return bookingRepository.findByStatus(Booking.BookingStatus.valueOf(status));
        }
        return bookingRepository.findAll();
    }

    @Override
    public Booking approveBooking(String id, String adminId) {
        Booking booking = getBookingById(id);
        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedByAdminId(adminId);
        Booking saved = bookingRepository.save(booking);
        
        notificationService.createNotification(
            saved.getUserId(),
            "Booking Approved",
            "Your booking request for resource " + saved.getResourceId() + " was approved.",
            Notification.NotificationType.BOOKING_APPROVED,
            saved.getId()
        );
        return saved;
    }

    @Override
    public Booking rejectBooking(String id, String reason, String adminId) {
        Booking booking = getBookingById(id);
        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);
        
        String message = (reason == null || reason.isBlank())
            ? "Your booking request was rejected."
            : "Your booking request was rejected: " + reason;
            
        notificationService.createNotification(
            saved.getUserId(),
            "Booking Rejected",
            message,
            Notification.NotificationType.BOOKING_REJECTED,
            saved.getId()
        );
        return saved;
    }

    @Override
    public Booking cancelBooking(String id, String userId) {
        Booking booking = getBookingById(id);
        
        // Security check: only the owner can cancel
        if (!booking.getUserId().equals(userId)) {
            throw new com.smartcampus.exception.InvalidTicketStatusException("You can only cancel your own bookings");
        }
        
        // Status check: only PENDING or APPROVED can be cancelled
        if (booking.getStatus() != Booking.BookingStatus.PENDING && booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new com.smartcampus.exception.InvalidTicketStatusException("Only pending or approved bookings can be cancelled");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
