package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.vnpay.VNPayCallbackRequest;
import net.blwsmartware.booking.dto.vnpay.VNPayPaymentRequest;
import net.blwsmartware.booking.dto.vnpay.VNPayPaymentResponse;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface VNPayService {
    
    /**
     * Tạo URL thanh toán VNPay
     */
    VNPayPaymentResponse createPaymentUrl(VNPayPaymentRequest request, HttpServletRequest httpRequest);
    
    /**
     * Xử lý IPN (Instant Payment Notification) từ VNPay
     */
    String processIPN(Map<String, String> vnpParams);
    
    /**
     * Xử lý Return URL từ VNPay
     */
    VNPayCallbackRequest processReturnUrl(Map<String, String> vnpParams);
    
    /**
     * Verify signature từ VNPay
     */
    boolean verifySignature(Map<String, String> vnpParams, String secureHash);
    
    /**
     * Query transaction status từ VNPay
     */
    Map<String, String> queryTransaction(String txnRef, String transDate);
} 