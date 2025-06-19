package net.blwsmartware.booking.dto.response;

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
public class VoucherResponse {
    UUID id;
    String code;
    String name;
    String description;
    DiscountType discountType;
    BigDecimal discountValue;
    BigDecimal maxDiscount;
    BigDecimal minBookingValue;
    LocalDateTime startDate;
    LocalDateTime endDate;
    Integer usageLimit;
    Integer usageCount;
    ApplicableScope applicableScope;
    VoucherStatus status;
    List<HotelResponse> applicableHotels;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    String createdBy;
    String updatedBy;
} 