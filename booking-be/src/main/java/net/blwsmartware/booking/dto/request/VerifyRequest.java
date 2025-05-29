package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VerifyRequest {

    @NotNull(message = "JWT_NOT_NULL")
    String token;

}
