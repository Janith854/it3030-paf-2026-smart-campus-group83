package com.smartcampus.controller;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/** Temporary test endpoints */
@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
public class TestController {

    @GetMapping("/public/test")
    public String test() {
        return "Backend is working!";
    }

    private final UserRepository userRepository;

    // Member 4 (Auth/Roles): temporary role promotion for testing technician assignment.
    @PatchMapping("/promote-tech/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> promoteTechnician(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        user.setRole(User.Role.TECHNICIAN);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "id", saved.getId(),
            "email", saved.getEmail(),
            "role", saved.getRole().name()
        ));
    }
}
