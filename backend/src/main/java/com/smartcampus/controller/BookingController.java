package com.smartcampus.controller;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingUpdateRequest;
import com.smartcampus.dto.response.BookingSlotDTO;
import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Module B — Booking Management
 * Member 2: feature/bookings
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ── Availability Timeline endpoint (Unique Feature) ────────────────────────
    // GET /api/v1/bookings/availability?resourceId=X&date=2026-05-10
    // Returns all PENDING/APPROVED slots for that resource on that date.
    // Open to all authenticated users (they need this to book wisely).
    @GetMapping("/availability")
    public ResponseEntity<List<BookingSlotDTO>> getAvailability(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getAvailability(resourceId, date));
    }

    // Feature #15: Return BookingDTO, not raw entity
    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingRequest request,
                                                    @AuthenticationPrincipal UserPrincipal user) {
        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(BookingDTO.fromEntity(bookingService.createBooking(booking, user.getId())));
    }

    // Feature #12: Edit purpose / attendees on own PENDING booking
    @PatchMapping("/{id}")
    public ResponseEntity<BookingDTO> updateBooking(@PathVariable String id,
                                                    @RequestBody BookingUpdateRequest request,
                                                    @AuthenticationPrincipal UserPrincipal user) {
        Booking updated = bookingService.updateBooking(
            id, user.getId(), request.getPurpose(), request.getExpectedAttendees()
        );
        return ResponseEntity.ok(BookingDTO.fromEntity(updated));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(
            bookingService.getMyBookings(user.getId()).stream()
                .map(BookingDTO::fromEntity)
                .collect(Collectors.toList())
        );
    }

    // Feature #14: Pagination with page/size query params (defaults: page 0, size 20)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDTO>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
            bookingService.getAllBookings(status, page, size).stream()
                .map(BookingDTO::fromEntity)
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getById(@PathVariable String id,
                                              @AuthenticationPrincipal UserPrincipal user) {
        Booking booking = bookingService.getBookingById(id);
        // Admins can view any booking; users can only view their own
        if (user.getRole() != User.Role.ADMIN && !booking.getUserId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to view this booking");
        }
        return ResponseEntity.ok(BookingDTO.fromEntity(booking));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> approve(@PathVariable String id,
                                              @AuthenticationPrincipal UserPrincipal admin) {
        return ResponseEntity.ok(BookingDTO.fromEntity(bookingService.approveBooking(id, admin.getId())));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> reject(@PathVariable String id,
                                             @RequestParam String reason,
                                             @AuthenticationPrincipal UserPrincipal admin) {
        return ResponseEntity.ok(BookingDTO.fromEntity(bookingService.rejectBooking(id, reason, admin.getId())));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancel(@PathVariable String id,
                                             @AuthenticationPrincipal UserPrincipal user) {
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        return ResponseEntity.ok(BookingDTO.fromEntity(bookingService.cancelBooking(id, user.getId(), isAdmin)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id,
                                       @AuthenticationPrincipal UserPrincipal user) {
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        bookingService.deleteBooking(id, user.getId(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    // ── QR Code Check-In endpoint (Innovation Feature) ─────────────────────────
    @PatchMapping("/{id}/check-in")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> checkIn(@PathVariable String id,
                                              @AuthenticationPrincipal UserPrincipal admin) {
        return ResponseEntity.ok(BookingDTO.fromEntity(bookingService.checkInBooking(id, admin.getId())));
    }
}
