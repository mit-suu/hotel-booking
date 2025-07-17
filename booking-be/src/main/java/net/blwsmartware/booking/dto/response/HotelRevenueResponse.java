package net.blwsmartware.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRevenueResponse {
    private UUID id;
    private String hotelName;
    private String ownerName;
    private Long totalBookings;               // Số lượng bookings
    private BigDecimal totalRevenue;          // Tổng doanh thu
    private BigDecimal commissionRate;        // Tỷ lệ hoa hồng (%)
    private BigDecimal commissionAmount;      // Số tiền hoa hồng
    private BigDecimal netRevenue;            // Thu nhập ròng (totalRevenue - commissionAmount)
    private String city;
    private String country;
    private LocalDateTime lastBookingDate;    // Booking gần nhất
    private String status;                    // active/inactive
} 