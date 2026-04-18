package com.smartcampus.service;

import com.smartcampus.model.Booking;
import java.util.List;

/** Member 2 implements this */
public interface BookingService {
    Booking createBooking(Booking booking, String userId);
    Booking getBookingById(String id);
    List<Booking> getMyBookings(String userId);
    List<Booking> getAllBookings(String status);
    Booking approveBooking(String id, String adminId);
    Booking rejectBooking(String id, String reason, String adminId);
    Booking cancelBooking(String id, String userId);
    void deleteBooking(String id, String userId);
}
