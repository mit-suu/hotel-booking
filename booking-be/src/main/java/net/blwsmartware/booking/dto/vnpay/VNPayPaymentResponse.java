package net.blwsmartware.booking.dto.vnpay;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentResponse {
    private String code;        // 00: success, other: error
    private String message;
    private String paymentUrl;  // URL để redirect user đến VNPay
} 