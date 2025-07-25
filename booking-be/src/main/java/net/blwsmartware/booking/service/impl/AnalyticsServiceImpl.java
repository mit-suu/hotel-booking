package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.AdminAnalyticsResponse;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.AnalyticsService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {
    
    BookingRepository bookingRepository;
    HotelRepository hotelRepository;
    UserRepository userRepository;

    @Override
    public AdminAnalyticsResponse getAdminAnalytics(LocalDate startDate, LocalDate endDate) {
        log.info("Getting admin analytics from {} to {}", startDate, endDate);
        
        // Set default date range if not provided (last 12 months)
        if (startDate == null || endDate == null) {
            endDate = LocalDate.now();
            startDate = endDate.minusMonths(12);
        }
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get advanced analytics stats
        BigDecimal totalRevenue = bookingRepository.getTotalRevenueByDateRange(startDateTime, endDateTime);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        Long totalBookings = bookingRepository.countPaidBookingsByDateRange(startDateTime, endDateTime);
        if (totalBookings == null) totalBookings = 0L;
        
        BigDecimal averageBookingValue = BigDecimal.ZERO;
        if (totalBookings > 0) {
            averageBookingValue = totalRevenue.divide(BigDecimal.valueOf(totalBookings), 2, RoundingMode.HALF_UP);
        }
        
        // Get monthly chart data
        List<AdminAnalyticsResponse.MonthlyData> monthlyRevenue = getMonthlyRevenue(startDate, endDate);
        List<AdminAnalyticsResponse.MonthlyData> monthlyBookings = getMonthlyBookings(startDate, endDate);
        List<AdminAnalyticsResponse.MonthlyData> monthlyNewUsers = getMonthlyNewUsers(startDate, endDate);
        
        // Get top performers
        List<AdminAnalyticsResponse.TopHotelData> topHotels = getTopHotels(startDateTime, endDateTime);
        List<AdminAnalyticsResponse.TopLocationData> topLocations = getTopLocations(startDateTime, endDateTime);
        
        return AdminAnalyticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(totalBookings)
                .averageBookingValue(averageBookingValue)
                .monthlyRevenue(monthlyRevenue)
                .monthlyBookings(monthlyBookings)
                .monthlyNewUsers(monthlyNewUsers)
                .topHotels(topHotels)
                .topLocations(topLocations)
                .build();
    }
    
    private List<AdminAnalyticsResponse.MonthlyData> getMonthlyRevenue(LocalDate startDate, LocalDate endDate) {
        List<AdminAnalyticsResponse.MonthlyData> monthlyData = new ArrayList<>();
        
        YearMonth start = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        YearMonth current = start;
        while (!current.isAfter(end) && monthlyData.size() < 12) {
            LocalDateTime monthStart = current.atDay(1).atStartOfDay();
            LocalDateTime monthEnd = current.atEndOfMonth().atTime(23, 59, 59);
            
            BigDecimal revenue = bookingRepository.getTotalRevenueByDateRange(monthStart, monthEnd);
            if (revenue == null) revenue = BigDecimal.ZERO;
            
            monthlyData.add(AdminAnalyticsResponse.MonthlyData.builder()
                    .month("T" + current.getMonthValue())
                    .value(revenue)
                    .build());
            
            current = current.plusMonths(1);
        }
        
        return monthlyData;
    }
    
    private List<AdminAnalyticsResponse.MonthlyData> getMonthlyBookings(LocalDate startDate, LocalDate endDate) {
        List<AdminAnalyticsResponse.MonthlyData> monthlyData = new ArrayList<>();
        
        YearMonth start = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        YearMonth current = start;
        while (!current.isAfter(end) && monthlyData.size() < 12) {
            LocalDateTime monthStart = current.atDay(1).atStartOfDay();
            LocalDateTime monthEnd = current.atEndOfMonth().atTime(23, 59, 59);
            
            Long bookings = bookingRepository.countPaidBookingsByDateRange(monthStart, monthEnd);
            if (bookings == null) bookings = 0L;
            
            monthlyData.add(AdminAnalyticsResponse.MonthlyData.builder()
                    .month("T" + current.getMonthValue())
                    .value(BigDecimal.valueOf(bookings))
                    .build());
            
            current = current.plusMonths(1);
        }
        
        return monthlyData;
    }
    
    private List<AdminAnalyticsResponse.MonthlyData> getMonthlyNewUsers(LocalDate startDate, LocalDate endDate) {
        List<AdminAnalyticsResponse.MonthlyData> monthlyData = new ArrayList<>();
        
        YearMonth start = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        YearMonth current = start;
        while (!current.isAfter(end) && monthlyData.size() < 12) {
            LocalDateTime monthStart = current.atDay(1).atStartOfDay();
            LocalDateTime monthEnd = current.atEndOfMonth().atTime(23, 59, 59);
            
            Long newUsers = userRepository.countByCreateAtBetween(monthStart.toInstant(java.time.ZoneOffset.UTC), monthEnd.toInstant(java.time.ZoneOffset.UTC));
            if (newUsers == null) newUsers = 0L;
            
            monthlyData.add(AdminAnalyticsResponse.MonthlyData.builder()
                    .month("T" + current.getMonthValue())
                    .value(BigDecimal.valueOf(newUsers))
                    .build());
            
            current = current.plusMonths(1);
        }
        
        return monthlyData;
    }
    
    private List<AdminAnalyticsResponse.TopHotelData> getTopHotels(LocalDateTime startDate, LocalDateTime endDate) {
        List<AdminAnalyticsResponse.TopHotelData> topHotels = new ArrayList<>();
        
        try {
            // Get top 5 hotels by revenue
            Pageable pageable = PageRequest.of(0, 5);
            List<Object[]> results = bookingRepository.findTopHotelsByRevenue(startDate, endDate, pageable);
            
            for (Object[] result : results) {
                UUID hotelId = (UUID) result[0];
                String hotelName = (String) result[1];
                String location = (String) result[2];
                BigDecimal revenue = (BigDecimal) result[3];
                Long bookings = (Long) result[4];
                
                topHotels.add(AdminAnalyticsResponse.TopHotelData.builder()
                        .id(hotelId.toString())
                        .name(hotelName)
                        .location(location)
                        .bookings(bookings)
                        .revenue(revenue)
                        .build());
            }
        } catch (Exception e) {
            log.error("Error getting top hotels: ", e);
            // Return empty list if error occurs
        }
        
        return topHotels;
    }
    
    private List<AdminAnalyticsResponse.TopLocationData> getTopLocations(LocalDateTime startDate, LocalDateTime endDate) {
        List<AdminAnalyticsResponse.TopLocationData> topLocations = new ArrayList<>();
        
        try {
            // Get top 5 cities by hotel count (independent of date range since hotels are not time-bound)
            Pageable pageable = PageRequest.of(0, 5);
            List<Object[]> results = hotelRepository.findTopCitiesByHotelCount(pageable);
            
            for (Object[] result : results) {
                String cityName = (String) result[0];
                Long hotelCount = (Long) result[1];
                
                // Optionally get booking stats for this city within the date range
                // This provides additional context while the primary metric is hotel count
                // You can remove these lines if you only want hotel count
                // TODO: Add city-based booking query if needed for additional stats
                
                topLocations.add(AdminAnalyticsResponse.TopLocationData.builder()
                        .name(cityName)
                        .hotelCount(hotelCount)
                        .bookings(0L) // Set to 0 or remove if not needed
                        .revenue(BigDecimal.ZERO) // Set to 0 or remove if not needed
                        .build());
            }
        } catch (Exception e) {
            log.error("Error getting top cities by hotel count: ", e);
            // Return empty list if error occurs
        }
        
        return topLocations;
    }
} 