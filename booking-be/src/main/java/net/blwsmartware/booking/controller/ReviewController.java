package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.ReviewCreateRequest;
import net.blwsmartware.booking.dto.request.ReviewUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.ReviewResponse;
import net.blwsmartware.booking.service.ReviewService;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewController {
    
    ReviewService reviewService;
    
    // Admin endpoints
    @GetMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getAllReviews(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewService.getAllReviews(pageNumber, pageSize, sortBy))
                        .build());
    }
    
    @GetMapping("/admin/filter")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getAllReviewsWithFilters(
            @RequestParam(required = false) UUID hotelId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewService.getAllReviewsWithFilters(hotelId, userId, rating, pageNumber, pageSize, sortBy))
                        .build());
    }
    
    @DeleteMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<?> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/admin/user/{userId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getReviewsByUser(
            @PathVariable UUID userId,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewService.getReviewsByUser(userId, pageNumber, pageSize, sortBy))
                        .build());
    }
    
    // Statistics endpoints
    @GetMapping("/admin/stats/total")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getTotalReviewsCount() {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Long>builder()
                        .result(reviewService.getTotalReviewsCount())
                        .build());
    }
    

    
    @GetMapping("/admin/stats/hotel/{hotelId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getReviewsCountByHotel(@PathVariable UUID hotelId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Long>builder()
                        .result(reviewService.getReviewsCountByHotel(hotelId))
                        .build());
    }
    
    @GetMapping("/admin/stats/user/{userId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getReviewsCountByUser(@PathVariable UUID userId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Long>builder()
                        .result(reviewService.getReviewsCountByUser(userId))
                        .build());
    }
    
    // Public endpoints
    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse<ReviewResponse>> getReviewById(@PathVariable UUID id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<ReviewResponse>builder()
                        .result(reviewService.getReviewById(id))
                        .build());
    }
    
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getReviewsByHotel(
            @PathVariable UUID hotelId,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewService.getReviewsByHotel(hotelId, pageNumber, pageSize, sortBy))
                        .build());
    }
    

    
    @GetMapping("/hotel/{hotelId}/average-rating")
    public ResponseEntity<MessageResponse<Double>> getAverageRatingByHotel(@PathVariable UUID hotelId) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Double>builder()
                        .result(reviewService.getAverageRatingByHotel(hotelId))
                        .build());
    }
    
    @GetMapping("/hotel/{hotelId}/can-review")
    public ResponseEntity<MessageResponse<Boolean>> canUserReviewHotel(@PathVariable UUID hotelId) {
        // Get current user ID from security context
        String currentUserId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        boolean canReview = reviewService.canUserReviewHotel(UUID.fromString(currentUserId), hotelId);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Boolean>builder()
                        .message(canReview ? "User can review this hotel" : "User cannot review this hotel")
                        .result(canReview)
                        .build());
    }
    
    @GetMapping("/rating/{rating}")
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getReviewsByRating(
            @PathVariable Integer rating,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewService.getReviewsByRating(rating, pageNumber, pageSize, sortBy))
                        .build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> searchReviews(
            @RequestParam String keyword,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewService.searchReviews(keyword, pageNumber, pageSize, sortBy))
                        .build());
    }
    
    // User endpoints
    @PostMapping
    public ResponseEntity<MessageResponse<ReviewResponse>> createReview(@Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(MessageResponse.<ReviewResponse>builder()
                        .result(reviewService.createReview(request))
                        .build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse<ReviewResponse>> updateReview(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewUpdateRequest request) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<ReviewResponse>builder()
                        .result(reviewService.updateReview(id, request))
                        .build());
    }
    
    @GetMapping("/my")
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getMyReviews(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewService.getMyReviews(pageNumber, pageSize, sortBy))
                        .build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMyReview(@PathVariable UUID id) {
        reviewService.deleteMyReview(id);
        return ResponseEntity.noContent().build();
    }
    
    // ===== HOST ENDPOINTS =====
    
    @GetMapping("/host")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getHostReviews(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        DataResponse<ReviewResponse> response = reviewService.getHostReviews(
                UUID.fromString(currentHostId), pageNumber, pageSize, sortBy);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .message("Host reviews retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/filter")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getHostReviewsWithFilters(
            @RequestParam(required = false) UUID hotelId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        DataResponse<ReviewResponse> response = reviewService.getHostReviewsWithFilters(
                UUID.fromString(currentHostId), hotelId, rating, pageNumber, pageSize, sortBy);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .message("Host reviews with filters retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/hotel/{hotelId}")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getHostReviewsByHotel(
            @PathVariable UUID hotelId,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        DataResponse<ReviewResponse> response = reviewService.getHostReviewsByHotel(
                UUID.fromString(currentHostId), hotelId, pageNumber, pageSize, sortBy);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .message("Host reviews by hotel retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/search")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> searchHostReviews(
            @RequestParam String keyword,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt", required = false) String sortBy) {
        
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        DataResponse<ReviewResponse> response = reviewService.searchHostReviews(
                UUID.fromString(currentHostId), keyword, pageNumber, pageSize, sortBy);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .message("Host reviews search completed successfully")
                        .result(response)
                        .build());
    }
    
    // Host Statistics endpoints
    @GetMapping("/host/stats/total")
    @IsHost
    public ResponseEntity<MessageResponse<Long>> getHostReviewsCount() {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        Long count = reviewService.getHostReviewsCount(UUID.fromString(currentHostId));
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Long>builder()
                        .message("Host reviews count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/host/stats/hotel/{hotelId}")
    @IsHost
    public ResponseEntity<MessageResponse<Long>> getHostReviewsCountByHotel(@PathVariable UUID hotelId) {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        Long count = reviewService.getHostReviewsCountByHotel(UUID.fromString(currentHostId), hotelId);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Long>builder()
                        .message("Host reviews count by hotel retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/host/stats/average-rating")
    @IsHost
    public ResponseEntity<MessageResponse<Double>> getHostAverageRating() {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        Double averageRating = reviewService.getHostAverageRating(UUID.fromString(currentHostId));
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Double>builder()
                        .message("Host average rating retrieved successfully")
                        .result(averageRating)
                        .build());
    }
    
    @GetMapping("/host/stats/hotel/{hotelId}/average-rating")
    @IsHost
    public ResponseEntity<MessageResponse<Double>> getHostAverageRatingByHotel(@PathVariable UUID hotelId) {
        String currentHostId = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        
        Double averageRating = reviewService.getHostAverageRatingByHotel(UUID.fromString(currentHostId), hotelId);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<Double>builder()
                        .message("Host average rating by hotel retrieved successfully")
                        .result(averageRating)
                        .build());
    }
} 