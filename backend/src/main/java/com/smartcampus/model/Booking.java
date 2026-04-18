package com.smartcampus.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
@Data
@Document(collection = "bookings")
public class Booking {
    @Id private String id;
    @NotBlank(message = "Resource ID is required") private String resourceId;
    private String userId;
    @NotNull(message = "Date is required") private LocalDate bookingDate;
    @NotNull(message = "Start time is required") private LocalTime startTime;
    @NotNull(message = "End time is required") private LocalTime endTime;
    @NotBlank(message = "Purpose is required") private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status = BookingStatus.PENDING;
    private String rejectionReason;
    private String approvedByAdminId;
    @CreatedDate private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;

    public enum BookingStatus { PENDING, APPROVED, REJECTED, CANCELLED }
}
