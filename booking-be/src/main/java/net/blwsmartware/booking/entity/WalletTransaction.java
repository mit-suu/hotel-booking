package net.blwsmartware.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.TransactionStatus;
import net.blwsmartware.booking.enums.TransactionType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wallet_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalletTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    TransactionType transactionType;
    
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    BigDecimal amount;
    
    @Column(name = "description", columnDefinition = "TEXT")
    String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    TransactionStatus status = TransactionStatus.PENDING;
    
    @Column(name = "reference_id")
    UUID referenceId; // Có thể là booking ID khi hoàn tiền
    
    @Column(name = "note", columnDefinition = "TEXT")
    String note;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
    
    @Column(name = "processed_at")
    LocalDateTime processedAt;
    
    @Column(name = "processed_by")
    UUID processedBy; // Admin ID who processed the transaction
} 