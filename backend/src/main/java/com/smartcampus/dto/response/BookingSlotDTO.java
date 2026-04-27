package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight DTO returned by the GET /availability endpoint.
 * Times are formatted as "HH:mm" strings for easy frontend parsing.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingSlotDTO {
    private String startTime;   // e.g. "09:00"
    private String endTime;     // e.g. "10:30"
    private String status;      // "PENDING" or "APPROVED"
}
