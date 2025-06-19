package net.blwsmartware.booking.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.AdminDashboardResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.service.HotelService;
import net.blwsmartware.booking.service.ReviewService;
import net.blwsmartware.booking.service.RoomTypeService;
import net.blwsmartware.booking.service.UserService;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    
    @GetMapping("/dashboard")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminDashboardResponse>> getDashboardStats() {
        log.info("Getting admin dashboard statistics");
        
        // Get all statistics
        Long totalHotels = hotelService.getTotalHotelsCount();
        Long activeHotels = hotelService.getActiveHotelsCount();
        Long featuredHotels = hotelService.getFeaturedHotelsCount();
        
        Long totalRoomTypes = roomTypeService.getTotalRoomTypesCount();
        
        Long totalReviews = reviewService.getTotalReviewsCount();
        
        Long totalUsers = userService.getTotalUsersCount();
        
        AdminDashboardResponse dashboard = AdminDashboardResponse.builder()
                .totalHotels(totalHotels)
                .activeHotels(activeHotels)
                .featuredHotels(featuredHotels)
                .inactiveHotels(totalHotels - activeHotels)
                .totalRoomTypes(totalRoomTypes)
                .totalReviews(totalReviews)
                .totalUsers(totalUsers)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<AdminDashboardResponse>builder()
                        .result(dashboard)
                        .build());
    }
    
    @GetMapping("/stats/hotels")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminDashboardResponse.HotelStats>> getHotelStats() {
        log.info("Getting hotel statistics");
        
        Long totalHotels = hotelService.getTotalHotelsCount();
        Long activeHotels = hotelService.getActiveHotelsCount();
        Long featuredHotels = hotelService.getFeaturedHotelsCount();
        
        AdminDashboardResponse.HotelStats stats = AdminDashboardResponse.HotelStats.builder()
                .totalHotels(totalHotels)
                .activeHotels(activeHotels)
                .featuredHotels(featuredHotels)
                .inactiveHotels(totalHotels - activeHotels)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<AdminDashboardResponse.HotelStats>builder()
                        .result(stats)
                        .build());
    }
    
    @GetMapping("/stats/room-types")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminDashboardResponse.RoomTypeStats>> getRoomTypeStats() {
        log.info("Getting room type statistics");
        
        Long totalRoomTypes = roomTypeService.getTotalRoomTypesCount();
        
        AdminDashboardResponse.RoomTypeStats stats = AdminDashboardResponse.RoomTypeStats.builder()
                .totalRoomTypes(totalRoomTypes)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<AdminDashboardResponse.RoomTypeStats>builder()
                        .result(stats)
                        .build());
    }
    
    @GetMapping("/stats/reviews")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminDashboardResponse.ReviewStats>> getReviewStats() {
        log.info("Getting review statistics");
        
        Long totalReviews = reviewService.getTotalReviewsCount();
        
        AdminDashboardResponse.ReviewStats stats = AdminDashboardResponse.ReviewStats.builder()
                .totalReviews(totalReviews)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<AdminDashboardResponse.ReviewStats>builder()
                        .result(stats)
                        .build());
    }
    
    @GetMapping("/stats/users")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminDashboardResponse.UserStats>> getUserStats() {
        log.info("Getting user statistics");
        
        Long totalUsers = userService.getTotalUsersCount();
        
        AdminDashboardResponse.UserStats stats = AdminDashboardResponse.UserStats.builder()
                .totalUsers(totalUsers)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<AdminDashboardResponse.UserStats>builder()
                        .result(stats)
                        .build());
    }
} 