package net.blwsmartware.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    
    // Advanced analytics stats
    private BigDecimal totalRevenue;
    private Long totalBookings;
    private BigDecimal averageBookingValue;
    
    // Monthly chart data
    private List<MonthlyData> monthlyRevenue;
    private List<MonthlyData> monthlyBookings;
    private List<MonthlyData> monthlyNewUsers;
    
    // Top performers
    private List<TopHotelData> topHotels;
    private List<TopLocationData> topLocations;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private BigDecimal value;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopHotelData {
        private String id;
        private String name;
        private String location;
        private Long bookings;
        private BigDecimal revenue;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopLocationData {
        private String name;
        private Long bookings;
        private BigDecimal revenue;
    }
} 