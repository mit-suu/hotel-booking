package net.blwsmartware.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.PaymentStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vnpay_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VNPayTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    Booking booking;
    
    @Column(name = "vnp_txn_ref", nullable = false, unique = true)
    String vnpTxnRef; // Reference ID gửi tới VNPay
    
    @Column(name = "vnp_transaction_no")
    String vnpTransactionNo; // Transaction number từ VNPay
    
    @Column(name = "vnp_amount", nullable = false, precision = 12, scale = 2)
    BigDecimal vnpAmount;
    
    @Column(name = "vnp_order_info")
    String vnpOrderInfo;
    
    @Column(name = "vnp_response_code")
    String vnpResponseCode;
    
    @Column(name = "vnp_transaction_status")
    String vnpTransactionStatus;
    
    @Column(name = "vnp_bank_code")
    String vnpBankCode;
    
    @Column(name = "vnp_bank_tran_no")
    String vnpBankTranNo;
    
    @Column(name = "vnp_card_type")
    String vnpCardType;
    
    @Column(name = "vnp_pay_date")
    String vnpPayDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    PaymentStatus paymentStatus;
    
    @Column(name = "is_ipn_received")
    Boolean isIpnReceived = false;
    
    @Column(name = "is_return_processed")
    Boolean isReturnProcessed = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
} 