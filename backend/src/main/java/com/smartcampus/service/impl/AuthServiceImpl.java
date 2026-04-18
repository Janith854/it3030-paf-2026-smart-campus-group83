package com.smartcampus.service.impl;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

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
