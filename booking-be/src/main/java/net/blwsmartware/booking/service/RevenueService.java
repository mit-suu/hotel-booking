package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.response.RevenuePageResponse;
import net.blwsmartware.booking.dto.response.RevenueStatsResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public interface RevenueService {
    
    /**
     * Cập nhật revenue cho hotel khi booking được thanh toán thành công
     */
    void updateHotelRevenue(UUID bookingId);
    
    /**
     * Trừ commission khi booking bị cancel hoặc refund
     */
    void revertHotelRevenue(UUID bookingId);
    
    /**
     * Tính toán lại tất cả revenue cho hotel (dùng khi có thay đổi commission rate)
     */
    void recalculateHotelRevenue(UUID hotelId);
    
    /**
     * Lấy tổng quan revenue stats
     */
    RevenueStatsResponse getRevenueStats(LocalDate startDate, LocalDate endDate);
    
    /**
     * Lấy revenue data với phân trang
     */
    RevenuePageResponse getRevenueData(
            String search, 
            String status, 
            String dateRange, 
            LocalDate startDate, 
            LocalDate endDate,
            int page, 
            int size, 
            String sort, 
            String direction
    );
    
    /**
     * Lấy doanh thu của hotel theo khoảng thời gian
     */
    BigDecimal getHotelRevenue(UUID hotelId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Lấy doanh thu hoa hồng của hotel theo khoảng thời gian
     */
    BigDecimal getHotelCommissionEarned(UUID hotelId, LocalDate startDate, LocalDate endDate);
} 