package net.blwsmartware.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatsResponse {
    private BigDecimal totalRevenue;           // Tổng doanh thu từ tất cả bookings đã thanh toán
    private BigDecimal totalCommissionRevenue; // Tổng doanh thu hoa hồng
    private Long totalHotels;                  // Tổng số khách sạn
    private Long totalBookings;                // Tổng số bookings
    private BigDecimal averageCommissionRate;  // Tỷ lệ hoa hồng trung bình
    private BigDecimal monthlyGrowth;          // % tăng trưởng so với tháng trước
} 