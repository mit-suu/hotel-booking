package net.blwsmartware.booking.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.configuration.VNPayConfig;
import net.blwsmartware.booking.dto.vnpay.VNPayCallbackRequest;
import net.blwsmartware.booking.dto.vnpay.VNPayPaymentRequest;
import net.blwsmartware.booking.dto.vnpay.VNPayPaymentResponse;
import net.blwsmartware.booking.entity.Booking;
import net.blwsmartware.booking.entity.VNPayTransaction;
import net.blwsmartware.booking.enums.PaymentStatus;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.repository.VNPayTransactionRepository;
import net.blwsmartware.booking.service.RevenueService;
import net.blwsmartware.booking.service.VNPayService;
import net.blwsmartware.booking.util.VNPayUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayServiceImpl implements VNPayService {
    
    private final VNPayConfig vnPayConfig;
    private final BookingRepository bookingRepository;
    private final VNPayTransactionRepository vnPayTransactionRepository;
    private final RevenueService revenueService;
    
    @Override
    @Transactional
    public VNPayPaymentResponse createPaymentUrl(VNPayPaymentRequest request, HttpServletRequest httpRequest) {
        try {
            log.info("Creating VNPay payment URL for booking: {}", request.getBookingId());
            
            // Validate booking exists
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
            
            // Check if booking is in valid state for payment
            if (booking.getPaymentStatus() == PaymentStatus.PAID) {
                throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_PAID);
            }
            
            // Generate transaction reference
            String txnRef = VNPayUtil.generateTxnRef();
            
            // Build VNPay parameters
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", VNPayConfig.VERSION);
            vnpParams.put("vnp_Command", VNPayConfig.COMMAND);
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(request.getAmount().multiply(BigDecimal.valueOf(100)).longValue()));
            vnpParams.put("vnp_CurrCode", VNPayConfig.CURR_CODE);
            
            if (request.getBankCode() != null && !request.getBankCode().isEmpty()) {
                vnpParams.put("vnp_BankCode", request.getBankCode());
            }
            
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", request.getOrderInfo());
            vnpParams.put("vnp_OrderType", VNPayConfig.ORDER_TYPE);
            vnpParams.put("vnp_Locale", request.getLocale() != null ? request.getLocale() : VNPayConfig.LOCALE);
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", VNPayUtil.getIpAddress(httpRequest));
            vnpParams.put("vnp_CreateDate", VNPayUtil.getCurrentTimeString());
            
            // Add expire date (15 minutes from now)
            Calendar expireCal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            expireCal.add(Calendar.MINUTE, 15);
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            vnpParams.put("vnp_ExpireDate", formatter.format(expireCal.getTime()));
            
            // Debug: Log all parameters before signature
            log.info("VNPay parameters before signature: {}", vnpParams);
            
            // Create signature
            String secureHash = VNPayUtil.hashAllFields(vnpParams, vnPayConfig.getSecretKey());
            vnpParams.put("vnp_SecureHash", secureHash);
            
            // Debug: Log signature and final parameters
            log.info("Generated signature: {}", secureHash);
            log.info("Final VNPay parameters: {}", vnpParams);
            
            // Build payment URL
            StringBuilder paymentUrl = new StringBuilder(vnPayConfig.getPaymentUrl());
            paymentUrl.append("?");
            
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);
            
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnpParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    paymentUrl.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                    paymentUrl.append('=');
                    paymentUrl.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                    if (itr.hasNext()) {
                        paymentUrl.append('&');
                    }
                }
            }
            
            // Save transaction to database
            VNPayTransaction transaction = VNPayTransaction.builder()
                    .booking(booking)
                    .vnpTxnRef(txnRef)
                    .vnpAmount(request.getAmount())
                    .vnpOrderInfo(request.getOrderInfo())
                    .paymentStatus(PaymentStatus.PENDING)
                    .isIpnReceived(false)
                    .isReturnProcessed(false)
                    .build();
            
            vnPayTransactionRepository.save(transaction);
            
            // Update booking payment status
            booking.setPaymentStatus(PaymentStatus.PENDING);
            booking.setPaymentMethod("VNPAY");
            bookingRepository.save(booking);
            
            log.info("VNPay payment URL created successfully for booking: {}, txnRef: {}", 
                     request.getBookingId(), txnRef);
            log.info("Final payment URL: {}", paymentUrl.toString());
            
            return VNPayPaymentResponse.builder()
                    .code("00")
                    .message("Success")
                    .paymentUrl(paymentUrl.toString())
                    .build();
                    
        } catch (AppRuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating VNPay payment URL: {}", e.getMessage(), e);
            throw new AppRuntimeException(ErrorResponse.VNPAY_PAYMENT_URL_CREATION_FAILED);
        }
    }
    
    @Override
    @Transactional
    public String processIPN(Map<String, String> vnpParams) {
        try {
            log.info("Processing VNPay IPN: {}", vnpParams);
            
            String secureHash = vnpParams.get("vnp_SecureHash");
            
            // Verify signature
            if (!verifySignature(vnpParams, secureHash)) {
                log.error("Invalid signature in IPN");
                return "97"; // Invalid signature
            }
            
            String txnRef = vnpParams.get("vnp_TxnRef");
            String responseCode = vnpParams.get("vnp_ResponseCode");
            String transactionStatus = vnpParams.get("vnp_TransactionStatus");
            
            // Find transaction
            VNPayTransaction transaction = vnPayTransactionRepository.findByVnpTxnRef(txnRef)
                    .orElse(null);
            
            if (transaction == null) {
                log.error("Transaction not found for txnRef: {}", txnRef);
                return "01"; // Order not found
            }
            
            // Check if IPN already processed
            if (transaction.getIsIpnReceived()) {
                log.info("IPN already processed for txnRef: {}", txnRef);
                return "00"; // Already processed
            }
            
            // Update transaction
            transaction.setVnpResponseCode(responseCode);
            transaction.setVnpTransactionStatus(transactionStatus);
            transaction.setVnpTransactionNo(vnpParams.get("vnp_TransactionNo"));
            transaction.setVnpBankCode(vnpParams.get("vnp_BankCode"));
            transaction.setVnpBankTranNo(vnpParams.get("vnp_BankTranNo"));
            transaction.setVnpCardType(vnpParams.get("vnp_CardType"));
            transaction.setVnpPayDate(vnpParams.get("vnp_PayDate"));
            transaction.setIsIpnReceived(true);
            
            // Update payment status based on response
            Booking booking = transaction.getBooking();
            if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
                // Chỉ cập nhật nếu booking chưa được thanh toán trước đó
                if (booking.getPaymentStatus() != PaymentStatus.PAID) {
                    transaction.setPaymentStatus(PaymentStatus.PAID);
                    booking.setPaymentStatus(PaymentStatus.PAID);
                    log.info("Payment successful for booking: {}", booking.getId());
                    
                    // Cập nhật revenue cho hotel khi thanh toán thành công (chỉ 1 lần)
                    try {
                        revenueService.updateHotelRevenue(booking.getId());
                    } catch (Exception e) {
                        log.error("Error updating hotel revenue for booking: {}", booking.getId(), e);
                    }
                } else {
                    log.info("Booking {} already paid, skipping revenue update", booking.getId());
                }
            } else {
                transaction.setPaymentStatus(PaymentStatus.FAILED);
                booking.setPaymentStatus(PaymentStatus.FAILED);
                log.info("Payment failed for booking: {}, responseCode: {}", booking.getId(), responseCode);
            }
            
            vnPayTransactionRepository.save(transaction);
            bookingRepository.save(booking);
            
            return "00"; // Success
            
        } catch (Exception e) {
            log.error("Error processing VNPay IPN: {}", e.getMessage(), e);
            return "99"; // Unknown error
        }
    }
    
    @Override
    public VNPayCallbackRequest processReturnUrl(Map<String, String> vnpParams) {
        try {
            log.info("Processing VNPay return URL: {}", vnpParams);
            
            VNPayCallbackRequest callbackRequest = VNPayCallbackRequest.builder()
                    .vnp_TmnCode(vnpParams.get("vnp_TmnCode"))
                    .vnp_Amount(vnpParams.get("vnp_Amount") != null ? 
                               new BigDecimal(vnpParams.get("vnp_Amount")).divide(BigDecimal.valueOf(100)) : null)
                    .vnp_BankCode(vnpParams.get("vnp_BankCode"))
                    .vnp_BankTranNo(vnpParams.get("vnp_BankTranNo"))
                    .vnp_CardType(vnpParams.get("vnp_CardType"))
                    .vnp_PayDate(vnpParams.get("vnp_PayDate"))
                    .vnp_OrderInfo(vnpParams.get("vnp_OrderInfo"))
                    .vnp_TransactionNo(vnpParams.get("vnp_TransactionNo"))
                    .vnp_ResponseCode(vnpParams.get("vnp_ResponseCode"))
                    .vnp_TransactionStatus(vnpParams.get("vnp_TransactionStatus"))
                    .vnp_TxnRef(vnpParams.get("vnp_TxnRef"))
                    .vnp_SecureHashType(vnpParams.get("vnp_SecureHashType"))
                    .vnp_SecureHash(vnpParams.get("vnp_SecureHash"))
                    .build();
            
            // Mark return as processed and update payment status
            String txnRef = vnpParams.get("vnp_TxnRef");
            String responseCode = vnpParams.get("vnp_ResponseCode");
            String transactionStatus = vnpParams.get("vnp_TransactionStatus");
            
            if (txnRef != null) {
                vnPayTransactionRepository.findByVnpTxnRef(txnRef)
                        .ifPresent(transaction -> {
                            // Update transaction details
                            transaction.setVnpResponseCode(responseCode);
                            transaction.setVnpTransactionStatus(transactionStatus);
                            transaction.setVnpTransactionNo(vnpParams.get("vnp_TransactionNo"));
                            transaction.setVnpBankCode(vnpParams.get("vnp_BankCode"));
                            transaction.setVnpBankTranNo(vnpParams.get("vnp_BankTranNo"));
                            transaction.setVnpCardType(vnpParams.get("vnp_CardType"));
                            transaction.setVnpPayDate(vnpParams.get("vnp_PayDate"));
                            transaction.setIsReturnProcessed(true);
                            
                            // Update payment status for both transaction and booking
                            Booking booking = transaction.getBooking();
                            if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
                                // Chỉ cập nhật nếu booking chưa được thanh toán trước đó
                                if (booking.getPaymentStatus() != PaymentStatus.PAID) {
                                    transaction.setPaymentStatus(PaymentStatus.PAID);
                                    booking.setPaymentStatus(PaymentStatus.PAID);
                                    log.info("Payment successful via return URL for booking: {}", booking.getId());
                                    
                                    // Cập nhật revenue cho hotel khi thanh toán thành công (chỉ 1 lần)
                                    try {
                                        revenueService.updateHotelRevenue(booking.getId());
                                    } catch (Exception e) {
                                        log.error("Error updating hotel revenue for booking: {}", booking.getId(), e);
                                    }
                                } else {
                                    log.info("Booking {} already paid via return URL, skipping revenue update", booking.getId());
                                }
                            } else {
                                transaction.setPaymentStatus(PaymentStatus.FAILED);
                                booking.setPaymentStatus(PaymentStatus.FAILED);
                                log.info("Payment failed via return URL for booking: {}, responseCode: {}", 
                                        booking.getId(), responseCode);
                            }
                            
                            vnPayTransactionRepository.save(transaction);
                            bookingRepository.save(booking);
                        });
            }
            
            return callbackRequest;
            
        } catch (Exception e) {
            log.error("Error processing VNPay return URL: {}", e.getMessage(), e);
            throw new AppRuntimeException(ErrorResponse.UNKNOWN_EXCEPTION);
        }
    }
    
    @Override
    public boolean verifySignature(Map<String, String> vnpParams, String secureHash) {
        try {
            Map<String, String> fields = new HashMap<>(vnpParams);
            fields.remove("vnp_SecureHash");
            fields.remove("vnp_SecureHashType");
            
            String signValue = VNPayUtil.hashAllFields(fields, vnPayConfig.getSecretKey());
            return signValue.equals(secureHash);
            
        } catch (Exception e) {
            log.error("Error verifying signature: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    public Map<String, String> queryTransaction(String txnRef, String transDate) {
        // Implementation for querying transaction status from VNPay
        // This would involve making HTTP request to VNPay's query API
        log.info("Query transaction - txnRef: {}, transDate: {}", txnRef, transDate);
        
        // For now, return empty map - can be implemented based on requirements
        return new HashMap<>();
    }
} 