package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;
import java.util.List;

/** Member 2 implements this */
public interface BookingService {
    BookingDTO createBooking(BookingDTO bookingDto, String userId);
    BookingDTO getBookingById(String id);
    List<BookingDTO> getMyBookings(String userId);
    List<BookingDTO> getAllBookings(String status);
    BookingDTO approveBooking(String id, String adminId);
    BookingDTO rejectBooking(String id, String reason, String adminId);
    BookingDTO cancelBooking(String id, String userId);
    void deleteBooking(String id, String userId, boolean isAdmin);
}
