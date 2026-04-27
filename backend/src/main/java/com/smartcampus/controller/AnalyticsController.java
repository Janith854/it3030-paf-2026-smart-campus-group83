package com.smartcampus.controller;

import com.smartcampus.dto.response.PeakHourDTO;
import com.smartcampus.dto.response.TopResourceDTO;
import com.smartcampus.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/top-resources")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopResourceDTO>> getTopResources(
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(analyticsService.getTopResources(resolveFromDate(period)));
    }

    @GetMapping("/peak-hours")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PeakHourDTO>> getPeakHours(
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(analyticsService.getPeakBookingHours(resolveFromDate(period)));
    }

    private LocalDate resolveFromDate(String period) {
        if (period == null) return null;
        return switch (period) {
            case "today" -> LocalDate.now();
            case "week"  -> LocalDate.now().minusDays(7);
            case "month" -> LocalDate.now().minusDays(30);
            default      -> null;
        };
    }
}
