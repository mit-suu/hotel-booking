package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRequest {
    @Size(min = 8,message = "PASSWORD_MUST_8_DIGITS")
    @NotNull(message = "PASSWORD_NOT_NULL")
    String password;

    @NotNull(message = "NAME_NOT_NULL")
    String name;

    @NotNull(message = "USERNAME_NOT_NULL")
    String username;

    @Email(message = "EMAIL_INVALID")
    String email;
}
