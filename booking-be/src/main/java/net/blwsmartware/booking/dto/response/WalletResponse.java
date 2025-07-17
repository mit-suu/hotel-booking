package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WalletResponse {
    
    BigDecimal balance;
    BankAccountResponse bankAccount;
    List<WalletTransactionResponse> transactions;
} 