package net.blwsmartware.booking.dto.vnpay;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentRequest {
    private UUID bookingId;
    private BigDecimal amount;
    private String orderInfo;
    private String bankCode; // Optional: VNPAYQR, VNBANK, INTCARD
    private String locale; // Default: vn
} 