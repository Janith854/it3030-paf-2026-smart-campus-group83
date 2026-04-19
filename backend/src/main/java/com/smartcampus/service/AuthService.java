package com.smartcampus.service;

import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.model.User;
import java.util.List;

/** Member 4 implements this */
public interface AuthService {
    String loginWithGoogle(String googleToken);

    String registerLocal(String email, String password, String name, User.Role role);

    String loginLocal(String email, String password);

    User getCurrentUser(String userId);

    User updateRole(String userId, User.Role role);
    
    void deleteUser(String userId);

    List<User> getAllUsers();
}
