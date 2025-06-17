package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.VoucherUsage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, UUID> {
    
    // Find usage by voucher
    List<VoucherUsage> findByVoucherId(UUID voucherId);
    
    // Find usage by user
    List<VoucherUsage> findByUserId(UUID userId);
    
    // Find usage by booking
    Optional<VoucherUsage> findByBookingId(UUID bookingId);
    
    // Delete usage by booking ID
    void deleteByBookingId(UUID bookingId);
    
    // Find usage by voucher and user
    List<VoucherUsage> findByVoucherIdAndUserId(UUID voucherId, UUID userId);
    
    // Check if user has used specific voucher
    boolean existsByVoucherIdAndUserId(UUID voucherId, UUID userId);
    
    // Count usage by voucher
    long countByVoucherId(UUID voucherId);
    
    // Find usage in date range
    @Query("SELECT vu FROM VoucherUsage vu WHERE vu.usedAt BETWEEN :startDate AND :endDate")
    Page<VoucherUsage> findUsageInDateRange(@Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate, 
                                            Pageable pageable);
    
    // Calculate total discount amount by voucher
    @Query("SELECT COALESCE(SUM(vu.discountAmount), 0) FROM VoucherUsage vu WHERE vu.voucher.id = :voucherId")
    BigDecimal calculateTotalDiscountByVoucher(@Param("voucherId") UUID voucherId);
    
        // Calculate total discount amount in date range
    @Query("SELECT COALESCE(SUM(vu.discountAmount), 0) FROM VoucherUsage vu WHERE vu.usedAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalDiscountInDateRange(@Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate);
    
    // Get total usage count
    @Query("SELECT COUNT(vu) FROM VoucherUsage vu")
    Long getTotalUsageCount();
} 