package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.ApplyVoucherRequest;
import net.blwsmartware.booking.dto.request.VoucherCreateRequest;
import net.blwsmartware.booking.dto.request.VoucherUpdateRequest;
import net.blwsmartware.booking.dto.request.VoucherValidationRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.VoucherResponse;
import net.blwsmartware.booking.dto.response.VoucherValidationResponse;
import net.blwsmartware.booking.enums.VoucherStatus;
import net.blwsmartware.booking.service.VoucherService;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vouchers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VoucherController {
    
    VoucherService voucherService;
    
    // ===== ADMIN ENDPOINTS =====
    
    @GetMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<VoucherResponse>>> getAllVouchers(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<VoucherResponse> response = voucherService.getAllVouchers(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<VoucherResponse>>builder()
                        .message("Vouchers retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/admin/status/{status}")
    @IsAdmin    
    public ResponseEntity<MessageResponse<DataResponse<VoucherResponse>>> getVouchersByStatus(
            @PathVariable VoucherStatus status,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<VoucherResponse> response = voucherService.getVouchersByStatus(status, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<VoucherResponse>>builder()
                        .message("Vouchers by status retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<VoucherResponse>> getVoucherById(@PathVariable UUID id) {
        VoucherResponse response = voucherService.getVoucherById(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Voucher retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PostMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<VoucherResponse>> createVoucher(@Valid @RequestBody VoucherCreateRequest request) {
        VoucherResponse response = voucherService.createVoucher(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Voucher created successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<VoucherResponse>> updateVoucher(
            @PathVariable UUID id,
            @Valid @RequestBody VoucherUpdateRequest request) {
        VoucherResponse response = voucherService.updateVoucher(id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Voucher updated successfully")
                        .result(response)
                        .build());
    }
    
    @DeleteMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<Void>> deleteVoucher(@PathVariable UUID id) {
        voucherService.deleteVoucher(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Void>builder()
                        .message("Voucher deleted successfully")
                        .build());
    }
    
    @PatchMapping("/admin/{id}/toggle-status")
    @IsAdmin
    public ResponseEntity<MessageResponse<VoucherResponse>> toggleVoucherStatus(@PathVariable UUID id) {
        VoucherResponse response = voucherService.toggleVoucherStatus(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Voucher status toggled successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/admin/search")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<VoucherResponse>>> searchVouchers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<VoucherResponse> response = voucherService.searchVouchers(keyword, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<VoucherResponse>>builder()
                        .message("Voucher search completed successfully")
                        .result(response)
                        .build());
    }
    
    // ===== ADMIN STATISTICS ENDPOINTS =====
    
    @GetMapping("/admin/stats/total")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getTotalVouchersCount() {
        Long count = voucherService.getTotalVouchersCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Total vouchers count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/admin/stats/active")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getActiveVouchersCount() {
        Long count = voucherService.getActiveVouchersCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Active vouchers count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/admin/stats/expired")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getExpiredVouchersCount() {
        Long count = voucherService.getExpiredVouchersCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Expired vouchers count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/admin/stats/used-up")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getUsedUpVouchersCount() {
        Long count = voucherService.getUsedUpVouchersCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Used up vouchers count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/admin/stats/discount-amount")
    @IsAdmin
    public ResponseEntity<MessageResponse<BigDecimal>> getTotalDiscountAmount() {
        BigDecimal amount = voucherService.getTotalDiscountAmount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BigDecimal>builder()
                        .message("Total discount amount retrieved successfully")
                        .result(amount)
                        .build());
    }
    
    @GetMapping("/admin/stats/usage-count")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getTotalUsageCount() {
        Long count = voucherService.getTotalUsageCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Total usage count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    // ===== PUBLIC ENDPOINTS =====
    
    @PostMapping("/validate")
    public ResponseEntity<MessageResponse<VoucherValidationResponse>> validateVoucher(
            @Valid @RequestBody VoucherValidationRequest request) {
        VoucherValidationResponse response = voucherService.validateVoucher(request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherValidationResponse>builder()
                        .message("Voucher validation completed")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/hotel/{hotelId}/available")
    public ResponseEntity<MessageResponse<List<VoucherResponse>>> getAvailableVouchersForHotel(@PathVariable UUID hotelId) {
        List<VoucherResponse> response = voucherService.getAvailableVouchersForHotel(hotelId);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<List<VoucherResponse>>builder()
                        .message("Available vouchers for hotel retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<MessageResponse<VoucherResponse>> getVoucherByCode(@PathVariable String code) {
        VoucherResponse response = voucherService.getVoucherByCode(code);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Voucher retrieved by code successfully")
                        .result(response)
                        .build());
    }
    
    // ===== VOUCHER APPLICATION ENDPOINT =====
    
    @PostMapping("/apply")
    public ResponseEntity<MessageResponse<VoucherResponse>> applyVoucherToBooking(
            @Valid @RequestBody ApplyVoucherRequest request) {
        
        // Get current user from security context
        String currentUserId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        VoucherResponse response = voucherService.applyVoucher(
                request.getVoucherCode(), 
                UUID.fromString(currentUserId), 
                request.getBookingId(), 
                request.getOriginalAmount(),
                request.getHotelId());
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Voucher applied successfully")
                        .result(response)
                        .build());
    }
    
    // ===== HOST ENDPOINTS =====
    
    @GetMapping("/host")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<VoucherResponse>>> getHostVouchers(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        // Get current host ID from security context
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        DataResponse<VoucherResponse> response = voucherService.getHostVouchers(
                UUID.fromString(currentHostId), pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<VoucherResponse>>builder()
                        .message("Host vouchers retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/status/{status}")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<VoucherResponse>>> getHostVouchersByStatus(
            @PathVariable VoucherStatus status,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        DataResponse<VoucherResponse> response = voucherService.getHostVouchersByStatus(
                UUID.fromString(currentHostId), status, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<VoucherResponse>>builder()
                        .message("Host vouchers by status retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<VoucherResponse>> getHostVoucherById(@PathVariable UUID id) {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        VoucherResponse response = voucherService.getHostVoucherById(UUID.fromString(currentHostId), id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Host voucher retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PostMapping("/host")
    @IsHost
    public ResponseEntity<MessageResponse<VoucherResponse>> createHostVoucher(@Valid @RequestBody VoucherCreateRequest request) {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        VoucherResponse response = voucherService.createHostVoucher(UUID.fromString(currentHostId), request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Host voucher created successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<VoucherResponse>> updateHostVoucher(
            @PathVariable UUID id,
            @Valid @RequestBody VoucherUpdateRequest request) {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        VoucherResponse response = voucherService.updateHostVoucher(UUID.fromString(currentHostId), id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Host voucher updated successfully")
                        .result(response)
                        .build());
    }
    
    @DeleteMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<Void>> deleteHostVoucher(@PathVariable UUID id) {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        voucherService.deleteHostVoucher(UUID.fromString(currentHostId), id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Void>builder()
                        .message("Host voucher deleted successfully")
                        .build());
    }
    
    @PatchMapping("/host/{id}/toggle-status")
    @IsHost
    public ResponseEntity<MessageResponse<VoucherResponse>> toggleHostVoucherStatus(@PathVariable UUID id) {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        VoucherResponse response = voucherService.toggleHostVoucherStatus(UUID.fromString(currentHostId), id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VoucherResponse>builder()
                        .message("Host voucher status toggled successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/search")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<VoucherResponse>>> searchHostVouchers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        DataResponse<VoucherResponse> response = voucherService.searchHostVouchers(
                UUID.fromString(currentHostId), keyword, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<VoucherResponse>>builder()
                        .message("Host voucher search completed successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/hotel/{hotelId}")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<VoucherResponse>>> getHostVouchersByHotel(
            @PathVariable UUID hotelId,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        DataResponse<VoucherResponse> response = voucherService.searchHostVouchersByHotel(
                UUID.fromString(currentHostId), hotelId, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<VoucherResponse>>builder()
                        .message("Host vouchers for hotel retrieved successfully")
                        .result(response)
                        .build());
    }
    
    // ===== HOST STATISTICS ENDPOINTS =====
    
    @GetMapping("/host/stats/total")
    @IsHost
    public ResponseEntity<MessageResponse<Long>> getHostVouchersCount() {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        Long count = voucherService.getHostVouchersCount(UUID.fromString(currentHostId));
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Host vouchers count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/host/stats/active")
    @IsHost
    public ResponseEntity<MessageResponse<Long>> getHostActiveVouchersCount() {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        Long count = voucherService.getHostActiveVouchersCount(UUID.fromString(currentHostId));
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Host active vouchers count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/host/stats/expired")
    @IsHost
    public ResponseEntity<MessageResponse<Long>> getHostExpiredVouchersCount() {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        Long count = voucherService.getHostExpiredVouchersCount(UUID.fromString(currentHostId));
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Host expired vouchers count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/host/stats/used-up")
    @IsHost
    public ResponseEntity<MessageResponse<Long>> getHostUsedUpVouchersCount() {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        Long count = voucherService.getHostUsedUpVouchersCount(UUID.fromString(currentHostId));
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Host used up vouchers count retrieved successfully")
                        .result(count)
                        .build());
    }
} 