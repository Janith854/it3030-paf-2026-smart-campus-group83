package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** Member 2 — conflict checking query is key here */
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, Booking.BookingStatus status);

    // Paginated variants for admin getAllBookings
    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);
    Page<Booking> findAll(Pageable pageable);

    // Availability: all active bookings for a resource on a given date
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, 'status': { $in: ['PENDING', 'APPROVED'] } }")
    List<Booking> findByResourceIdAndDateAndActiveStatuses(String resourceId, LocalDate date);

    // Conflict detection: overlapping bookings for same resource on same date
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, " +
           "'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate date,
                                          LocalTime startTime, LocalTime endTime);
}
