package com.smartcampus.service;

import com.smartcampus.model.User;
import java.util.Map;

/** Member 4 implements this */
public interface AuthService {
    String loginWithGoogle(String googleToken);
    User getCurrentUser(String userId);
    User updateRole(String userId, User.Role role);
    Map<String, Object> register(String name, String email, String department, String empId,
                                  String password, User.Role role);
    Map<String, Object> login(String email, String password, User.Role role);
}
