package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BankAccountRequest {
    
    @NotBlank(message = "Bank name is required")
    @Size(max = 100, message = "Bank name must not exceed 100 characters")
    String bankName;
    
    @NotBlank(message = "Account number is required")
    @Size(max = 50, message = "Account number must not exceed 50 characters")
    String accountNumber;
    
    @NotBlank(message = "Account name is required") 
    @Size(max = 100, message = "Account name must not exceed 100 characters")
    String accountName;
    
    @Size(max = 100, message = "Branch must not exceed 100 characters")
    String branch;
} 