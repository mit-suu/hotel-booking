package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordUpdateRequest {
    
    @NotBlank(message = "CURRENT_PASSWORD_REQUIRED")
    String currentPassword;
    
    @NotBlank(message = "NEW_PASSWORD_REQUIRED")
    @Size(min = 8, message = "PASSWORD_MUST_8_DIGITS")
    String newPassword;
} 