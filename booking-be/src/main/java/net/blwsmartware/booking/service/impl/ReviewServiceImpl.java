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
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.ReviewRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.ReviewService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
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
    UserRepository userRepository;
    HotelRepository hotelRepository;
    BookingRepository bookingRepository;
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
        
        // NEW: Check if user has completed or confirmed booking for this hotel
        if (!bookingRepository.existsCompletedBookingByUserAndHotel(user.getId(), hotel.getId())) {
            log.warn("User {} attempted to review hotel {} without completed or confirmed booking", user.getId(), hotel.getId());
            throw new AppRuntimeException(ErrorResponse.REVIEW_NOT_ALLOWED);
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
        log.info("Checking if user {} can review hotel {}", userId, hotelId);
        
        // Check if user has completed or confirmed booking for this hotel
        boolean hasCompletedBooking = bookingRepository.existsCompletedBookingByUserAndHotel(userId, hotelId);
        if (!hasCompletedBooking) {
            log.info("User {} has no completed or confirmed booking for hotel {}", userId, hotelId);
            return false;
        }
        
        // Check if user has already reviewed this hotel
        boolean hasReviewed = reviewRepository.existsByUserIdAndHotelId(userId, hotelId);
        if (hasReviewed) {
            log.info("User {} has already reviewed hotel {}", userId, hotelId);
            return false;
        }
        
        return true;
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
    
    // ===== HOST OPERATIONS =====
    
    @Override
    @IsHost
    public DataResponse<ReviewResponse> getHostReviews(UUID hostId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews for host: {}", hostId);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByHostId(hostId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsHost
    public DataResponse<ReviewResponse> getHostReviewsWithFilters(UUID hostId, UUID hotelId, Integer rating, 
                                                                 Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting filtered reviews for host: {} with hotelId: {}, rating: {}", hostId, hotelId, rating);
        
        // Validate hotel ownership if hotelId is provided
        if (hotelId != null) {
            Hotel hotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
            
            if (!hotel.getOwner().getId().equals(hostId)) {
                throw new AppRuntimeException(ErrorResponse.HOTEL_ACCESS_DENIED);
            }
        }
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findHostReviewsWithFilters(hostId, hotelId, rating, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsHost
    public DataResponse<ReviewResponse> getHostReviewsByHotel(UUID hostId, UUID hotelId, 
                                                             Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews for host: {} and hotel: {}", hostId, hotelId);
        
        // Validate hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        if (!hotel.getOwner().getId().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.HOTEL_ACCESS_DENIED);
        }
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByHostIdAndHotelId(hostId, hotelId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsHost
    public DataResponse<ReviewResponse> searchHostReviews(UUID hostId, String keyword, 
                                                         Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching reviews for host: {} with keyword: {}", hostId, keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.searchHostReviewsByComment(hostId, keyword, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsHost
    public Long getHostReviewsCount(UUID hostId) {
        log.info("Getting reviews count for host: {}", hostId);
        return reviewRepository.countByHostId(hostId);
    }
    
    @Override
    @IsHost
    public Long getHostReviewsCountByHotel(UUID hostId, UUID hotelId) {
        log.info("Getting reviews count for host: {} and hotel: {}", hostId, hotelId);
        
        // Validate hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        if (!hotel.getOwner().getId().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.HOTEL_ACCESS_DENIED);
        }
        
        return reviewRepository.countByHostIdAndHotelId(hostId, hotelId);
    }
    
    @Override
    @IsHost
    public Double getHostAverageRating(UUID hostId) {
        log.info("Getting average rating for host: {}", hostId);
        return reviewRepository.getAverageRatingByHostId(hostId).orElse(0.0);
    }
    
    @Override
    @IsHost
    public Double getHostAverageRatingByHotel(UUID hostId, UUID hotelId) {
        log.info("Getting average rating for host: {} and hotel: {}", hostId, hotelId);
        
        // Validate hotel ownership
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        if (!hotel.getOwner().getId().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.HOTEL_ACCESS_DENIED);
        }
        
        return reviewRepository.getAverageRatingByHostIdAndHotelId(hostId, hotelId).orElse(0.0);
    }
} 