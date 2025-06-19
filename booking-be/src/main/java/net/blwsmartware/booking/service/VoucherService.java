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
} 