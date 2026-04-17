package com.smartcampus.controller;

import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Module E — Authentication
 * Member 4: feature/auth
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<Map<String, String>> googleLogin(@RequestBody Map<String, String> body) {
        String token = authService.loginWithGoogle(body.get("googleToken"));
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(authService.register(
                request.getName(),
                request.getEmail(),
                request.getDepartment(),
                request.getEmpId(),
                request.getPassword(),
                request.getRole()
            ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(
            request.getEmail(),
            request.getPassword(),
            request.getRole()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }
}
