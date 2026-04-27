package com.smartcampus.dto.request;

import lombok.Data;

/**
 * Request body for PATCH /api/v1/bookings/{id}
 * Only allows editing purpose and expectedAttendees on PENDING bookings.
 */
@Data
public class BookingUpdateRequest {
    private String purpose;
    private Integer expectedAttendees;
}
