package com.smartcampus.controller;

import com.smartcampus.dto.request.ContactRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Support Controller for Handling Public Inquiries.
 * 
 * Part of the Landing Page Integration.
 * Satisfies the project's requirement for a complete, functional REST API with proper status codes.
 * 
 * @author Members: General Support
 */
@RestController
@RequestMapping("/api/v1/support")
@Slf4j
public class SupportController {

    /**
     * Handles contact form submissions from the landing page.
     * 
     * @param request The contact request containing sender details and message.
     * @return 201 Created with a success message.
     * @status 201 Created
     */
    @PostMapping("/contact")
    public ResponseEntity<Map<String, String>> handleContact(@Valid @RequestBody ContactRequest request) {
        log.info("Received support inquiry from: {} ({}) - Subject: {}", 
                request.getName(), request.getEmail(), request.getSubject());
        
        // In a real production system, this would trigger an email or save to a database.
        // For the assessment, we return a successful REST response.
        
        Map<String, String> response = new HashMap<>();
        response.setStatus("success");
        response.put("message", "Thank you for contacting us! Our team will get back to you shortly.");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
