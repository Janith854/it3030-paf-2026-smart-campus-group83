package com.smartcampus.service;

import com.smartcampus.model.Booking;
import java.util.List;

/** Member 2 implements this */
public interface BookingService {
    Booking createBooking(Booking booking, String userId);
    Booking getBookingById(String id);
    List<Booking> getMyBookings(String userId);
    List<Booking> getAllBookings(String status, int page, int size);
    Booking updateBooking(String id, String userId, String purpose, Integer expectedAttendees);
    Booking approveBooking(String id, String adminId);
    Booking rejectBooking(String id, String reason, String adminId);
    Booking cancelBooking(String id, String userId, boolean isAdmin);
    void deleteBooking(String id, String userId, boolean isAdmin);
    java.util.List<com.smartcampus.dto.response.BookingSlotDTO> getAvailability(String resourceId, java.time.LocalDate date);
}
