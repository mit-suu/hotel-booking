package net.blwsmartware.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.ApplicableScope;
import net.blwsmartware.booking.enums.DiscountType;
import net.blwsmartware.booking.enums.VoucherStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vouchers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false, unique = true, length = 50)
    String code;

    @Column(nullable = false, length = 100)
    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "discount_type", nullable = false)
    @Enumerated(EnumType.STRING)
    DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    BigDecimal discountValue;

    @Column(name = "max_discount", precision = 10, scale = 2)
    BigDecimal maxDiscount;

    @Column(name = "min_booking_value", precision = 10, scale = 2)
    BigDecimal minBookingValue;

    @Column(name = "start_date", nullable = false)
    LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    LocalDateTime endDate;

    @Column(name = "usage_limit")
    Integer usageLimit;

    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    Integer usageCount = 0;

    @Column(name = "applicable_scope", nullable = false)
    @Enumerated(EnumType.STRING)
    ApplicableScope applicableScope;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    VoucherStatus status = VoucherStatus.ACTIVE;

    // Relationships
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "voucher_hotels",
        joinColumns = @JoinColumn(name = "voucher_id"),
        inverseJoinColumns = @JoinColumn(name = "hotel_id")
    )
    List<Hotel> applicableHotels;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<VoucherUsage> voucherUsages;

    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "created_by")
    UUID createdBy;

    @Column(name = "updated_by")
    UUID updatedBy;

    // Helper methods
    public boolean isActive() {
        return status == VoucherStatus.ACTIVE && 
               LocalDateTime.now().isAfter(startDate) && 
               LocalDateTime.now().isBefore(endDate) &&
               (usageLimit == null || usageCount < usageLimit);
    }

    public boolean isApplicableToHotel(UUID hotelId) {
        if (applicableScope == ApplicableScope.ALL_HOTELS) {
            return true;
        }
        return applicableHotels != null && 
               applicableHotels.stream().anyMatch(hotel -> hotel.getId().equals(hotelId));
    }
} 