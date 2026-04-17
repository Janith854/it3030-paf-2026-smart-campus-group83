package com.smartcampus.service.impl;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Module B — Booking Management
 * Member 2: feature/bookings
 */
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final MongoTemplate mongoTemplate;

    @Override
    public BookingDTO createBooking(BookingDTO bookingDto, String userId) {
        // 1. Basic validation: Start must be before End
        if (bookingDto.getStartTime() != null && bookingDto.getEndTime() != null) {
            if (!bookingDto.getStartTime().isBefore(bookingDto.getEndTime())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
            }
        }

        Booking booking = bookingDto.toEntity();

        // 2. Conflict detection logic:
        // (newStart < existingEnd) AND (newEnd > existingStart)
        Query conflictQuery = new Query();
        conflictQuery.addCriteria(Criteria.where("resourceId").is(booking.getResourceId()));
        conflictQuery.addCriteria(Criteria.where("bookingDate").is(booking.getBookingDate()));
        conflictQuery.addCriteria(Criteria.where("status").in(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED));
        
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
        Booking saved = bookingRepository.save(booking);
        return BookingDTO.fromEntity(saved);
    }

    @Override
    public BookingDTO getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        return BookingDTO.fromEntity(booking);
    }

    @Override
    public List<BookingDTO> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
            .map(BookingDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO> getAllBookings(String status) {
        List<Booking> list;
        if (status != null) {
            list = bookingRepository.findByStatus(Booking.BookingStatus.valueOf(status));
        } else {
            list = bookingRepository.findAll();
        }
        return list.stream()
            .map(BookingDTO::fromEntity)
            .collect(Collectors.toList());
    }

    @Override
    public BookingDTO approveBooking(String id, String adminId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
            
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
        return BookingDTO.fromEntity(saved);
    }

    @Override
    public BookingDTO rejectBooking(String id, String reason, String adminId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
            
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
        return BookingDTO.fromEntity(saved);
    }

    @Override
    public BookingDTO cancelBooking(String id, String userId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        
        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING && booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending or approved bookings can be cancelled");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return BookingDTO.fromEntity(saved);
    }
}
