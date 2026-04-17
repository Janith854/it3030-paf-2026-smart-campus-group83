package com.smartcampus.model;

import lombok.Data;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;
    private String picture;
    private String googleId;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;
    private String department;
    private String empId;
    private Role role = Role.USER;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Role {
        USER, ADMIN, TECHNICIAN
    }
}
