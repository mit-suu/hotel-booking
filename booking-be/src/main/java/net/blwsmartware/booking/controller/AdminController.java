package net.blwsmartware.booking.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.response.*;
import net.blwsmartware.booking.service.*;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.exception.AppRuntimeException;
import java.util.Optional;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

import net.blwsmartware.booking.service.WalletService;
import net.blwsmartware.booking.service.BookingService;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.repository.HotelRepository;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminController {
    
    HotelService hotelService;
    RoomTypeService roomTypeService;
    ReviewService reviewService;
    UserService userService;
    AnalyticsService analyticsService;
    WalletService walletService;
    BookingService bookingService;
    BookingRepository bookingRepository;
    UserRepository userRepository;
    HotelRepository hotelRepository;
    
    @GetMapping("/dashboard")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminDashboardResponse>> getDashboard() {
        log.info("Getting admin dashboard statistics");
        
        try {
            // Collect all statistics
            Long totalHotels = hotelService.getTotalHotelsCount();
            Long activeHotels = hotelService.getActiveHotelsCount();
            Long inactiveHotels = totalHotels - activeHotels;
            Long featuredHotels = hotelService.getFeaturedHotelsCount();
            
            Long totalRoomTypes = roomTypeService.getTotalRoomTypesCount();
            
            Long totalReviews = reviewService.getTotalReviewsCount();
            // For now, we'll set these as 0 since we don't have approval/verification logic implemented
            Long approvedReviews = 0L;
            Long pendingReviews = 0L;
            Long verifiedReviews = 0L;
            
            Long totalUsers = userService.getTotalUsersCount();
            
            AdminDashboardResponse dashboardResponse = AdminDashboardResponse.builder()
                    .totalHotels(totalHotels)
                    .activeHotels(activeHotels)
                    .inactiveHotels(inactiveHotels)
                    .featuredHotels(featuredHotels)
                    .totalRoomTypes(totalRoomTypes)
                    .totalReviews(totalReviews)
                    .approvedReviews(approvedReviews)
                    .pendingReviews(pendingReviews)
                    .verifiedReviews(verifiedReviews)
                    .totalUsers(totalUsers)
                    .build();
            
            log.info("Dashboard statistics collected successfully - Hotels: {}, Users: {}, Reviews: {}, RoomTypes: {}", 
                    totalHotels, totalUsers, totalReviews, totalRoomTypes);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(MessageResponse.<AdminDashboardResponse>builder()
                            .message("Dashboard statistics retrieved successfully")
                            .result(dashboardResponse)
                            .build());
            
        } catch (Exception e) {
            log.error("Error retrieving dashboard statistics", e);
            throw e;
        }
    }
    
    @GetMapping("/analytics")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminAnalyticsResponse>> getAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Getting admin analytics from {} to {}", startDate, endDate);
        
        try {
            AdminAnalyticsResponse analyticsResponse = analyticsService.getAdminAnalytics(startDate, endDate);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(MessageResponse.<AdminAnalyticsResponse>builder()
                            .message("Analytics data retrieved successfully")
                            .result(analyticsResponse)
                            .build());
                            
        } catch (Exception e) {
            log.error("Error retrieving analytics data", e);
            throw e;
        }
    }
    
    @GetMapping("/analytics/test-cities")
    public ResponseEntity<MessageResponse<Object>> testTopCities() {
        log.info("Testing top cities by hotel count");
        
        try {
            Pageable pageable = PageRequest.of(0, 10);
            List<Object[]> results = hotelRepository.findTopCitiesByHotelCount(pageable);
            
            List<Map<String, Object>> cityStats = new ArrayList<>();
            for (Object[] result : results) {
                Map<String, Object> cityData = new HashMap<>();
                cityData.put("cityName", result[0]);
                cityData.put("hotelCount", result[1]);
                cityStats.add(cityData);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalCities", cityStats.size());
            response.put("cities", cityStats);
            
            return ResponseEntity.ok()
                    .body(MessageResponse.builder()
                            .message("Top cities by hotel count retrieved successfully")
                            .result(response)
                            .build());
                            
        } catch (Exception e) {
            log.error("Error testing top cities: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MessageResponse.builder()
                            .success(false)
                            .message("Error retrieving top cities: " + e.getMessage())
                            .build());
        }
    }
    
    @GetMapping("/refund-transactions")
    public ResponseEntity<MessageResponse<DataResponse<WalletTransactionResponse>>> getRefundTransactions(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize) {
        
        // Get all refund transactions for admin oversight
        Page<WalletTransactionResponse> refundTransactions = walletService.getAllRefundTransactions(pageNumber, pageSize);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<DataResponse<WalletTransactionResponse>>builder()
                    .message("Refund transactions retrieved successfully")
                    .result(DataResponseUtils.convertPageInfo(refundTransactions, refundTransactions.getContent()))
                    .build()
                );
    }
    
    @GetMapping("/booking-cancellation-stats")
    public ResponseEntity<MessageResponse<Map<String, Object>>> getBookingCancellationStats() {
        
        Map<String, Object> stats = new HashMap<>();
        
        // Get cancellation statistics
        Long totalCancelled = bookingService.getBookingsCountByStatus(BookingStatus.CANCELLED) +
                             bookingService.getBookingsCountByStatus(BookingStatus.CANCELLED_BY_GUEST) +
                             bookingService.getBookingsCountByStatus(BookingStatus.CANCELLED_BY_HOST);
        
        Long cancelledByGuest = bookingService.getBookingsCountByStatus(BookingStatus.CANCELLED_BY_GUEST);
        Long cancelledByHost = bookingService.getBookingsCountByStatus(BookingStatus.CANCELLED_BY_HOST);
        
        // Get refund statistics
        BigDecimal totalRefundAmount = bookingRepository.getTotalRefundAmount();
        Long totalRefundCount = bookingRepository.countBookingsWithRefund();
        
        stats.put("totalCancelled", totalCancelled);
        stats.put("cancelledByGuest", cancelledByGuest);
        stats.put("cancelledByHost", cancelledByHost);
        stats.put("totalRefundAmount", totalRefundAmount);
        stats.put("totalRefundCount", totalRefundCount);
        stats.put("averageRefundAmount", totalRefundCount > 0 ? 
                 totalRefundAmount.divide(BigDecimal.valueOf(totalRefundCount), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Map<String, Object>>builder()
                    .message("Booking cancellation statistics retrieved successfully")
                    .result(stats)
                    .build()
                );
    }
    
    @GetMapping("/withdrawal-requests")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<WalletTransactionResponse>>> getWithdrawalRequests(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "status", required = false) String status) {
        
        log.info("Admin getting withdrawal requests with status: {}", status);
        
        Page<WalletTransactionResponse> withdrawalRequests = walletService.getAllWithdrawalRequests(status, pageNumber, pageSize);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<DataResponse<WalletTransactionResponse>>builder()
                    .message("Withdrawal requests retrieved successfully")
                    .result(DataResponseUtils.convertPageInfo(withdrawalRequests, withdrawalRequests.getContent()))
                    .build()
                );
    }
    
    @GetMapping("/withdrawal-requests/pending")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<WalletTransactionResponse>>> getPendingWithdrawalRequests(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize) {
        
        log.info("Admin getting pending withdrawal requests");
        
        Page<WalletTransactionResponse> pendingRequests = walletService.getPendingWithdrawalRequests(pageNumber, pageSize);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<DataResponse<WalletTransactionResponse>>builder()
                    .message("Pending withdrawal requests retrieved successfully")
                    .result(DataResponseUtils.convertPageInfo(pendingRequests, pendingRequests.getContent()))
                    .build()
                );
    }
    
    @PostMapping("/withdrawal-requests/{transactionId}/approve")
    @IsAdmin
    public ResponseEntity<MessageResponse<WalletTransactionResponse>> approveWithdrawalRequest(
            @PathVariable UUID transactionId,
            @RequestParam(value = "note", required = false) String note) {
        
        log.info("Admin approving withdrawal request: {}", transactionId);
        
        WalletTransactionResponse processedTransaction = walletService.processWithdrawal(transactionId, true, note);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<WalletTransactionResponse>builder()
                    .message("Withdrawal request approved successfully")
                    .result(processedTransaction)
                    .build()
                );
    }
    
    @PostMapping("/withdrawal-requests/{transactionId}/reject")
    @IsAdmin
    public ResponseEntity<MessageResponse<WalletTransactionResponse>> rejectWithdrawalRequest(
            @PathVariable UUID transactionId,
            @RequestParam(value = "note", required = false) String note) {
        
        log.info("Admin rejecting withdrawal request: {}", transactionId);
        
        WalletTransactionResponse processedTransaction = walletService.processWithdrawal(transactionId, false, note);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<WalletTransactionResponse>builder()
                    .message("Withdrawal request rejected successfully")
                    .result(processedTransaction)
                    .build()
                );
    }
    
    // ===== PRIVATE HELPER METHODS =====
    
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return null;
            }
            
            if (authentication.getPrincipal().equals("anonymousUser")) {
                return null;
            }
            
            // Handle JWT Authentication - extract username from 'usn' claim
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                Jwt jwt = jwtAuth.getToken();
                
                // JWT has: subject = UID, usn = username
                String userId = jwt.getSubject();
                String username = jwt.getClaimAsString("usn");
                
                if (username != null) {
                    Optional<User> userOpt = userRepository.findByUsername(username);
                    if (userOpt.isPresent()) {
                        return userOpt.get();
                    }
                } else {
                    // Fallback: try to find by ID if usn claim is missing
                    try {
                        UUID userIdUUID = UUID.fromString(userId);
                        Optional<User> userOpt = userRepository.findById(userIdUUID);
                        if (userOpt.isPresent()) {
                            return userOpt.get();
                        }
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                }
            }
            
            // Fallback for other authentication types - find by username
            String username = authentication.getName();
            return userRepository.findByUsername(username).orElse(null);
            
        } catch (Exception e) {
            log.error("Error getting current user: ", e);
            return null;
        }
    }
    
    private User getCurrentUserRequired() {
        User user = getCurrentUser();
        if (user == null) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHENTICATED);
        }
        return user;
    }
    
    private UUID getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }
} 