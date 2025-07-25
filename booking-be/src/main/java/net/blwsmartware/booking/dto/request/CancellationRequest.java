package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CancellationRequest {
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    private BigDecimal refundAmount;
    
    private Integer refundPercentage;
} 