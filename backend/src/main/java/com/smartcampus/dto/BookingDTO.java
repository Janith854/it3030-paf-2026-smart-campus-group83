package com.smartcampus.dto;

import com.smartcampus.model.Booking;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class BookingDTO {
    private String id;

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    private String userId;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    private Integer expectedAttendees;
    private Booking.BookingStatus status;
    private LocalDateTime createdAt;
    private String rejectionReason;
    private String approvedByAdminId;
    private String checkInToken;
    private boolean isCheckedIn;
    private LocalDateTime checkedInAt;

    public static BookingDTO fromEntity(Booking entity) {
        BookingDTO dto = new BookingDTO();
        dto.setId(entity.getId());
        dto.setResourceId(entity.getResourceId());
        dto.setUserId(entity.getUserId());
        dto.setBookingDate(entity.getBookingDate());
        dto.setStartTime(entity.getStartTime());
        dto.setEndTime(entity.getEndTime());
        dto.setPurpose(entity.getPurpose());
        dto.setExpectedAttendees(entity.getExpectedAttendees());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setRejectionReason(entity.getRejectionReason());
        dto.setApprovedByAdminId(entity.getApprovedByAdminId());
        dto.setCheckInToken(entity.getCheckInToken());
        dto.setCheckedIn(entity.isCheckedIn());
        dto.setCheckedInAt(entity.getCheckedInAt());
        return dto;
    }

    public Booking toEntity() {
        Booking entity = new Booking();
        entity.setId(this.id);
        entity.setResourceId(this.resourceId);
        entity.setUserId(this.userId);
        entity.setBookingDate(this.bookingDate);
        entity.setStartTime(this.startTime);
        entity.setEndTime(this.endTime);
        entity.setPurpose(this.purpose);
        entity.setExpectedAttendees(this.expectedAttendees);
        entity.setStatus(this.status);
        entity.setCreatedAt(this.createdAt);
        entity.setRejectionReason(this.rejectionReason);
        entity.setApprovedByAdminId(this.approvedByAdminId);
        entity.setCheckInToken(this.checkInToken);
        entity.setCheckedIn(this.isCheckedIn);
        entity.setCheckedInAt(this.checkedInAt);
        return entity;
    }
}
