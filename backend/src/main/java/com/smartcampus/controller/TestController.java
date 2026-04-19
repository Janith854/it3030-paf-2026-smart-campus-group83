package com.smartcampus.controller;

import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
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

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/public/test")
    public String test() {
        return "Backend is working!";
    }

    /**
     * Dev-only: creates or finds a test ADMIN user and returns a JWT.
     * This lets you test the dashboard without Google OAuth configured.
     */
    @PostMapping("/public/dev-login")
    public ResponseEntity<AuthResponse> devLogin(@RequestParam(required = false, defaultValue = "ADMIN") String role) {
        String devEmail = role.toLowerCase() + "@smartcampus.dev";
        User.Role userRole = User.Role.valueOf(role.toUpperCase());
        User user = userRepository.findByEmail(devEmail)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(devEmail);
                newUser.setName("Dev " + role);
                newUser.setGoogleId("dev-local-" + role.toLowerCase());
                newUser.setRole(userRole);
                return userRepository.save(newUser);
            });
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .build();
        return ResponseEntity.ok(response);
    }

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
