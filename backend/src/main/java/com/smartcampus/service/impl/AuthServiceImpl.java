package com.smartcampus.service.impl;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashMap;
import java.util.Map;

/**
 * TODO Member 4: Complete Google token verification
 * Branch: feature/auth
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public String loginWithGoogle(String googleToken) {
        // TODO: verify googleToken with Google API
        // TODO: extract email, name, picture, googleId from Google payload
        // TODO: find or create user in DB
        // Placeholder:
        User user = new User();
        user.setEmail("placeholder@example.com");
        user.setRole(User.Role.USER);
        User saved = userRepository.save(user);
        return jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name());
    }

    @Override
    public User getCurrentUser(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateRole(String userId, User.Role role) {
        User user = getCurrentUser(userId);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public Map<String, Object> register(String name, String email, String department, String empId,
                                        String password, User.Role role) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User.Role requestedRole = role == null ? User.Role.LECTURER : role;
        if (requestedRole == User.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin registration is not allowed");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(normalizedEmail);
        user.setDepartment(department);
        user.setEmpId(empId);
        user.setPassword(passwordEncoder.encode(password));

        // Block ADMIN registration
        if (requestedRole == User.Role.ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "Admin registration not allowed");
        }

        // Technicians start as USER (pending approval), lecturers get LECTURER role
        boolean pendingTech = requestedRole == User.Role.TECHNICIAN;
        user.setRole(pendingTech ? User.Role.USER : requestedRole);

        User saved = userRepository.save(user);
        String status = pendingTech ? "PENDING" : "ACTIVE";
        return buildAuthResponse(saved, status, !pendingTech);
    }

    @Override
    public Map<String, Object> login(String email, String password, User.Role role) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (user.getRole() != null && user.getRole() == User.Role.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "TECHNICIAN_PENDING");
        }

        return buildAuthResponse(user, "ACTIVE", true);
    }

    private Map<String, Object> buildAuthResponse(User user, String status, boolean includeToken) {
        Map<String, Object> body = new HashMap<>();
        User.Role role = user.getRole() != null ? user.getRole() : User.Role.LECTURER;
        if (includeToken) {
            body.put("token", jwtUtil.generateToken(user.getId(), user.getEmail(), role.name()));
        }
        body.put("status", status);
        Map<String, Object> userPayload = new HashMap<>();
        userPayload.put("id", user.getId());
        userPayload.put("name", user.getName());
        userPayload.put("email", user.getEmail());
        userPayload.put("role", user.getRole().name());
        body.put("user", userPayload);
        return body;
    }
}
