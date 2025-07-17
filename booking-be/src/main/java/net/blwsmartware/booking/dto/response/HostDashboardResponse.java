package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HostDashboardResponse {
    
    // Basic hotel statistics
    Long totalHotels;
    Long activeHotels;
    Long totalRoomTypes;
    
    // Booking statistics
    Long totalBookings;
    Long pendingBookings;
    Long confirmedBookings;
    Long cancelledBookings;
    Long completedBookings;
    
    // Revenue statistics
    BigDecimal monthlyRevenue;
    BigDecimal totalRevenue;
    BigDecimal averageBookingValue;
    BigDecimal totalCommission;
    
    // Performance metrics
    Double averageRating;
    Double occupancyRate;
    Long totalReviews;
    
    // Additional analytics
    List<RecentBooking> recentBookings;
    List<MonthlyData> monthlyRevenueData;
    List<MonthlyData> monthlyBookingData;
    List<HotelPerformance> topPerformingHotels;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RecentBooking {
        String id;
        String guestName;
        String hotelName;
        String roomTypeName;
        LocalDateTime checkInDate;
        LocalDateTime checkOutDate;
        BigDecimal totalAmount;
        String status;
        String paymentStatus;
        LocalDateTime createdAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MonthlyData {
        String month;
        BigDecimal revenue;
        Long bookings;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class HotelPerformance {
        String id;
        String name;
        String location;
        Long bookings;
        BigDecimal revenue;
        Double averageRating;
        Double occupancyRate;
    }
} 