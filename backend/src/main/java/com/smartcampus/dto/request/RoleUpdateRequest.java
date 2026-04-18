package com.smartcampus.dto.request;

import com.smartcampus.model.User;
import lombok.Data;

@Data
public class RoleUpdateRequest {
    private User.Role role;
}
