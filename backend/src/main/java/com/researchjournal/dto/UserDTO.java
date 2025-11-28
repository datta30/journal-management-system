package com.researchjournal.dto;

import com.researchjournal.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String institution;
    private String department;
    private String bio;
    private Role role;
    private Boolean enabled;
    private LocalDateTime createdAt;
}
