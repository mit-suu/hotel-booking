package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WithdrawalRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10000", message = "Minimum withdrawal amount is 10,000 VND")
    BigDecimal amount;
    
    String note;
} 