package net.blwsmartware.booking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.vnpay.VNPayCallbackRequest;
import net.blwsmartware.booking.dto.vnpay.VNPayPaymentRequest;
import net.blwsmartware.booking.dto.vnpay.VNPayPaymentResponse;
import net.blwsmartware.booking.service.VNPayService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment", description = "Payment management APIs")
public class PaymentController {
    
    private final VNPayService vnPayService;
    
    @PostMapping("/vnpay/create")
    @Operation(
        summary = "Create VNPay payment URL",
        description = "Create a payment URL for VNPay payment gateway",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<MessageResponse<VNPayPaymentResponse>> createVNPayPayment(
            @Valid @RequestBody VNPayPaymentRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("Creating VNPay payment for booking: {}", request.getBookingId());
        
        VNPayPaymentResponse response = vnPayService.createPaymentUrl(request, httpRequest);
        
        return ResponseEntity.ok(MessageResponse.<VNPayPaymentResponse>builder()
                .message("VNPay payment URL created successfully")
                .result(response)
                .build());
    }
    
    @PostMapping("/vnpay/ipn")
    @Operation(
        summary = "VNPay IPN callback",
        description = "Handle VNPay Instant Payment Notification callback"
    )
    public ResponseEntity<String> handleVNPayIPN(HttpServletRequest request) {
        log.info("Received VNPay IPN callback");
        
        Map<String, String> vnpParams = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();
        
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            vnpParams.put(paramName, paramValue);
        }
        
        String result = vnPayService.processIPN(vnpParams);
        
        // VNPay expects specific response codes
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/vnpay/return")
    @Operation(
        summary = "VNPay return URL",
        description = "Handle VNPay return URL after payment"
    )
    public ResponseEntity<MessageResponse<VNPayCallbackRequest>> handleVNPayReturn(
            HttpServletRequest request) {
        
        log.info("Received VNPay return callback");
        
        Map<String, String> vnpParams = new HashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();
        
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            vnpParams.put(paramName, paramValue);
        }
        
        VNPayCallbackRequest callbackRequest = vnPayService.processReturnUrl(vnpParams);
        
        return ResponseEntity.ok(MessageResponse.<VNPayCallbackRequest>builder()
                .message("VNPay return processed successfully")
                .result(callbackRequest)
                .build());
    }
    
    @PostMapping("/vnpay/verify")
    @Operation(
        summary = "Verify VNPay signature",
        description = "Verify VNPay payment signature"
    )
    public ResponseEntity<MessageResponse<Boolean>> verifyVNPaySignature(
            @RequestParam Map<String, String> params) {
        
        String secureHash = params.get("vnp_SecureHash");
        boolean isValid = vnPayService.verifySignature(params, secureHash);
        
        return ResponseEntity.ok(MessageResponse.<Boolean>builder()
                .message(isValid ? "Signature is valid" : "Invalid signature")
                .result(isValid)
                .build());
    }
    
    @GetMapping("/vnpay/query/{txnRef}")
    @Operation(
        summary = "Query VNPay transaction",
        description = "Query VNPay transaction status",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<MessageResponse<Map<String, String>>> queryVNPayTransaction(
            @PathVariable String txnRef,
            @RequestParam String transDate) {
        
        Map<String, String> result = vnPayService.queryTransaction(txnRef, transDate);
        
        return ResponseEntity.ok(MessageResponse.<Map<String, String>>builder()
                .message("Transaction query completed")
                .result(result)
                .build());
    }
} 