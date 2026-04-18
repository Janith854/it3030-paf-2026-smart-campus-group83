package com.smartcampus.service.impl;

import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
        user.setRole(User.Role.LECTURER);
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
    public AuthResponse register(String name, String email, String department, String empId,
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

        User user = new User();
        user.setName(name);
        user.setEmail(normalizedEmail);
        user.setDepartment(department);
        user.setEmpId(empId);
        user.setPassword(passwordEncoder.encode(password));

        // ROLE LOGIC:
        // 1. Special case: admin@gmail.com -> ADMIN
        if (normalizedEmail.equalsIgnoreCase("admin@gmail.com")) {
            user.setRole(User.Role.ADMIN);
        } 
        // 2. Otherwise use requested role, default to USER
        else if (role == User.Role.TECHNICIAN) {
            user.setRole(User.Role.TECHNICIAN);
        } else if (role == User.Role.ADMIN) {
            user.setRole(User.Role.ADMIN);
        } else {
            user.setRole(User.Role.LECTURER);
        }

        User saved = userRepository.save(user);
        return buildAuthResponse(saved, true);
    }

    @Override
    public AuthResponse login(String email, String password, User.Role role) {
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

        return buildAuthResponse(user, true);
    }

    private AuthResponse buildAuthResponse(User user, boolean includeToken) {
        String token = includeToken ? jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name()) : null;
        
        return AuthResponse.builder()
            .token(token)
            .user(AuthResponse.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .department(user.getDepartment())
                .build())
            .build();
    }
}
