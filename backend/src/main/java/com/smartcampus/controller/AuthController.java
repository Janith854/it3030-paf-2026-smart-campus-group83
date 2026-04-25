package com.smartcampus.controller;

import com.smartcampus.dto.request.GoogleLoginRequest;
import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Module E — Authentication & RBAC
 * Member 4: feature/auth
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Google OAuth login — returns JWT token */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
        String token = authService.loginWithGoogle(request.getGoogleToken());
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        return ResponseEntity.ok(response);
    }

    /**
     * Local registration.
     * ADMIN role is blocked in AuthServiceImpl — any ADMIN attempt is silently
     * downgraded to USER for security.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerLocal(
            request.getEmail(),
            request.getPassword(),
            request.getName(),
            request.getRole()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Local login.
     * Response includes { token, user: { id, name, email, role } }
     * so the frontend can redirect based on role immediately.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.loginLocal(
            request.getEmail(),
            request.getPassword()
        );
        return ResponseEntity.ok(response);
    }

    /** Returns the currently authenticated user's profile */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getCurrentUser(@RequestAttribute("userId") String userId) {
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }

    /** ADMIN-only: update a user's role */
    @PatchMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateRole(@PathVariable String id,
                                           @RequestParam User.Role role) {
        return ResponseEntity.ok(authService.updateRole(id, role));
    }

    /** ADMIN-only: list all users */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }
}
