package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.VoucherCreateRequest;
import net.blwsmartware.booking.dto.request.VoucherUpdateRequest;
import net.blwsmartware.booking.dto.request.VoucherValidationRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.VoucherResponse;
import net.blwsmartware.booking.dto.response.VoucherValidationResponse;
import net.blwsmartware.booking.entity.*;
import net.blwsmartware.booking.enums.*;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.mapper.VoucherMapper;
import net.blwsmartware.booking.repository.*;
import net.blwsmartware.booking.service.VoucherService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VoucherServiceImpl implements VoucherService {
    
    VoucherRepository voucherRepository;
    VoucherUsageRepository voucherUsageRepository;
    HotelRepository hotelRepository;
    UserRepository userRepository;
    BookingRepository bookingRepository;
    VoucherMapper voucherMapper;
    
    @Override
    @IsAdmin
    public DataResponse<VoucherResponse> getAllVouchers(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting all vouchers with pagination: page={}, size={}, sort={}", pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Voucher> voucherPage = voucherRepository.findAll(pageable);
        
        List<VoucherResponse> voucherResponses = voucherMapper.toResponseListWithoutHotels(voucherPage.getContent());
        
        return DataResponseUtils.convertPageInfo(voucherPage, voucherResponses);
    }
    
    @Override
    @IsAdmin
    public DataResponse<VoucherResponse> getVouchersByStatus(VoucherStatus status, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting vouchers by status: {} with pagination: page={}, size={}, sort={}", status, pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Voucher> voucherPage = voucherRepository.findByStatus(status, pageable);
        
        List<VoucherResponse> voucherResponses = voucherMapper.toResponseListWithoutHotels(voucherPage.getContent());
        
        return DataResponseUtils.convertPageInfo(voucherPage, voucherResponses);
    }
    
    @Override
    @IsAdmin
    public VoucherResponse getVoucherById(UUID id) {
        log.info("Getting voucher by ID: {}", id);
        
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        return voucherMapper.toResponse(voucher);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public VoucherResponse createVoucher(VoucherCreateRequest request) {
        log.info("Creating new voucher with code: {}", request.getCode());
        
        // Check if voucher code already exists
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new AppRuntimeException(ErrorResponse.VOUCHER_CODE_ALREADY_EXISTS);
        }
        
        // Convert request to entity
        Voucher voucher = voucherMapper.toEntity(request);
        voucher.setCreatedBy(getCurrentUserId());
        voucher.setUpdatedBy(getCurrentUserId());
        
        // Handle hotel assignments for specific scope
        if (request.getApplicableScope() == ApplicableScope.SPECIFIC_HOTELS && request.getHotelIds() != null) {
            List<Hotel> hotels = hotelRepository.findAllById(request.getHotelIds());
            if (hotels.size() != request.getHotelIds().size()) {
                throw new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND);
            }
            voucher.setApplicableHotels(hotels);
        }
        
        Voucher savedVoucher = voucherRepository.save(voucher);
        log.info("Successfully created voucher with ID: {}", savedVoucher.getId());
        
        return voucherMapper.toResponse(savedVoucher);
    }
    
    // TODO: Implement remaining methods
    
    private UUID getCurrentUserId() {
        return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
    }
    
    @Override
    @IsAdmin
    @Transactional
    public VoucherResponse updateVoucher(UUID id, VoucherUpdateRequest request) {
        log.info("Updating voucher with ID: {}", id);
        
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        voucherMapper.updateEntity(voucher, request);
        voucher.setUpdatedBy(getCurrentUserId());
        
        // Handle hotel assignments update
        if (request.getApplicableScope() != null) {
            if (request.getApplicableScope() == ApplicableScope.SPECIFIC_HOTELS && request.getHotelIds() != null) {
                List<Hotel> hotels = hotelRepository.findAllById(request.getHotelIds());
                voucher.setApplicableHotels(hotels);
            } else if (request.getApplicableScope() == ApplicableScope.ALL_HOTELS) {
                voucher.setApplicableHotels(null);
            }
        }
        
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return voucherMapper.toResponse(updatedVoucher);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public void deleteVoucher(UUID id) {
        log.info("Deleting voucher with ID: {}", id);
        
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        // Check if voucher has been used - throw exception to inform admin
        long usageCount = voucherUsageRepository.countByVoucherId(id);
        if (usageCount > 0) {
            log.warn("Attempted to delete voucher {} with {} usage records", voucher.getCode(), usageCount);
            throw new AppRuntimeException(ErrorResponse.VOUCHER_HAS_USAGE_RECORDS);
        } else {
            voucherRepository.delete(voucher);
            log.info("Voucher {} deleted successfully", voucher.getCode());
        }
    }
    
    @Override
    @IsAdmin
    @Transactional
    public VoucherResponse toggleVoucherStatus(UUID id) {
        log.info("Toggling status for voucher with ID: {}", id);
        
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        if (voucher.getStatus() == VoucherStatus.ACTIVE) {
            voucher.setStatus(VoucherStatus.INACTIVE);
        } else if (voucher.getStatus() == VoucherStatus.INACTIVE) {
            voucher.setStatus(VoucherStatus.ACTIVE);
        }
        
        voucher.setUpdatedBy(getCurrentUserId());
        Voucher updatedVoucher = voucherRepository.save(voucher);
        
        return voucherMapper.toResponse(updatedVoucher);
    }
    
    @Override
    @IsAdmin
    public DataResponse<VoucherResponse> searchVouchers(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching vouchers with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Voucher> voucherPage = voucherRepository.searchVouchers(keyword, pageable);
        
        List<VoucherResponse> voucherResponses = voucherMapper.toResponseListWithoutHotels(voucherPage.getContent());
        
        return DataResponseUtils.convertPageInfo(voucherPage, voucherResponses);
    }
    
    @Override
    @IsAdmin
    public Long getTotalVouchersCount() {
        return voucherRepository.count();
    }
    
    @Override
    @IsAdmin
    public Long getActiveVouchersCount() {
        return voucherRepository.countByStatus(VoucherStatus.ACTIVE);
    }
    
    @Override
    @IsAdmin
    public Long getExpiredVouchersCount() {
        return voucherRepository.countByStatus(VoucherStatus.EXPIRED);
    }
    
    @Override
    @IsAdmin
    public Long getUsedUpVouchersCount() {
        return voucherRepository.countByStatus(VoucherStatus.USED_UP);
    }
    
    @Override
    @IsAdmin
    public BigDecimal getTotalDiscountAmount() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
        return voucherUsageRepository.calculateTotalDiscountInDateRange(startOfMonth, endOfMonth);
    }
    
    @Override
    @IsAdmin
    public Long getTotalUsageCount() {
        return voucherUsageRepository.getTotalUsageCount();
    }
    
    @Override
    public VoucherValidationResponse validateVoucher(VoucherValidationRequest request) {
        log.info("Validating voucher code: {} for hotel: {}", request.getCode(), request.getHotelId());
        
        // Use priority-based lookup: Admin ALL_HOTELS > Host SPECIFIC_HOTELS > Admin SPECIFIC_HOTELS
        List<Voucher> vouchers = voucherRepository.findByCodeWithPriority(request.getCode(), request.getHotelId());
        
        if (vouchers.isEmpty()) {
            return VoucherValidationResponse.builder()
                    .valid(false)
                    .message("Voucher not found")
                    .build();
        }
        
        // Get the highest priority voucher (first one due to ORDER BY)
        Voucher voucher = vouchers.get(0);
        
        if (!voucher.isActive()) {
            return VoucherValidationResponse.builder()
                    .valid(false)
                    .message("Voucher is not active")
                    .voucher(voucherMapper.toResponse(voucher))
                    .build();
        }
        
        if (!voucher.isApplicableToHotel(request.getHotelId())) {
            return VoucherValidationResponse.builder()
                    .valid(false)
                    .message("Voucher is not applicable to this hotel")
                    .voucher(voucherMapper.toResponse(voucher))
                    .build();
        }
        
        if (voucher.getMinBookingValue() != null && 
            request.getBookingAmount().compareTo(voucher.getMinBookingValue()) < 0) {
            return VoucherValidationResponse.builder()
                    .valid(false)
                    .message("Minimum booking value requirement not met")
                    .voucher(voucherMapper.toResponse(voucher))
                    .build();
        }
        
        BigDecimal discountAmount = calculateDiscount(voucher.getId(), request.getBookingAmount());
        BigDecimal finalAmount = request.getBookingAmount().subtract(discountAmount);
        
        return VoucherValidationResponse.builder()
                .valid(true)
                .message("Voucher is valid")
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .voucher(voucherMapper.toResponse(voucher))
                .build();
    }
    
    @Override
    public List<VoucherResponse> getAvailableVouchersForHotel(UUID hotelId) {
        log.info("Getting available vouchers for hotel: {}", hotelId);
        
        LocalDateTime now = LocalDateTime.now();
        
        // Get admin global vouchers (highest priority)
        List<Voucher> adminGlobalVouchers = voucherRepository.findActiveAdminGlobalVouchers(now);
        
        // Get specific vouchers for this hotel (both admin and host)
        List<Voucher> specificVouchers = voucherRepository.findActiveSpecificVouchersForHotel(hotelId, now);
        
        // Combine and maintain priority order: Admin Global > Host Specific > Admin Specific
        List<Voucher> allVouchers = new ArrayList<>();
        
        // Add admin global vouchers first
        allVouchers.addAll(adminGlobalVouchers);
        
        // Add specific vouchers, but group by host vs admin
        List<Voucher> hostSpecificVouchers = specificVouchers.stream()
                .filter(v -> {
                    // Check if this voucher belongs to the hotel owner (host)
                    try {
                        Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
                        return hotel != null && v.getCreatedBy().equals(hotel.getCreatedBy());
                    } catch (Exception e) {
                        return false;
                    }
                })
                .toList();
        
        List<Voucher> adminSpecificVouchers = specificVouchers.stream()
                .filter(v -> !hostSpecificVouchers.contains(v))
                .toList();
        
        // Add in priority order
        allVouchers.addAll(hostSpecificVouchers);
        allVouchers.addAll(adminSpecificVouchers);
        
        return voucherMapper.toResponseListWithoutHotels(allVouchers);
    }
    
    @Override
    public VoucherResponse getVoucherByCode(String code) {
        log.info("Getting voucher by code: {}", code);
        
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        return voucherMapper.toResponse(voucher);
    }
    
    @Override
    @Transactional
    public VoucherResponse applyVoucher(String voucherCode, UUID userId, UUID bookingId, BigDecimal originalAmount, UUID hotelId) {
        log.info("Applying voucher {} for user {} on booking {}", voucherCode, userId, bookingId);
        
        // Use priority-based lookup: Admin ALL_HOTELS > Host SPECIFIC_HOTELS > Admin SPECIFIC_HOTELS
        List<Voucher> vouchers = voucherRepository.findByCodeWithPriority(voucherCode, hotelId);
        
        if (vouchers.isEmpty()) {
            throw new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND);
        }
        
        // Get the highest priority voucher (first one due to ORDER BY)
        Voucher voucher = vouchers.get(0);
        
        if (!voucher.isActive()) {
            throw new AppRuntimeException(ErrorResponse.VOUCHER_NOT_ACTIVE);
        }
        
        if (!voucher.isApplicableToHotel(hotelId)) {
            throw new AppRuntimeException(ErrorResponse.VOUCHER_NOT_APPLICABLE_TO_HOTEL);
        }
        
        if (voucherUsageRepository.existsByVoucherIdAndUserId(voucher.getId(), userId)) {
            throw new AppRuntimeException(ErrorResponse.VOUCHER_ALREADY_USED_BY_USER);
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        BigDecimal discountAmount = calculateDiscount(voucher.getId(), originalAmount);
        
        VoucherUsage voucherUsage = VoucherUsage.builder()
                .voucher(voucher)
                .user(user)
                .booking(booking)
                .discountAmount(discountAmount)
                .build();
        
        voucherUsageRepository.save(voucherUsage);
        
        voucher.setUsageCount(voucher.getUsageCount() + 1);
        
        if (voucher.getUsageLimit() != null && voucher.getUsageCount() >= voucher.getUsageLimit()) {
            voucher.setStatus(VoucherStatus.USED_UP);
        }
        
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return voucherMapper.toResponse(updatedVoucher);
    }
    
    @Override
    @Transactional
    public void removeVoucherUsage(UUID bookingId) {
        log.info("Removing voucher usage for booking: {}", bookingId);
        
        // Find voucher usage by booking ID
        Optional<VoucherUsage> voucherUsageOpt = voucherUsageRepository.findByBookingId(bookingId);
        
        if (voucherUsageOpt.isPresent()) {
            VoucherUsage voucherUsage = voucherUsageOpt.get();
            Voucher voucher = voucherUsage.getVoucher();
            
            // Decrease usage count
            voucher.setUsageCount(Math.max(0, voucher.getUsageCount() - 1));
            
            // Reactivate voucher if it was marked as used up
            if (voucher.getStatus() == VoucherStatus.USED_UP && 
                (voucher.getUsageLimit() == null || voucher.getUsageCount() < voucher.getUsageLimit())) {
                voucher.setStatus(VoucherStatus.ACTIVE);
            }
            
            // Save voucher and delete usage record
            voucherRepository.save(voucher);
            voucherUsageRepository.delete(voucherUsage);
            
            log.info("Voucher usage removed for booking: {}, voucher: {}", bookingId, voucher.getCode());
        } else {
            log.info("No voucher usage found for booking: {}", bookingId);
        }
    }
    
    @Override
    @Transactional
    public void deleteVoucherUsageByBookingId(UUID bookingId) {
        log.info("Deleting voucher usage records for booking: {}", bookingId);
        
        // Delete usage records directly without updating voucher counts
        // This is for hard delete scenarios like admin delete booking
        voucherUsageRepository.deleteByBookingId(bookingId);
        
        log.info("Voucher usage records deleted for booking: {}", bookingId);
    }
    
    @Override
    public BigDecimal calculateDiscount(UUID voucherId, BigDecimal bookingAmount) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal discountAmount = bookingAmount
                    .multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            
            if (voucher.getMaxDiscount() != null && discountAmount.compareTo(voucher.getMaxDiscount()) > 0) {
                discountAmount = voucher.getMaxDiscount();
            }
            
            return discountAmount;
        } else {
            return voucher.getDiscountValue().min(bookingAmount);
        }
    }
    
    @Override
    public boolean isVoucherCodeExists(String code) {
        return voucherRepository.existsByCode(code);
    }
    
    @Override
    public void updateVoucherStatuses() {
        log.info("Running scheduled voucher status update");
        
        LocalDateTime now = LocalDateTime.now();
        List<Voucher> activeVouchers = voucherRepository.findActiveVouchers(now);
        int expiredCount = 0;
        
        for (Voucher voucher : activeVouchers) {
            if (now.isAfter(voucher.getEndDate())) {
                voucher.setStatus(VoucherStatus.EXPIRED);
                voucherRepository.save(voucher);
                expiredCount++;
            } else if (voucher.getUsageLimit() != null && voucher.getUsageCount() >= voucher.getUsageLimit()) {
                voucher.setStatus(VoucherStatus.USED_UP);
                voucherRepository.save(voucher);
            }
        }
        
        log.info("Voucher status update completed. Expired: {}", expiredCount);
    }
    
    @Override
    public List<VoucherResponse> getExpiringVouchers() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in24Hours = now.plusHours(24);
        
        List<Voucher> expiringVouchers = voucherRepository.findExpiringVouchers(now, in24Hours);
        return voucherMapper.toResponseListWithoutHotels(expiringVouchers);
    }
    
    // ===== HOST OPERATIONS IMPLEMENTATION =====
    
    @Override
    @IsHost
    public DataResponse<VoucherResponse> getHostVouchers(UUID hostId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting vouchers for host: {} with pagination: page={}, size={}, sort={}", hostId, pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Voucher> voucherPage = voucherRepository.findByCreatedBy(hostId, pageable);
        
        List<VoucherResponse> voucherResponses = voucherMapper.toResponseListWithoutHotels(voucherPage.getContent());
        
        return DataResponseUtils.convertPageInfo(voucherPage, voucherResponses);
    }
    
    @Override
    @IsHost
    public DataResponse<VoucherResponse> getHostVouchersByStatus(UUID hostId, VoucherStatus status, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting vouchers for host: {} by status: {} with pagination: page={}, size={}, sort={}", hostId, status, pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Voucher> voucherPage = voucherRepository.findByCreatedByAndStatus(hostId, status, pageable);
        
        List<VoucherResponse> voucherResponses = voucherMapper.toResponseListWithoutHotels(voucherPage.getContent());
        
        return DataResponseUtils.convertPageInfo(voucherPage, voucherResponses);
    }
    
    @Override
    @IsHost
    public VoucherResponse getHostVoucherById(UUID hostId, UUID voucherId) {
        log.info("Getting voucher {} for host: {}", voucherId, hostId);
        
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        // Verify the voucher belongs to the host
        if (!voucher.getCreatedBy().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED);
        }
        
        return voucherMapper.toResponse(voucher);
    }
    
    @Override
    @IsHost
    @Transactional
    public VoucherResponse createHostVoucher(UUID hostId, VoucherCreateRequest request) {
        log.info("Creating new voucher for host: {} with code: {}", hostId, request.getCode());
        
        // Check if voucher code already exists globally (to avoid conflict with admin vouchers)
        if (voucherRepository.existsByCode(request.getCode())) {
            throw new AppRuntimeException(ErrorResponse.VOUCHER_CODE_ALREADY_EXISTS);
        }
        
        // Additional validation: Host cannot create ALL_HOTELS vouchers
        if (request.getApplicableScope() == ApplicableScope.ALL_HOTELS) {
            throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED); // Only admin can create ALL_HOTELS vouchers
        }
        
        // Verify that selected hotels belong to the host
        if (request.getApplicableScope() == ApplicableScope.SPECIFIC_HOTELS && request.getHotelIds() != null) {
            List<Hotel> hotels = hotelRepository.findAllById(request.getHotelIds());
            if (hotels.size() != request.getHotelIds().size()) {
                throw new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND);
            }
            
            // Verify all hotels belong to the host
            boolean allHotelsOwnedByHost = hotels.stream().allMatch(hotel -> hotel.getCreatedBy().equals(hostId));
            if (!allHotelsOwnedByHost) {
                throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED);
            }
        } else {
            // Host must specify hotels - cannot create voucher without hotel selection
            throw new AppRuntimeException(ErrorResponse.HOTEL_SELECTION_REQUIRED);
        }
        
        // Convert request to entity
        Voucher voucher = voucherMapper.toEntity(request);
        voucher.setCreatedBy(hostId);
        voucher.setUpdatedBy(hostId);
        
        // Handle hotel assignments for specific scope
        List<Hotel> hotels = hotelRepository.findAllById(request.getHotelIds());
        voucher.setApplicableHotels(hotels);
        
        Voucher savedVoucher = voucherRepository.save(voucher);
        log.info("Successfully created voucher with ID: {} for host: {}", savedVoucher.getId(), hostId);
        
        return voucherMapper.toResponse(savedVoucher);
    }
    
    @Override
    @IsHost
    @Transactional
    public VoucherResponse updateHostVoucher(UUID hostId, UUID voucherId, VoucherUpdateRequest request) {
        log.info("Updating voucher {} for host: {}", voucherId, hostId);
        
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        // Verify the voucher belongs to the host
        if (!voucher.getCreatedBy().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED);
        }
        
        // Additional validation: Host cannot update to ALL_HOTELS scope
        if (request.getApplicableScope() != null && request.getApplicableScope() == ApplicableScope.ALL_HOTELS) {
            throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED); // Only admin can create/update ALL_HOTELS vouchers
        }
        
        // Verify that selected hotels belong to the host
        if (request.getApplicableScope() != null && 
            request.getApplicableScope() == ApplicableScope.SPECIFIC_HOTELS && 
            request.getHotelIds() != null) {
            List<Hotel> hotels = hotelRepository.findAllById(request.getHotelIds());
            
            // Verify all hotels belong to the host
            boolean allHotelsOwnedByHost = hotels.stream().allMatch(hotel -> hotel.getCreatedBy().equals(hostId));
            if (!allHotelsOwnedByHost) {
                throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED);
            }
        }
        
        voucherMapper.updateEntity(voucher, request);
        voucher.setUpdatedBy(hostId);
        
        // Handle hotel assignments update - Host vouchers must always have specific hotels
        if (request.getApplicableScope() != null) {
            if (request.getApplicableScope() == ApplicableScope.SPECIFIC_HOTELS && request.getHotelIds() != null) {
                List<Hotel> hotels = hotelRepository.findAllById(request.getHotelIds());
                voucher.setApplicableHotels(hotels);
            }
            // Note: We don't handle ALL_HOTELS case since host cannot set that scope
        }
        
        Voucher updatedVoucher = voucherRepository.save(voucher);
        return voucherMapper.toResponse(updatedVoucher);
    }
    
    @Override
    @IsHost
    @Transactional
    public void deleteHostVoucher(UUID hostId, UUID voucherId) {
        log.info("Deleting voucher {} for host: {}", voucherId, hostId);
        
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        // Verify the voucher belongs to the host
        if (!voucher.getCreatedBy().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED);
        }
        
        // Check if voucher has been used - throw exception to inform host
        long usageCount = voucherUsageRepository.countByVoucherId(voucherId);
        if (usageCount > 0) {
            log.warn("Attempted to delete voucher {} with {} usage records by host {}", voucher.getCode(), usageCount, hostId);
            throw new AppRuntimeException(ErrorResponse.VOUCHER_HAS_USAGE_RECORDS);
        } else {
            voucherRepository.delete(voucher);
            log.info("Voucher {} deleted successfully by host {}", voucher.getCode(), hostId);
        }
    }
    
    @Override
    @IsHost
    @Transactional
    public VoucherResponse toggleHostVoucherStatus(UUID hostId, UUID voucherId) {
        log.info("Toggling status for voucher {} by host: {}", voucherId, hostId);
        
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));
        
        // Verify the voucher belongs to the host
        if (!voucher.getCreatedBy().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED);
        }
        
        if (voucher.getStatus() == VoucherStatus.ACTIVE) {
            voucher.setStatus(VoucherStatus.INACTIVE);
        } else if (voucher.getStatus() == VoucherStatus.INACTIVE) {
            voucher.setStatus(VoucherStatus.ACTIVE);
        }
        
        voucher.setUpdatedBy(hostId);
        Voucher updatedVoucher = voucherRepository.save(voucher);
        
        return voucherMapper.toResponse(updatedVoucher);
    }
    
    @Override
    @IsHost
    public DataResponse<VoucherResponse> searchHostVouchers(UUID hostId, String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching vouchers with keyword: {} for host: {}", keyword, hostId);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Voucher> voucherPage = voucherRepository.searchVouchersByHost(hostId, keyword, pageable);
        
        List<VoucherResponse> voucherResponses = voucherMapper.toResponseListWithoutHotels(voucherPage.getContent());
        
        return DataResponseUtils.convertPageInfo(voucherPage, voucherResponses);
    }
    
    @Override
    @IsHost
    public DataResponse<VoucherResponse> searchHostVouchersByHotel(UUID hostId, UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching vouchers for host: {} and hotel: {}", hostId, hotelId);
        
        // Verify the hotel belongs to the host
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        if (!hotel.getCreatedBy().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.ACCESS_DENIED);
        }
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Voucher> voucherPage = voucherRepository.findVouchersByHostAndHotel(hostId, hotelId, pageable);
        
        List<VoucherResponse> voucherResponses = voucherMapper.toResponseListWithoutHotels(voucherPage.getContent());
        
        return DataResponseUtils.convertPageInfo(voucherPage, voucherResponses);
    }
    
    @Override
    @IsHost
    public Long getHostVouchersCount(UUID hostId) {
        return voucherRepository.countByCreatedBy(hostId);
    }
    
    @Override
    @IsHost
    public Long getHostActiveVouchersCount(UUID hostId) {
        return voucherRepository.countByCreatedByAndStatus(hostId, VoucherStatus.ACTIVE);
    }
    
    @Override
    @IsHost
    public Long getHostExpiredVouchersCount(UUID hostId) {
        return voucherRepository.countByCreatedByAndStatus(hostId, VoucherStatus.EXPIRED);
    }
    
    @Override
    @IsHost
    public Long getHostUsedUpVouchersCount(UUID hostId) {
        return voucherRepository.countByCreatedByAndStatus(hostId, VoucherStatus.USED_UP);
    }
} 