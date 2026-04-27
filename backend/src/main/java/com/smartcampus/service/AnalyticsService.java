package com.smartcampus.service;

import com.smartcampus.dto.response.PeakHourDTO;
import com.smartcampus.dto.response.TopResourceDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;

    public List<TopResourceDTO> getTopResources() {
        List<Booking> approvedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.APPROVED)
                .collect(Collectors.toList());

        Map<String, Long> counts = approvedBookings.stream()
                .collect(Collectors.groupingBy(Booking::getResourceId, Collectors.counting()));

        return counts.entrySet().stream()
                .map(e -> new TopResourceDTO(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getTotalBookings(), a.getTotalBookings()))
                .limit(5)
                .collect(Collectors.toList());
    }

    public List<PeakHourDTO> getPeakBookingHours() {
        List<Booking> approvedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.APPROVED)
                .collect(Collectors.toList());

        Map<Integer, Long> hourCounts = approvedBookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(b -> b.getStartTime().getHour(), Collectors.counting()));

        return hourCounts.entrySet().stream()
                .map(e -> new PeakHourDTO(e.getKey(), e.getValue()))
                .sorted((a, b) -> Integer.compare(a.getHour(), b.getHour()))
                .collect(Collectors.toList());
    }
}
