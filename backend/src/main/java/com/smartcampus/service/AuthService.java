package com.smartcampus.service;

import com.smartcampus.model.User;
import java.util.List;

/** Member 4 implements this */
public interface AuthService {
    String loginWithGoogle(String googleToken);
    User getCurrentUser(String userId);
    User updateRole(String userId, User.Role role);
    List<User> getAllUsers();
}
