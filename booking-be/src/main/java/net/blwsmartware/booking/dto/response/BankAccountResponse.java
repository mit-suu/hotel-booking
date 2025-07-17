package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankAccountResponse {
    
    UUID id;
    String bankName;
    String accountNumber;
    String accountName;
    String branch;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
} 