package com.smartcampus.service;

import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.User;
import java.util.List;

public interface AuthService {
    String loginWithGoogle(String googleToken);

    // Returns full AuthResponse with token + user (including role)
    AuthResponse registerLocal(String email, String password, String name, User.Role role);

    // Returns full AuthResponse with token + user (including role)
    AuthResponse loginLocal(String email, String password);

    User getCurrentUser(String userId);

    User updateRole(String userId, User.Role role);

    void deleteUser(String userId);

    List<User> getAllUsers();
}
