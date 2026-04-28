package com.smartcampus.scheduler;

import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingScheduler {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    /**
     * Runs every 5 minutes to find APPROVED bookings that have passed their end time
     * but were never checked into (No-Shows).
     */
    @Scheduled(fixedRate = 300000)
    public void processGhostBookings() {
        log.info("Running ghost bookings clean-up task...");
        
        List<Booking> activeUncheckedBookings = bookingRepository.findByStatusAndIsCheckedInFalse(Booking.BookingStatus.APPROVED);
        LocalDateTime now = LocalDateTime.now();
        int processedCount = 0;

        for (Booking booking : activeUncheckedBookings) {
            LocalDateTime bookingEndDateTime = LocalDateTime.of(booking.getBookingDate(), booking.getEndTime());
            
            if (bookingEndDateTime.isBefore(now)) {
                // The booking time has fully passed, and they never checked in.
                booking.setStatus(Booking.BookingStatus.NO_SHOW);
                booking.setRejectionReason("System Auto-Cancelled: User did not check in via QR code during the allocated time.");
                bookingRepository.save(booking);

                // Notify the user
                notificationService.createNotification(
                    booking.getUserId(),
                    "Booking Marked as No-Show",
                    "Your booking on " + booking.getBookingDate() + " has expired because you did not check in.",
                    Notification.NotificationType.BOOKING_REJECTED,
                    booking.getId()
                );
                
                processedCount++;
            }
        }
        
        if (processedCount > 0) {
            log.info("Successfully marked {} ghost bookings as NO_SHOW", processedCount);
        }
    }
}
