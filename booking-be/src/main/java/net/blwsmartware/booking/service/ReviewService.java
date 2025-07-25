package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.ReviewCreateRequest;
import net.blwsmartware.booking.dto.request.ReviewUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReviewService {
    
    // Admin operations
    DataResponse<ReviewResponse> getAllReviews(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> getAllReviewsWithFilters(
            UUID hotelId, UUID userId, Integer rating,
            Integer pageNumber, Integer pageSize, String sortBy);
    ReviewResponse getReviewById(UUID id);
    void deleteReview(UUID id);
    
    // Hotel-specific operations
    DataResponse<ReviewResponse> getReviewsByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    
    // User operations
    ReviewResponse createReview(ReviewCreateRequest request);
    ReviewResponse updateReview(UUID id, ReviewUpdateRequest request);
    void deleteMyReview(UUID id);
    DataResponse<ReviewResponse> getMyReviews(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> getReviewsByUser(UUID userId, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Search and filter operations
    DataResponse<ReviewResponse> getReviewsByRating(Integer rating, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> searchReviews(String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Statistics  
    Long getTotalReviewsCount();
    Long getReviewsCountByHotel(UUID hotelId);
    Long getReviewsCountByUser(UUID userId);
    Double getAverageRatingByHotel(UUID hotelId);
    
    // Validation methods
    boolean hasUserReviewedHotel(UUID userId, UUID hotelId);
    boolean canUserReviewHotel(UUID userId, UUID hotelId);
    
    // Host operations
    DataResponse<ReviewResponse> getHostReviews(UUID hostId, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> getHostReviewsWithFilters(
            UUID hostId, UUID hotelId, Integer rating,
            Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> getHostReviewsByHotel(UUID hostId, UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> searchHostReviews(UUID hostId, String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Host statistics
    Long getHostReviewsCount(UUID hostId);
    Long getHostReviewsCountByHotel(UUID hostId, UUID hotelId);
    Double getHostAverageRating(UUID hostId);
    Double getHostAverageRatingByHotel(UUID hostId, UUID hotelId);
} 