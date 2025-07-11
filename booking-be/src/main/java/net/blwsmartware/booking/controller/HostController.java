package net.blwsmartware.booking.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.HostDashboardResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.service.AnalyticsService;
import net.blwsmartware.booking.service.BookingService;
import net.blwsmartware.booking.service.HotelService;
import net.blwsmartware.booking.service.ReviewService;
import net.blwsmartware.booking.service.RoomTypeService;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/host")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HostController {
    
    HotelService hotelService;
    RoomTypeService roomTypeService;
    BookingService bookingService;
    ReviewService reviewService;
    AnalyticsService analyticsService;
    
    @GetMapping("/dashboard")
    @IsHost
    public ResponseEntity<MessageResponse<HostDashboardResponse>> getDashboard() {
        String currentHostId = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID hostId = UUID.fromString(currentHostId);
        
        log.info("Getting host dashboard statistics for host: {}", hostId);
        
        try {
            // Basic hotel statistics
            Long totalHotels = hotelService.getMyHotelsCount();
            Long activeHotels = hotelService.getMyActiveHotelsCount();
            Long totalRoomTypes = roomTypeService.getMyRoomTypesCount();
            
            // Booking statistics
            Long totalBookings = bookingService.getHostBookingsCount();
            Long pendingBookings = bookingService.getHostBookingsCountByStatus(
                net.blwsmartware.booking.enums.BookingStatus.PENDING);
            Long confirmedBookings = bookingService.getHostBookingsCountByStatus(
                net.blwsmartware.booking.enums.BookingStatus.CONFIRMED);
            Long cancelledBookings = bookingService.getHostBookingsCountByStatus(
                net.blwsmartware.booking.enums.BookingStatus.CANCELLED);
            Long completedBookings = bookingService.getHostBookingsCountByStatus(
                net.blwsmartware.booking.enums.BookingStatus.COMPLETED);
            
            // Revenue statistics
            BigDecimal totalRevenue = bookingService.getHostTotalRevenue();
            BigDecimal monthlyRevenue = bookingService.getHostMonthlyRevenue();
            BigDecimal totalCommission = bookingService.getHostTotalCommission();
            BigDecimal averageBookingValue = totalBookings > 0 ? 
                totalRevenue.divide(BigDecimal.valueOf(totalBookings), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
            
            // Performance metrics
            Double averageRating = reviewService.getHostAverageRating(hostId);
            Double occupancyRate = bookingService.getHostOccupancyRate();
            Long totalReviews = reviewService.getHostReviewsCount(hostId);
            
            // Recent bookings
            List<HostDashboardResponse.RecentBooking> recentBookings = 
                bookingService.getHostRecentBookings(hostId, 5);
            
            // Monthly data for charts
            List<HostDashboardResponse.MonthlyData> monthlyRevenueData = 
                bookingService.getHostMonthlyRevenueData(hostId, 12);
            List<HostDashboardResponse.MonthlyData> monthlyBookingData = 
                bookingService.getHostMonthlyBookingData(hostId, 12);
            
            // Top performing hotels
            List<HostDashboardResponse.HotelPerformance> topPerformingHotels = 
                hotelService.getHostTopPerformingHotels(hostId, 5);
            
            HostDashboardResponse dashboardResponse = HostDashboardResponse.builder()
                    .totalHotels(totalHotels)
                    .activeHotels(activeHotels)
                    .totalRoomTypes(totalRoomTypes)
                    .totalBookings(totalBookings)
                    .pendingBookings(pendingBookings)
                    .confirmedBookings(confirmedBookings)
                    .cancelledBookings(cancelledBookings)
                    .completedBookings(completedBookings)
                    .monthlyRevenue(monthlyRevenue)
                    .totalRevenue(totalRevenue)
                    .averageBookingValue(averageBookingValue)
                    .totalCommission(totalCommission)
                    .averageRating(averageRating != null ? averageRating : 0.0)
                    .occupancyRate(occupancyRate != null ? occupancyRate : 0.0)
                    .totalReviews(totalReviews)
                    .recentBookings(recentBookings)
                    .monthlyRevenueData(monthlyRevenueData)
                    .monthlyBookingData(monthlyBookingData)
                    .topPerformingHotels(topPerformingHotels)
                    .build();
            
            log.info("Host dashboard statistics collected successfully - Hotels: {}, Bookings: {}, Revenue: {}", 
                    totalHotels, totalBookings, totalRevenue);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(MessageResponse.<HostDashboardResponse>builder()
                            .message("Host dashboard statistics retrieved successfully")
                            .result(dashboardResponse)
                            .build());
            
        } catch (Exception e) {
            log.error("Error retrieving host dashboard statistics for host: {}", hostId, e);
            throw e;
        }
    }
    
    @GetMapping("/analytics")
    @IsHost
    public ResponseEntity<MessageResponse<HostDashboardResponse>> getAnalytics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        String currentHostId = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID hostId = UUID.fromString(currentHostId);
        
        log.info("Getting host analytics from {} to {} for host: {}", startDate, endDate, hostId);
        
        try {
            // Set default date range if not provided
            if (startDate == null) {
                startDate = LocalDate.now().minusDays(30);
            }
            if (endDate == null) {
                endDate = LocalDate.now();
            }
            
            // Get analytics data for the specified date range
            BigDecimal totalRevenue = bookingService.getHostRevenueByDateRange(hostId, startDate, endDate);
            Long totalBookings = bookingService.getHostBookingsCountByDateRange(hostId, startDate, endDate);
            BigDecimal totalCommission = bookingService.getHostCommissionByDateRange(hostId, startDate, endDate);
            BigDecimal averageBookingValue = totalBookings > 0 ? 
                totalRevenue.divide(BigDecimal.valueOf(totalBookings), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
            
            // Monthly breakdown for the date range
            List<HostDashboardResponse.MonthlyData> monthlyData = 
                bookingService.getHostMonthlyAnalytics(hostId, startDate, endDate);
            
            HostDashboardResponse analyticsResponse = HostDashboardResponse.builder()
                    .totalRevenue(totalRevenue)
                    .totalBookings(totalBookings)
                    .averageBookingValue(averageBookingValue)
                    .totalCommission(totalCommission)
                    .monthlyRevenueData(monthlyData)
                    .monthlyBookingData(monthlyData)
                    .build();
            
            log.info("Host analytics data retrieved successfully for date range {} to {}", startDate, endDate);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(MessageResponse.<HostDashboardResponse>builder()
                            .message("Host analytics data retrieved successfully")
                            .result(analyticsResponse)
                            .build());
                            
        } catch (Exception e) {
            log.error("Error retrieving host analytics data for host: {}", hostId, e);
            throw e;
        }
    }
    
    @GetMapping("/stats/revenue")
    @IsHost
    public ResponseEntity<MessageResponse<BigDecimal>> getTotalRevenue() {
        String currentHostId = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID hostId = UUID.fromString(currentHostId);
        
        BigDecimal totalRevenue = bookingService.getHostTotalRevenue();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BigDecimal>builder()
                        .message("Host total revenue retrieved successfully")
                        .result(totalRevenue)
                        .build());
    }
    
    @GetMapping("/stats/monthly-revenue")
    @IsHost
    public ResponseEntity<MessageResponse<BigDecimal>> getMonthlyRevenue() {
        String currentHostId = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID hostId = UUID.fromString(currentHostId);
        
        BigDecimal monthlyRevenue = bookingService.getHostMonthlyRevenue();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<BigDecimal>builder()
                        .message("Host monthly revenue retrieved successfully")
                        .result(monthlyRevenue)
                        .build());
    }
    
    @GetMapping("/stats/occupancy")
    @IsHost
    public ResponseEntity<MessageResponse<Double>> getOccupancyRate() {
        String currentHostId = SecurityContextHolder.getContext().getAuthentication().getName();
        UUID hostId = UUID.fromString(currentHostId);
        
        Double occupancyRate = bookingService.getHostOccupancyRate();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Double>builder()
                        .message("Host occupancy rate retrieved successfully")
                        .result(occupancyRate != null ? occupancyRate : 0.0)
                        .build());
    }
} 