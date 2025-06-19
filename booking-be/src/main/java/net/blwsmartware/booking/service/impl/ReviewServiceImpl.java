package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.ReviewCreateRequest;
import net.blwsmartware.booking.dto.request.ReviewUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.ReviewResponse;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.Review;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.mapper.ReviewMapper;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.ReviewRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.ReviewService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewServiceImpl implements ReviewService {
    
    ReviewRepository reviewRepository;
    HotelRepository hotelRepository;
    UserRepository userRepository;
    ReviewMapper reviewMapper;
    
    @Override
    @IsAdmin
    public DataResponse<ReviewResponse> getAllReviews(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting all reviews with pagination: page={}, size={}, sortBy={}", pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findAll(pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsAdmin
    public DataResponse<ReviewResponse> getAllReviewsWithFilters(
            UUID hotelId, UUID userId, Integer rating,
            Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews with filters - hotel: {}, user: {}, rating: {}", 
                hotelId, userId, rating);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findWithFilters(
                hotelId, userId, rating, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    public ReviewResponse getReviewById(UUID id) {
        log.info("Getting review by ID: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.REVIEW_NOT_FOUND));
        
        return reviewMapper.toResponse(review);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public void deleteReview(UUID id) {
        log.info("Deleting review: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.REVIEW_NOT_FOUND));
        
        reviewRepository.delete(review);
    }
    

    
    @Override
    public DataResponse<ReviewResponse> getReviewsByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews by hotel: {}", hotelId);
        
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByHotelId(hotelId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    

    
    @Override
    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request) {
        log.info("Creating new review for hotel: {} by user: {}", request.getHotelId(), request.getUserId());
        
        // Get current user or use provided user ID
        User user;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        } else {
            user = getCurrentUser();
        }
        
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        // Check if user has already reviewed this hotel
        if (reviewRepository.existsByUserAndHotel(user, hotel)) {
            throw new AppRuntimeException(ErrorResponse.REVIEW_ALREADY_EXISTS);
        }
        
        // Create review
        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .hotel(hotel)
                .user(user)
                .helpfulCount(0)
                .build();
        
        Review savedReview = reviewRepository.save(review);
        
        return reviewMapper.toResponse(savedReview);
    }
    
    @Override
    @Transactional
    public ReviewResponse updateReview(UUID id, ReviewUpdateRequest request) {
        log.info("Updating review: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.REVIEW_NOT_FOUND));
        
        // Check if current user owns this review
        UUID currentUserId = getCurrentUserId();
        if (!review.getUser().getId().equals(currentUserId)) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHORIZED);
        }
        
        // Update review
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        Review updatedReview = reviewRepository.save(review);
        
        return reviewMapper.toResponse(updatedReview);
    }
    
    @Override
    @Transactional
    public void deleteMyReview(UUID id) {
        log.info("Deleting my review: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.REVIEW_NOT_FOUND));
        
        // Check if current user owns this review
        UUID currentUserId = getCurrentUserId();
        if (!review.getUser().getId().equals(currentUserId)) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHORIZED);
        }
        
        reviewRepository.delete(review);
        log.info("Successfully deleted review: {}", id);
    }
    
    @Override
    public DataResponse<ReviewResponse> getMyReviews(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting my reviews");
        
        UUID currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByUserId(currentUserId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsAdmin
    public DataResponse<ReviewResponse> getReviewsByUser(UUID userId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews by user: {}", userId);
        
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByUserId(userId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    public DataResponse<ReviewResponse> getReviewsByRating(Integer rating, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews by rating: {}", rating);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByRating(rating, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toPublicResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    public DataResponse<ReviewResponse> searchReviews(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching reviews with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.searchByComment(keyword, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toPublicResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsAdmin
    public Long getTotalReviewsCount() {
        return reviewRepository.count();
    }
    

    
    @Override
    public Long getReviewsCountByHotel(UUID hotelId) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        return reviewRepository.countByHotelId(hotelId);
    }
    
    @Override
    @IsAdmin
    public Long getReviewsCountByUser(UUID userId) {
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        return reviewRepository.countByUserId(userId);
    }
    
    @Override
    public Double getAverageRatingByHotel(UUID hotelId) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        return reviewRepository.getAverageRatingByHotel(hotelId).orElse(0.0);
    }
    
    @Override
    public boolean hasUserReviewedHotel(UUID userId, UUID hotelId) {
        return reviewRepository.existsByUserIdAndHotelId(userId, hotelId);
    }
    
    @Override
    public boolean canUserReviewHotel(UUID userId, UUID hotelId) {
        // TODO: Implement logic to check if user has booking for this hotel
        // For now, return true if user hasn't reviewed yet
        return !hasUserReviewedHotel(userId, hotelId);
    }
    
    // Helper methods
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName(); // This is actually the User ID from JWT subject
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
    }
    
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName()); // Direct conversion to UUID
    }
} 