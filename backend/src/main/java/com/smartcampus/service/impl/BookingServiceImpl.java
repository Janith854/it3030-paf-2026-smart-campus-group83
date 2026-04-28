package com.smartcampus.service.impl;

import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.dto.response.BookingSlotDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.NotificationService;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    @Override
    public Booking createBooking(Booking booking, String userId) {
        // Guard: end time must be after start time
        if (!booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Feature #13: Capacity vs. attendees validation
        if (booking.getExpectedAttendees() != null) {
            Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + booking.getResourceId()));
            if (resource.getCapacity() != null && booking.getExpectedAttendees() > resource.getCapacity()) {
                throw new RuntimeException(
                    "Expected attendees (" + booking.getExpectedAttendees() +
                    ") exceeds resource capacity (" + resource.getCapacity() + ")"
                );
            }
        }

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

    // Feature #14: Pagination support
    @Override
    public List<Booking> getAllBookings(String status, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (status != null) {
            try {
                return bookingRepository.findByStatus(
                    Booking.BookingStatus.valueOf(status.toUpperCase()), pageable
                ).getContent();
            } catch (IllegalArgumentException e) {
                throw new RuntimeException(
                    "Invalid status '" + status + "'. Valid values: PENDING, APPROVED, REJECTED, CANCELLED"
                );
            }
        }
        return bookingRepository.findAll(pageable).getContent();
    }

    // Feature #12: Update purpose and/or expectedAttendees on a PENDING booking
    @Override
    public Booking updateBooking(String id, String userId, String purpose, Integer expectedAttendees) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (!booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only edit your own bookings");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Only PENDING bookings can be edited");
        }

        if (purpose != null && !purpose.isBlank()) {
            booking.setPurpose(purpose.trim());
        }

        // Feature #13: Re-validate capacity when attendees change
        if (expectedAttendees != null) {
            Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + booking.getResourceId()));
            if (resource.getCapacity() != null && expectedAttendees > resource.getCapacity()) {
                throw new RuntimeException(
                    "Expected attendees (" + expectedAttendees +
                    ") exceeds resource capacity (" + resource.getCapacity() + ")"
                );
            }
            booking.setExpectedAttendees(expectedAttendees);
        }

        return bookingRepository.save(booking);
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
        // Generate a secure check-in token for QR code URLs
        booking.setCheckInToken(java.util.UUID.randomUUID().toString());
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
    public Booking cancelBooking(String id, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        // Regular users can only cancel their own bookings
        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING
            && booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new RuntimeException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // Notify the booking owner if an admin cancels on their behalf
        if (isAdmin && !booking.getUserId().equals(userId)) {
            notificationService.createNotification(
                saved.getUserId(),
                "Booking Cancelled by Admin",
                "Your booking for " + saved.getBookingDate() + " has been cancelled by an administrator.",
                Notification.NotificationType.BOOKING_REJECTED,
                saved.getId()
            );
        }

        return saved;
    }

    @Override
    public void deleteBooking(String id, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own bookings");
        }

        bookingRepository.delete(booking);
    }
    // ── QR Code Check-In feature ─────────────────────────────────────────────── //
    @Override
    public Booking checkInBooking(String id, String adminId) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        return performCheckIn(booking, adminId);
    }

    @Override
    public Booking checkInByToken(String token, String adminId) {
        Booking booking = bookingRepository.findByCheckInToken(token)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid check-in token"));
        return performCheckIn(booking, adminId);
    }

    @Override
    public Booking getBookingByToken(String token) {
        return bookingRepository.findByCheckInToken(token)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid check-in token"));
    }

    private Booking performCheckIn(Booking booking, String adminId) {
        if (booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED bookings can be checked in");
        }

        if (booking.isCheckedIn()) {
            throw new RuntimeException("This booking has already been checked in");
        }

        // Fix #6: Only allow check-in on the actual booking date AND within the time window
        LocalDate today = LocalDate.now();
        java.time.LocalTime now = java.time.LocalTime.now();

        if (!booking.getBookingDate().equals(today)) {
            throw new RuntimeException(
                "Check-in is only allowed on the booking date (" + booking.getBookingDate() + "). Today is " + today + "."
            );
        }

        // Time window: 15 mins before start time, up to the end time
        java.time.LocalTime allowedStart = booking.getStartTime().minusMinutes(15);
        if (now.isBefore(allowedStart)) {
            throw new RuntimeException("Check-in is not allowed yet. You can check in starting 15 minutes before the booking time (" + booking.getStartTime() + ").");
        }
        if (now.isAfter(booking.getEndTime())) {
            throw new RuntimeException("This booking has already ended (" + booking.getEndTime() + "). Check-in is no longer allowed.");
        }

        booking.setCheckedIn(true);
        booking.setCheckedInAt(java.time.LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.createNotification(
            saved.getUserId(),
            "Booking Checked In",
            "Your booking for " + saved.getBookingDate() + " (" + saved.getStartTime() + " – " + saved.getEndTime() + ") has been verified.",
            Notification.NotificationType.BOOKING_APPROVED,
            saved.getId()
        );

        return saved;
    }

    // ── Availability timeline feature ───────────────────────────────────────── //
    @Override
    public List<BookingSlotDTO> getAvailability(String resourceId, LocalDate date) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm");
        return bookingRepository
            .findByResourceIdAndDateAndActiveStatuses(resourceId, date)
            .stream()
            .map(b -> new BookingSlotDTO(
                b.getStartTime().format(fmt),
                b.getEndTime().format(fmt),
                b.getStatus().name()
            ))
            .collect(Collectors.toList());
    }
}
