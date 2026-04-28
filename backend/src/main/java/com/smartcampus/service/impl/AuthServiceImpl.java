package com.smartcampus.service.impl;

import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

/**
 * — Authentication & RBAC
 * 
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // ── Google OAuth ────────────────────────────────────────────────────────── //

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
    // Local Registration

    @Override
    public AuthResponse registerLocal(String email, String password, String name, User.Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        // SECURITY: Prevent self-registration as ADMIN — silently downgrade to USER
        User.Role safeRole = (role == null || role == User.Role.ADMIN) ? User.Role.USER : role;

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password)); // BCrypt hash
        user.setName(name);
        user.setRole(safeRole);

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserResponse.builder()
                        .id(saved.getId())
                        .name(saved.getName())
                        .email(saved.getEmail())
                        .role(saved.getRole().name())
                        .build())
                .build();
    }

    // ── Local Login ─────────────────────────────────────────────────────────── //

    @Override
    public AuthResponse loginLocal(String email, String password) {
        // Dev Bypass for testing if MongoDB is down
        if ("admin@smartcampus.com".equals(email) && "admin123".equals(password)) {
            String token = jwtUtil.generateToken("mock-admin-id", email, User.Role.ADMIN.name());
            return AuthResponse.builder()
                    .token(token)
                    .user(AuthResponse.UserResponse.builder()
                            .id("mock-admin-id")
                            .name("Demo Administrator")
                            .email(email)
                            .role(User.Role.ADMIN.name())
                            .build())
                    .build();
        }

        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

            return AuthResponse.builder()
                    .token(token)
                    .user(AuthResponse.UserResponse.builder()
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole().name())
                            .build())
                    .build();
        } catch (Exception e) {
            if (e.getMessage().contains("Invalid email or password"))
                throw e;
            throw new RuntimeException(
                    "Database connection error. Please try the demo account: admin@smartcampus.com / admin123");
        }
    }

    // ── User Management ─────────────────────────────────────────────────────── //

    @Override
    public User getCurrentUser(String userId) {
        if ("mock-admin-id".equals(userId)) {
            User mock = new User();
            mock.setId("mock-admin-id");
            mock.setEmail("admin@smartcampus.com");
            mock.setName("Demo Administrator");
            mock.setRole(User.Role.ADMIN);
            return mock;
        }

        try {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        } catch (Exception e) {
            throw new RuntimeException("Database error retrieving user profile.");
        }
    }

    @Override
    public User updateRole(String userId, User.Role role) {
        User user = getCurrentUser(userId);
        user.setRole(role);
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }
        userRepository.deleteById(userId);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ── Google Token Verification ───────────────────────────────────────────── //

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
