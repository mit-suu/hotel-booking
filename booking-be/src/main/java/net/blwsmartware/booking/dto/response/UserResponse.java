package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    UUID id;
    String name;
    String username;
    String email;
    boolean isActive;
    boolean emailVerified;
    boolean hostRequested;
    String tel,address;
    LocalDate dob;
    Instant createAt;
    Instant updateAt;
    List<RoleResponse> roles;
}
