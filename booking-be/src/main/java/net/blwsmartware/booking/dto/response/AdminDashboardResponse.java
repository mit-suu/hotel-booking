package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminDashboardResponse {
    
    // Hotel statistics
    Long totalHotels;
    Long activeHotels;
    Long inactiveHotels;
    Long featuredHotels;
    
    // Room type statistics
    Long totalRoomTypes;
    Long activeRoomTypes;
    Long inactiveRoomTypes;
    
    // Review statistics
    Long totalReviews;
    Long approvedReviews;
    Long pendingReviews;
    Long verifiedReviews;
    
    // User statistics
    Long totalUsers;
    
    // Nested classes for specific statistics
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class HotelStats {
        Long totalHotels;
        Long activeHotels;
        Long inactiveHotels;
        Long featuredHotels;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RoomTypeStats {
        Long totalRoomTypes;
        Long activeRoomTypes;
        Long inactiveRoomTypes;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ReviewStats {
        Long totalReviews;
        Long approvedReviews;
        Long pendingReviews;
        Long verifiedReviews;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UserStats {
        Long totalUsers;
        Long activeUsers;
        Long inactiveUsers;
    }
} 