package com.smartcampus.service;

import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.User;
import java.util.List;

/** Member 4 implements this */
public interface AuthService {
    String loginWithGoogle(String googleToken);
    User getCurrentUser(String userId);
    User updateRole(String userId, User.Role role);
    List<User> getAllUsers();
    AuthResponse register(String name, String email, String department, String empId, String password, User.Role role);
    AuthResponse login(String email, String password, User.Role role);
}
