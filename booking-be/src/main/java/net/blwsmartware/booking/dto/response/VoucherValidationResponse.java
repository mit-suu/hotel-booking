package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherValidationResponse {
    boolean valid;
    String message;
    BigDecimal discountAmount;
    BigDecimal finalAmount;
    VoucherResponse voucher;
} 