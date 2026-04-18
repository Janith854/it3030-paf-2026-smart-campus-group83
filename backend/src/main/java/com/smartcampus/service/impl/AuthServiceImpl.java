package com.smartcampus.service.impl;

import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

/**
 * Module E — Authentication
 * Member 4: feature/auth
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public String loginWithGoogle(String googleToken) {
        if (googleToken == null || googleToken.isBlank()) {
            throw new RuntimeException("Invalid Google token");
        }

        Map<String, Object> payload = fetchGoogleTokenInfo(googleToken);
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");
        String googleId = (String) payload.get("sub");

        if (email == null || googleId == null) {
            throw new RuntimeException("Invalid Google token");
        }

        User user = userRepository.findByEmail(email)
                .map(existing -> {
                    existing.setName(name);
                    existing.setPicture(picture);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    User created = new User();
                    created.setEmail(email);
                    created.setName(name);
                    created.setPicture(picture);
                    created.setGoogleId(googleId);
                    created.setRole(User.Role.USER);
                    return userRepository.save(created);
                });

        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }

    @Override
    public User getCurrentUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    @Override
    public User updateRole(String userId, User.Role role) {
        User user = getCurrentUser(userId);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
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
        // 2. Otherwise use requested role (USER or TECHNICIAN), default to USER
        else if (role == User.Role.TECHNICIAN) {
            user.setRole(User.Role.TECHNICIAN);
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
        String token = includeToken ? jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name())
                : null;

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

    private Map<String, Object> fetchGoogleTokenInfo(String googleToken) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token={token}";
        RestTemplate restTemplate = new RestTemplate();
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class, googleToken);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Invalid Google token");
            }
            return response.getBody();
        } catch (RestClientException ex) {
            throw new RuntimeException("Invalid Google token");
        }
    }
}
