package com.smartcampus.controller;

import com.smartcampus.dto.response.PeakHourDTO;
import com.smartcampus.dto.response.TopResourceDTO;
import com.smartcampus.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/top-resources")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopResourceDTO>> getTopResources() {
        return ResponseEntity.ok(analyticsService.getTopResources());
    }

    @GetMapping("/peak-hours")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PeakHourDTO>> getPeakHours() {
        return ResponseEntity.ok(analyticsService.getPeakBookingHours());
    }
}
