package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherValidationRequest {
    
    @NotBlank(message = "Voucher code is required")
    String code;
    
    @NotNull(message = "Hotel ID is required")
    UUID hotelId;
    
    @NotNull(message = "Booking amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Booking amount must be greater than 0")
    BigDecimal bookingAmount;
}