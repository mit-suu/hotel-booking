
package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
// Logging enabled
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
// Logging enabled
@Slf4j
public class ReviewController {

    ReviewService reviewSvc;

    // ========== ADMIN ENDPOINTS ==========

    @GetMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> fetchAllReviews(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortKey) {

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewSvc.getAllReviews(pageNum, pageSize, sortKey))
                        .build());
    }

    @GetMapping("/admin/filter")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> fetchFilteredReviews(
            @RequestParam(required = false) UUID hotelId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortKey) {

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewSvc.getAllReviewsWithFilters(hotelId, userId, rating, pageNum, pageSize, sortKey))
                        .build());
    }

    @DeleteMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<?> removeReview(@PathVariable UUID id) {
        reviewSvc.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/user/{userId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> fetchUserReviewsAdmin(
            @PathVariable UUID userId,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortKey) {

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewSvc.getReviewsByUser(userId, pageNum, pageSize, sortKey))
                        .build());
    }

    @GetMapping("/admin/stats/total")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> fetchTotalReviewCount() {
        return ResponseEntity.status(HttpStatus.OK)
                .body(MessageResponse.<Long>builder()
                        .result(reviewSvc.getTotalReviewsCount())
                        .build());
    }

    @GetMapping("/admin/stats/hotel/{hotelId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> countHotelReviews(@PathVariable UUID hotelId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(MessageResponse.<Long>builder()
                        .result(reviewSvc.getReviewsCountByHotel(hotelId))
                        .build());
    }

    @GetMapping("/admin/stats/user/{userId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> countUserReviews(@PathVariable UUID userId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(MessageResponse.<Long>builder()
                        .result(reviewSvc.getReviewsCountByUser(userId))
                        .build());
    }

    // ========== PUBLIC ENDPOINTS ==========

    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse<ReviewResponse>> fetchReviewById(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(MessageResponse.<ReviewResponse>builder()
                        .result(reviewSvc.getReviewById(id))
                        .build());
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> fetchHotelReviews(
            @PathVariable UUID hotelId,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortKey) {

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewSvc.getReviewsByHotel(hotelId, pageNum, pageSize, sortKey))
                        .build());
    }

    @GetMapping("/hotel/{hotelId}/average-rating")
    public ResponseEntity<MessageResponse<Double>> avgHotelRating(@PathVariable UUID hotelId) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(MessageResponse.<Double>builder()
                        .result(reviewSvc.getAverageRatingByHotel(hotelId))
                        .build());
    }

    @GetMapping("/rating/{rating}")
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> fetchByRating(
            @PathVariable Integer rating,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortKey) {

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewSvc.getReviewsByRating(rating, pageNum, pageSize, sortKey))
                        .build());
    }

    @GetMapping("/search")
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> searchForReviews(
            @RequestParam String keyword,
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortKey) {

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewSvc.searchReviews(keyword, pageNum, pageSize, sortKey))
                        .build());
    }

    // ========== USER ENDPOINTS ==========

    @PostMapping
    public ResponseEntity<MessageResponse<ReviewResponse>> submitReview(@Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(MessageResponse.<ReviewResponse>builder()
                        .result(reviewSvc.createReview(request))
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageResponse<ReviewResponse>> modifyReview(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewUpdateRequest request) {

        return ResponseEntity.status(HttpStatus.OK)
                .body(MessageResponse.<ReviewResponse>builder()
                        .result(reviewSvc.updateReview(id, request))
                        .build());
    }

    @GetMapping("/my")
    public ResponseEntity<MessageResponse<DataResponse<ReviewResponse>>> getOwnReviews(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNum,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortKey) {

        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<ReviewResponse>>builder()
                        .result(reviewSvc.getMyReviews(pageNum, pageSize, sortKey))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeOwnReview(@PathVariable UUID id) {
        reviewSvc.deleteMyReview(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
