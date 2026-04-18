package com.smartcampus.service.impl;

import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.NotificationService;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Module B — Booking Management
 * Member 2: feature/bookings
 */
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    public Booking createBooking(Booking booking, String userId) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            booking.getResourceId(),
            booking.getBookingDate(),
            booking.getStartTime(),
            booking.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new BookingConflictException(
                "Resource already booked from " + conflict.getStartTime() + " to " + conflict.getEndTime()
            );
        }

        booking.setUserId(userId);
        booking.setStatus(Booking.BookingStatus.PENDING);
        Booking saved = bookingRepository.save(booking);

        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                admin.getId(),
                "New Booking Request",
                "A new booking request for " + saved.getPurpose() + " is pending your approval.",
                Notification.NotificationType.BOOKING_CREATED,
                saved.getId()
            );
        }
        
        return saved;
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
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be approved");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedByAdminId(adminId);
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
            saved.getUserId(),
            "Booking Approved",
            "Your booking for " + saved.getBookingDate() + " has been approved.",
            Notification.NotificationType.BOOKING_APPROVED,
            saved.getId()
        );
        return saved;
    }

    @Override
    public Booking rejectBooking(String id, String reason, String adminId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
            saved.getUserId(),
            "Booking Rejected",
            "Your booking was rejected. Reason: " + reason,
            Notification.NotificationType.BOOKING_REJECTED,
            saved.getId()
        );
        return saved;
    }

    @Override
    public Booking cancelBooking(String id, String userId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (!booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING
            && booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new RuntimeException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    @Override
    public void deleteBooking(String id, String userId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (!booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own bookings");
        }

        bookingRepository.delete(booking);
    }
}
