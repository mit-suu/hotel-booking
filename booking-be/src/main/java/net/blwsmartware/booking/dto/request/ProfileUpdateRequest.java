package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileUpdateRequest {
    @NotNull(message = "NAME_NOT_NULL")
    String name;

    @NotNull(message = "USERNAME_NOT_NULL")
    String username;

    @Email(message = "EMAIL_INVALID")
    String email;

    String tel, address;

    LocalDate dob;
} 