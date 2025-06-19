package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.BookingCreateRequest;
import net.blwsmartware.booking.dto.request.BookingUpdateRequest;
import net.blwsmartware.booking.dto.request.CancellationRequest;
import net.blwsmartware.booking.dto.response.BookingResponse;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.service.BookingService;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingController {
    
    BookingService bookingService;
    
    // ===== TEST ENDPOINT =====
    
    @GetMapping("/auth-test")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<String>> testAuthentication() {
        log.info("Testing authentication endpoint called");
        return ResponseEntity.ok()
                .body(MessageResponse.<String>builder()
                        .message("Authentication successful")
                        .result("User is authenticated")
                        .build());
    }
    
    // ===== GUEST OPERATIONS =====
    
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        log.info("Creating booking for authenticated user");
        BookingResponse response = bookingService.createBooking(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Booking created successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<DataResponse<BookingResponse>>> getMyBookings(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<BookingResponse> response = bookingService.getMyBookings(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<BookingResponse>>builder()
                        .message("User bookings retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/my/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<BookingResponse>> getMyBookingById(@PathVariable UUID id) {
        BookingResponse response = bookingService.getMyBookingById(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("User booking retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/my/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<BookingResponse>> updateMyBooking(
            @PathVariable UUID id,
            @Valid @RequestBody BookingUpdateRequest request) {
        BookingResponse response = bookingService.updateMyBooking(id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("User booking updated successfully")
                        .result(response)
                        .build());
    }
    
    @PatchMapping("/my/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<BookingResponse>> cancelMyBooking(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        BookingResponse response = bookingService.cancelMyBooking(id, reason);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("User booking cancelled successfully")
                        .result(response)
                        .build());
    }
    
    // ===== HOST OPERATIONS =====
    
    @GetMapping("/host")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<BookingResponse>>> getHostBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<BookingResponse> response = bookingService.getHostBookings(
                status, paymentStatus, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<BookingResponse>>builder()
                        .message("Host bookings retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<BookingResponse>> getHostBookingById(@PathVariable UUID id) {
        BookingResponse response = bookingService.getHostBookingById(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Host booking retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<BookingResponse>> updateHostBooking(
            @PathVariable UUID id,
            @Valid @RequestBody BookingUpdateRequest request) {
        BookingResponse response = bookingService.updateHostBooking(id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Host booking updated successfully")
                        .result(response)
                        .build());
    }
    
    @PatchMapping("/host/{id}/confirm")
    @IsHost
    public ResponseEntity<MessageResponse<BookingResponse>> confirmBooking(@PathVariable UUID id) {
        BookingResponse response = bookingService.confirmBooking(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Booking confirmed successfully")
                        .result(response)
                        .build());
    }
    
    @PatchMapping("/host/{id}/cancel")
    @IsHost
    public ResponseEntity<MessageResponse<BookingResponse>> cancelBooking(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        BookingResponse response = bookingService.cancelBooking(id, reason);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Booking cancelled successfully")
                        .result(response)
                        .build());
    }
    
    @PatchMapping("/host/{id}/complete")
    @IsHost
    public ResponseEntity<MessageResponse<BookingResponse>> completeBooking(@PathVariable UUID id) {
        BookingResponse response = bookingService.completeBooking(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Booking completed successfully")
                        .result(response)
                        .build());
    }
    
    @PatchMapping("/host/{id}/confirm-payment")
    @IsHost
    public ResponseEntity<MessageResponse<BookingResponse>> confirmPaymentByHost(@PathVariable UUID id) {
        BookingResponse response = bookingService.confirmPayment(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Payment confirmed successfully")
                        .result(response)
                        .build());
    }
    
    @PatchMapping("/host/{id}/process-cancellation")
    @IsHost
    public ResponseEntity<MessageResponse<BookingResponse>> processCancellation(
            @PathVariable UUID id,
            @Valid @RequestBody CancellationRequest request) {
        BookingResponse response = bookingService.processCancellation(id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Cancellation processed successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/hotel/{hotelId}")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<BookingResponse>>> getBookingsByHotel(
            @PathVariable UUID hotelId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<BookingResponse> response = bookingService.getBookingsByHotel(
                hotelId, status, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<BookingResponse>>builder()
                        .message("Hotel bookings retrieved successfully")
                        .result(response)
                        .build());
    }
    
    // ===== ADMIN OPERATIONS =====
    
    @GetMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<BookingResponse> response = bookingService.getAllBookings(
                status, paymentStatus, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<BookingResponse>>builder()
                        .message("All bookings retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<BookingResponse>> getBookingById(@PathVariable UUID id) {
        BookingResponse response = bookingService.getBookingById(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Booking retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<BookingResponse>> updateBooking(
            @PathVariable UUID id,
            @Valid @RequestBody BookingUpdateRequest request) {
        BookingResponse response = bookingService.updateBooking(id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Booking updated successfully")
                        .result(response)
                        .build());
    }
    
    @DeleteMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<Void>> deleteBooking(@PathVariable UUID id) {
        bookingService.deleteBooking(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Void>builder()
                        .message("Booking deleted successfully")
                        .build());
    }
    
    @PatchMapping("/admin/{id}/confirm-payment")
    @IsAdmin
    public ResponseEntity<MessageResponse<BookingResponse>> confirmPaymentByAdmin(@PathVariable UUID id) {
        BookingResponse response = bookingService.confirmPayment(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BookingResponse>builder()
                        .message("Payment confirmed successfully")
                        .result(response)
                        .build());
    }
    
    // ===== SEARCH & FILTER OPERATIONS =====
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOST')")
    public ResponseEntity<MessageResponse<DataResponse<BookingResponse>>> searchBookings(
            @RequestParam String keyword,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<BookingResponse> response = bookingService.searchBookings(keyword, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<BookingResponse>>builder()
                        .message("Bookings search completed successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HOST')")
    public ResponseEntity<MessageResponse<DataResponse<BookingResponse>>> getBookingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        DataResponse<BookingResponse> response = bookingService.getBookingsByDateRange(
                startDate, endDate, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<BookingResponse>>builder()
                        .message("Bookings retrieved successfully")
                        .result(response)
                        .build());
    }
    
    // ===== STATISTICS ENDPOINTS =====
    
    @GetMapping("/admin/stats/total")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getTotalBookingsCount() {
        Long count = bookingService.getTotalBookingsCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Total bookings count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/host/stats/total")
    @IsHost
    public ResponseEntity<MessageResponse<Long>> getHostBookingsCount() {
        Long count = bookingService.getHostBookingsCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Host bookings count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    // ===== UTILITY ENDPOINTS =====
    
    @GetMapping("/check-availability")
    // Keep public for guest users to check availability before booking
    // But should implement rate limiting in production
    public ResponseEntity<MessageResponse<Boolean>> checkRoomAvailability(
            @RequestParam UUID roomTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        
        Boolean isAvailable = bookingService.isRoomAvailable(roomTypeId, checkInDate, checkOutDate);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Boolean>builder()
                        .message("Room availability checked successfully")
                        .result(isAvailable)
                        .build());
    }
} 