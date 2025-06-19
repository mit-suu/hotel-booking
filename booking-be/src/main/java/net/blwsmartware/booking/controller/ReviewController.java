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
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
} 