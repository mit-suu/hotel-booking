package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.ApplicableScope;
import net.blwsmartware.booking.enums.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherCreateRequest {
    
    @NotBlank(message = "Voucher code is required")
    @Size(max = 50, message = "Voucher code cannot exceed 50 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Voucher code must contain only uppercase letters and numbers")
    String code;
    
    @NotBlank(message = "Voucher name is required")
    @Size(max = 100, message = "Voucher name cannot exceed 100 characters")
    String name;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    String description;
    
    @NotNull(message = "Discount type is required")
    DiscountType discountType;
    
    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Discount value must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid discount value format")
    BigDecimal discountValue;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Max discount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid max discount format")
    BigDecimal maxDiscount;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Min booking value must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid min booking value format")
    BigDecimal minBookingValue;
    
    @NotNull(message = "Start date is required")
    LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    LocalDateTime endDate;
    
    @Min(value = 1, message = "Usage limit must be at least 1")
    Integer usageLimit;
    
    @NotNull(message = "Applicable scope is required")
    ApplicableScope applicableScope;
    
    List<UUID> hotelIds;
    
    @AssertTrue(message = "End date must be after start date")
    public boolean isEndDateAfterStartDate() {
        if (startDate == null || endDate == null) {
            return true;
        }
        return endDate.isAfter(startDate);
    }
    
    @AssertTrue(message = "Hotel IDs are required when applicable scope is SPECIFIC_HOTELS")
    public boolean isHotelIdsValidForScope() {
        if (applicableScope == ApplicableScope.SPECIFIC_HOTELS) {
            return hotelIds != null && !hotelIds.isEmpty();
        }
        return true;
    }
    
    @AssertTrue(message = "Max discount is required for percentage discount type")
    public boolean isMaxDiscountValidForPercentage() {
        if (discountType == DiscountType.PERCENTAGE) {
            return maxDiscount != null;
        }
        return true;
    }
    
    @AssertTrue(message = "Percentage discount value must be between 1 and 100")
    public boolean isPercentageValueValid() {
        if (discountType == DiscountType.PERCENTAGE && discountValue != null) {
            return discountValue.compareTo(BigDecimal.ONE) >= 0 && 
                   discountValue.compareTo(BigDecimal.valueOf(100)) <= 0;
        }
        return true;
    }
} 