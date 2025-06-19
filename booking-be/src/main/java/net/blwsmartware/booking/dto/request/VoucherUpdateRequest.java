package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.ApplicableScope;
import net.blwsmartware.booking.enums.DiscountType;
import net.blwsmartware.booking.enums.VoucherStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherUpdateRequest {
    
    @Size(max = 100, message = "Voucher name cannot exceed 100 characters")
    String name;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    String description;
    
    DiscountType discountType;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Discount value must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid discount value format")
    BigDecimal discountValue;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Max discount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid max discount format")
    BigDecimal maxDiscount;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Min booking value must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid min booking value format")
    BigDecimal minBookingValue;
    
    LocalDateTime startDate;
    
    LocalDateTime endDate;
    
    @Min(value = 1, message = "Usage limit must be at least 1")
    Integer usageLimit;
    
    ApplicableScope applicableScope;
    
    List<UUID> hotelIds;
    
    VoucherStatus status;
}