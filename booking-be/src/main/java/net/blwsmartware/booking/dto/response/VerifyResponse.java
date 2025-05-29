package net.blwsmartware.booking.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VerifyResponse {

    boolean isValid;
    Instant expiration;
    String username;

}
