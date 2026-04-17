package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDate;
import java.util.List;

/** Member 2 — conflict checking query is key here */
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, Booking.BookingStatus status);

    // Conflict detection: overlapping bookings for same resource on same date
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, 'status': { $in: ['PENDING','APPROVED'] }, " +
           "$or: [ { 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } } ] }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate date,
                                          String startTime, String endTime);
}
