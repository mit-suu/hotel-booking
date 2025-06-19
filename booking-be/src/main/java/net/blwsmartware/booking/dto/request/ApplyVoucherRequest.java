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
public class ApplyVoucherRequest {
    
    @NotBlank(message = "Voucher code is required")
    String voucherCode;
    
    @NotNull(message = "Booking ID is required")
    UUID bookingId;
    
    @NotNull(message = "Hotel ID is required")
    UUID hotelId;
    
    @NotNull(message = "Original amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Original amount must be greater than 0")
    BigDecimal originalAmount;
} 