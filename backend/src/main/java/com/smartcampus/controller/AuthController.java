package com.smartcampus.controller;

import com.smartcampus.dto.request.GoogleLoginRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        String token = authService.loginWithGoogle(request.getGoogleToken());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerLocal(@RequestBody @jakarta.validation.Valid com.smartcampus.dto.request.RegisterRequest request) {
        String token = authService.registerLocal(request.getEmail(), request.getPassword(), request.getName(), request.getRole());
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginLocal(@RequestBody @jakarta.validation.Valid com.smartcampus.dto.request.LoginRequest request) {
        String token = authService.loginLocal(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getCurrentUser(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }

    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateRole(@PathVariable String id,
                                           @RequestParam User.Role role) {
        return ResponseEntity.ok(authService.updateRole(id, role));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }
}
