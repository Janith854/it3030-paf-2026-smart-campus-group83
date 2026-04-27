package com.smartcampus.service;

import com.smartcampus.dto.response.PeakHourDTO;
import com.smartcampus.dto.response.TopResourceDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public List<TopResourceDTO> getTopResources(LocalDate from) {
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> from == null || (b.getBookingDate() != null && !b.getBookingDate().isBefore(from)))
                .collect(Collectors.toList());

        Map<String, Long> counts = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getResourceId, Collectors.counting()));

        return counts.entrySet().stream()
                .map(e -> {
                    String resourceId = e.getKey();
                    Resource resource = resourceRepository.findById(resourceId).orElse(null);
                    String resourceName = (resource != null) ? resource.getName() : "Unknown Resource";
                    String type = (resource != null) ? resource.getType().toString() : "Unknown";
                    String location = (resource != null) ? resource.getLocation() : "Unknown";
                    return new TopResourceDTO(resourceId, resourceName, type, location, e.getValue());
                })
                .sorted((a, b) -> Long.compare(b.getTotalBookings(), a.getTotalBookings()))
                .limit(5)
                .collect(Collectors.toList());
    }

    public List<PeakHourDTO> getPeakBookingHours(LocalDate from) {
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(b -> from == null || (b.getBookingDate() != null && !b.getBookingDate().isBefore(from)))
                .collect(Collectors.toList());

        Map<Integer, Long> hourCounts = bookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(b -> b.getStartTime().getHour(), Collectors.counting()));

        return hourCounts.entrySet().stream()
                .map(e -> new PeakHourDTO(e.getKey(), e.getValue()))
                .sorted((a, b) -> Integer.compare(a.getHour(), b.getHour()))
                .collect(Collectors.toList());
    }
}
