package com.smartcampus.service;

import com.smartcampus.dto.response.BookingSlotDTO;
import com.smartcampus.model.Booking;
import java.time.LocalDate;
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
    List<BookingSlotDTO> getAvailability(String resourceId, LocalDate date);
}
