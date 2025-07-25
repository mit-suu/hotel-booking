package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.VoucherCreateRequest;
import net.blwsmartware.booking.dto.request.VoucherUpdateRequest;
import net.blwsmartware.booking.dto.request.VoucherValidationRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.VoucherResponse;
import net.blwsmartware.booking.dto.response.VoucherValidationResponse;
import net.blwsmartware.booking.enums.VoucherStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface VoucherService {
    
    // ===== ADMIN OPERATIONS =====
    DataResponse<VoucherResponse> getAllVouchers(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<VoucherResponse> getVouchersByStatus(VoucherStatus status, Integer pageNumber, Integer pageSize, String sortBy);
    VoucherResponse getVoucherById(UUID id);
    VoucherResponse createVoucher(VoucherCreateRequest request);
    VoucherResponse updateVoucher(UUID id, VoucherUpdateRequest request);
    void deleteVoucher(UUID id);
    VoucherResponse toggleVoucherStatus(UUID id);
    DataResponse<VoucherResponse> searchVouchers(String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Admin Statistics
    Long getTotalVouchersCount();
    Long getActiveVouchersCount();
    Long getExpiredVouchersCount();
    Long getUsedUpVouchersCount();
    BigDecimal getTotalDiscountAmount();
    Long getTotalUsageCount();
    
    // ===== PUBLIC OPERATIONS =====
    VoucherValidationResponse validateVoucher(VoucherValidationRequest request);
    List<VoucherResponse> getAvailableVouchersForHotel(UUID hotelId);
    VoucherResponse getVoucherByCode(String code);
    
    // ===== VOUCHER USAGE OPERATIONS =====
    VoucherResponse applyVoucher(String voucherCode, UUID userId, UUID bookingId, BigDecimal originalAmount, UUID hotelId);
    void removeVoucherUsage(UUID bookingId);
    void deleteVoucherUsageByBookingId(UUID bookingId);
    BigDecimal calculateDiscount(UUID voucherId, BigDecimal bookingAmount);
    
    // ===== UTILITY METHODS =====
    boolean isVoucherCodeExists(String code);
    void updateVoucherStatuses(); // Scheduled method to update expired vouchers
    List<VoucherResponse> getExpiringVouchers(); // Get vouchers expiring soon
    
    // ===== HOST OPERATIONS =====
    DataResponse<VoucherResponse> getHostVouchers(UUID hostId, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<VoucherResponse> getHostVouchersByStatus(UUID hostId, VoucherStatus status, Integer pageNumber, Integer pageSize, String sortBy);
    VoucherResponse getHostVoucherById(UUID hostId, UUID voucherId);
    VoucherResponse createHostVoucher(UUID hostId, VoucherCreateRequest request);
    VoucherResponse updateHostVoucher(UUID hostId, UUID voucherId, VoucherUpdateRequest request);
    void deleteHostVoucher(UUID hostId, UUID voucherId);
    VoucherResponse toggleHostVoucherStatus(UUID hostId, UUID voucherId);
    DataResponse<VoucherResponse> searchHostVouchers(UUID hostId, String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<VoucherResponse> searchHostVouchersByHotel(UUID hostId, UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Host Statistics
    Long getHostVouchersCount(UUID hostId);
    Long getHostActiveVouchersCount(UUID hostId);
    Long getHostExpiredVouchersCount(UUID hostId);
    Long getHostUsedUpVouchersCount(UUID hostId);
} 