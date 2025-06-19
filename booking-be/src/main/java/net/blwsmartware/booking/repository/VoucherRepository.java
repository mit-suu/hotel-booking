package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Voucher;
import net.blwsmartware.booking.enums.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, UUID> {
    
    // Find voucher by code
    Optional<Voucher> findByCode(String code);
    
    // Check if code exists
    boolean existsByCode(String code);
    
    // Find vouchers by status
    Page<Voucher> findByStatus(VoucherStatus status, Pageable pageable);
    
    // Find active vouchers
    @Query("SELECT v FROM Voucher v WHERE v.status = 'ACTIVE' AND v.startDate <= :now AND v.endDate >= :now")
    List<Voucher> findActiveVouchers(@Param("now") LocalDateTime now);
    
    // Find vouchers applicable to specific hotel
    @Query("SELECT v FROM Voucher v WHERE v.applicableScope = 'ALL_HOTELS' OR " +
           "(v.applicableScope = 'SPECIFIC_HOTELS' AND :hotelId IN (SELECT h.id FROM v.applicableHotels h))")
    List<Voucher> findVouchersApplicableToHotel(@Param("hotelId") UUID hotelId);
    
    // Find active vouchers applicable to specific hotel
    @Query("SELECT v FROM Voucher v WHERE v.status = 'ACTIVE' AND v.startDate <= :now AND v.endDate >= :now AND " +
           "(v.applicableScope = 'ALL_HOTELS' OR " +
           "(v.applicableScope = 'SPECIFIC_HOTELS' AND :hotelId IN (SELECT h.id FROM v.applicableHotels h)))")
    List<Voucher> findActiveVouchersApplicableToHotel(@Param("hotelId") UUID hotelId, @Param("now") LocalDateTime now);
    
    // Search vouchers by name or code
    @Query("SELECT v FROM Voucher v WHERE LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Voucher> searchVouchers(@Param("keyword") String keyword, Pageable pageable);
    
    // Find expiring vouchers
    @Query("SELECT v FROM Voucher v WHERE v.status = 'ACTIVE' AND v.endDate BETWEEN :startDate AND :endDate")
    List<Voucher> findExpiringVouchers(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Count vouchers by status
    long countByStatus(VoucherStatus status);
    
    // Find vouchers with usage limit exceeded
    @Query("SELECT v FROM Voucher v WHERE v.usageLimit IS NOT NULL AND v.usageCount >= v.usageLimit")
    List<Voucher> findVouchersWithExceededUsageLimit();
} 