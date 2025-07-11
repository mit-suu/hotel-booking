package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.TransactionStatus;
import net.blwsmartware.booking.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalletTransactionResponse {
    
    UUID id;
    UUID userId;
    String userName;
    String userEmail;
    TransactionType transactionType;
    BigDecimal amount;
    String description;
    TransactionStatus status;
    UUID referenceId;
    String note;
    LocalDateTime createdAt;
    LocalDateTime processedAt;
    UUID processedBy;
} 