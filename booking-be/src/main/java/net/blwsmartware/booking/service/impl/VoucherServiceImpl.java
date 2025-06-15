package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.VoucherCreateRequest;
import net.blwsmartware.booking.dto.request.VoucherUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.VoucherResponse;
import net.blwsmartware.booking.entity.*;
import net.blwsmartware.booking.enums.*;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.mapper.VoucherMapper;
import net.blwsmartware.booking.repository.*;
import net.blwsmartware.booking.service.VoucherService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.validator.IsAdmin;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    VoucherRepository voucherRepository;
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
    public BigDecimal getTotalDiscountAmount() {
        return null;
    }

    @Override
    public Long getTotalUsageCount() {
        return 0L;
    }


    @Override
    public List<VoucherResponse> getAvailableVouchersForHotel(UUID hotelId) {
        log.info("Getting available vouchers for hotel: {}", hotelId);

        List<Voucher> vouchers = voucherRepository.findActiveVouchersApplicableToHotel(hotelId, LocalDateTime.now());
        return voucherMapper.toResponseListWithoutHotels(vouchers);
    }

    @Override
    public VoucherResponse getVoucherByCode(String code) {
        log.info("Getting voucher by code: {}", code);

        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.VOUCHER_NOT_FOUND));

        return voucherMapper.toResponse(voucher);
    }

    @Override
    public VoucherResponse applyVoucher(String voucherCode, UUID userId, UUID bookingId, BigDecimal originalAmount, UUID hotelId) {
        return null;
    }

    @Override
    public void removeVoucherUsage(UUID bookingId) {

    }

    @Override
    public void deleteVoucherUsageByBookingId(UUID bookingId) {

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
}