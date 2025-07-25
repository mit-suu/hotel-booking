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

    Optional<Voucher> findByCode(String code);
    boolean existsByCode(String code);
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

    long countByStatus(VoucherStatus status);

    @Query("SELECT v FROM Voucher v WHERE v.usageLimit IS NOT NULL AND v.usageCount >= v.usageLimit")
    List<Voucher> findVouchersWithExceededUsageLimit();
    
    // Host-specific queries
    Page<Voucher> findByCreatedBy(UUID hostId, Pageable pageable);
    
    Page<Voucher> findByCreatedByAndStatus(UUID hostId, VoucherStatus status, Pageable pageable);
    
    @Query("SELECT v FROM Voucher v WHERE v.createdBy = :hostId AND " +
           "(LOWER(v.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(v.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Voucher> searchVouchersByHost(@Param("hostId") UUID hostId, @Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT v FROM Voucher v WHERE v.createdBy = :hostId AND " +
           "EXISTS (SELECT h FROM v.applicableHotels h WHERE h.id = :hotelId)")
    Page<Voucher> findVouchersByHostAndHotel(@Param("hostId") UUID hostId, @Param("hotelId") UUID hotelId, Pageable pageable);
    
    long countByCreatedBy(UUID hostId);
    
    long countByCreatedByAndStatus(UUID hostId, VoucherStatus status);
    
    boolean existsByCodeAndCreatedBy(String code, UUID hostId);
    
    // Find voucher by code with priority logic
    // Priority: 1. Admin ALL_HOTELS, 2. Host SPECIFIC_HOTELS for hotel, 3. Admin SPECIFIC_HOTELS for hotel
    @Query("SELECT v FROM Voucher v WHERE v.code = :code AND " +
           "(v.applicableScope = 'ALL_HOTELS' OR " +
           "(v.applicableScope = 'SPECIFIC_HOTELS' AND :hotelId IN (SELECT h.id FROM v.applicableHotels h))) " +
           "ORDER BY " +
           "CASE WHEN v.applicableScope = 'ALL_HOTELS' THEN 1 " +
           "WHEN v.applicableScope = 'SPECIFIC_HOTELS' AND EXISTS(SELECT h FROM Hotel h WHERE h.id = :hotelId AND h.createdBy = v.createdBy) THEN 2 " +
           "ELSE 3 END")
    List<Voucher> findByCodeWithPriority(@Param("code") String code, @Param("hotelId") UUID hotelId);
    
    // Enhanced method to get available vouchers with proper separation
    @Query("SELECT v FROM Voucher v WHERE v.status = 'ACTIVE' AND v.startDate <= :now AND v.endDate >= :now AND " +
           "v.applicableScope = 'ALL_HOTELS'")
    List<Voucher> findActiveAdminGlobalVouchers(@Param("now") LocalDateTime now);
    
    @Query("SELECT v FROM Voucher v WHERE v.status = 'ACTIVE' AND v.startDate <= :now AND v.endDate >= :now AND " +
           "v.applicableScope = 'SPECIFIC_HOTELS' AND :hotelId IN (SELECT h.id FROM v.applicableHotels h)")
    List<Voucher> findActiveSpecificVouchersForHotel(@Param("hotelId") UUID hotelId, @Param("now") LocalDateTime now);
} 