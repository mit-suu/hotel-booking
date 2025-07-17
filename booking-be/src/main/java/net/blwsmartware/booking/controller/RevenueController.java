package net.blwsmartware.booking.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.RevenuePageResponse;
import net.blwsmartware.booking.dto.response.RevenueStatsResponse;
import net.blwsmartware.booking.service.RevenueService;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/admin/revenue")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RevenueController {
    
    RevenueService revenueService;
    
    @GetMapping
    @IsAdmin
    public ResponseEntity<MessageResponse<RevenuePageResponse>> getRevenueData(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "totalRevenue") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        
        log.info("Getting revenue data - search: {}, status: {}, dateRange: {}", search, status, dateRange);
        
        RevenuePageResponse response = revenueService.getRevenueData(
                search, status, dateRange, startDate, endDate, page, size, sort, direction);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<RevenuePageResponse>builder()
                        .message("Revenue data retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/stats")
    @IsAdmin
    public ResponseEntity<MessageResponse<RevenueStatsResponse>> getRevenueStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.info("Getting revenue stats from {} to {}", startDate, endDate);
        
        RevenueStatsResponse response = revenueService.getRevenueStats(startDate, endDate);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<RevenueStatsResponse>builder()
                        .message("Revenue stats retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PostMapping("/hotel/{hotelId}/recalculate")
    @IsAdmin
    public ResponseEntity<MessageResponse<Void>> recalculateHotelRevenue(@PathVariable UUID hotelId) {
        log.info("Recalculating revenue for hotel: {}", hotelId);
        
        revenueService.recalculateHotelRevenue(hotelId);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Void>builder()
                        .message("Hotel revenue recalculated successfully")
                        .build());
    }
} 