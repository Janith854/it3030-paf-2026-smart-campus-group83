package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.security.UserPrincipal;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Module B — Booking Management
 * Member 2: feature/bookings
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request,
                                                   @AuthenticationPrincipal UserPrincipal user) {
        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(bookingService.createBooking(booking, user.getId()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(bookingService.getMyBookings(user.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> approve(@PathVariable String id,
                                             @AuthenticationPrincipal UserPrincipal admin) {
        return ResponseEntity.ok(bookingService.approveBooking(id, admin.getId()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> reject(@PathVariable String id,
                                            @RequestParam String reason,
                                            @AuthenticationPrincipal UserPrincipal admin) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason, admin.getId()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancel(@PathVariable String id,
                                            @AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id,
                                       @AuthenticationPrincipal UserPrincipal user) {
        bookingService.deleteBooking(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
