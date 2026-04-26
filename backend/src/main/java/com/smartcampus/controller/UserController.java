package com.smartcampus.controller;

import com.smartcampus.dto.response.TechnicianSummary;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.smartcampus.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    // Member 4 (Auth/Roles): technician directory for assignment workflows.
    public ResponseEntity<List<TechnicianSummary>> getTechnicians() {
        List<TechnicianSummary> technicians = userRepository.findByRole(User.Role.TECHNICIAN)
            .stream()
            .map(user -> new TechnicianSummary(user.getId(), user.getName(), user.getEmail()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(technicians);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable User.Role role) {
        return ResponseEntity.ok(userRepository.findByRole(role));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    // Member 4 (Auth/Roles): admin-only role promotion endpoint.
    public ResponseEntity<User> updateUserRole(@PathVariable String id, @RequestParam User.Role role) {
        return ResponseEntity.ok(authService.updateRole(id, role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        authService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/preferences")
    public ResponseEntity<User.NotificationPreferences> getMyPreferences(@AuthenticationPrincipal UserPrincipal principal) {
        User user = authService.getCurrentUser(principal.getId());
        return ResponseEntity.ok(user.getNotificationPreferences());
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<User.NotificationPreferences> updateMyPreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody User.NotificationPreferences preferences) {
        User user = authService.getCurrentUser(principal.getId());
        user.setNotificationPreferences(preferences);
        userRepository.save(user);
        return ResponseEntity.ok(user.getNotificationPreferences());
    }
}
