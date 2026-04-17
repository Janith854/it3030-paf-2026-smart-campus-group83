package com.smartcampus.model;

import lombok.Data;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

/**
 * Module B — Booking Management
 * Owner: Member 2 (feature/bookings)
 */
@Data
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;
    
    @NotBlank(message = "User ID is required")
    private String userId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date must be in the present or future")
    private LocalDate bookingDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;
    
    @Min(value = 1, message = "Expected attendees must be at least 1")
    private Integer expectedAttendees;

    private BookingStatus status = BookingStatus.PENDING;
    private String rejectionReason;
    private String approvedByAdminId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
