package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.Review;
import net.blwsmartware.booking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    // Find reviews by hotel
    Page<Review> findByHotel(Hotel hotel, Pageable pageable);
    List<Review> findByHotel(Hotel hotel);
    
    // Find reviews by hotel ID
    Page<Review> findByHotelId(UUID hotelId, Pageable pageable);
    List<Review> findByHotelId(UUID hotelId);
    
    // Find reviews by user
    Page<Review> findByUser(User user, Pageable pageable);
    List<Review> findByUser(User user);
    
    // Find reviews by user ID
    Page<Review> findByUserId(UUID userId, Pageable pageable);
    List<Review> findByUserId(UUID userId);
    

    
    // Find reviews by rating
    Page<Review> findByRating(Integer rating, Pageable pageable);
    List<Review> findByRating(Integer rating);
    
    // Search reviews by comment
    @Query("SELECT r FROM Review r WHERE LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Review> searchByComment(@Param("keyword") String keyword, Pageable pageable);
    
    // Find reviews with filters
    @Query("SELECT r FROM Review r WHERE " +
           "(:hotelId IS NULL OR r.hotel.id = :hotelId) AND " +
           "(:userId IS NULL OR r.user.id = :userId) AND " +
           "(:rating IS NULL OR r.rating = :rating)")
    Page<Review> findWithFilters(@Param("hotelId") UUID hotelId,
                                @Param("userId") UUID userId,
                                @Param("rating") Integer rating,
                                Pageable pageable);
    
    // Check if user has reviewed hotel
    boolean existsByUserAndHotel(User user, Hotel hotel);
    boolean existsByUserIdAndHotelId(UUID userId, UUID hotelId);
    
    // Find review by user and hotel
    Optional<Review> findByUserAndHotel(User user, Hotel hotel);
    Optional<Review> findByUserIdAndHotelId(UUID userId, UUID hotelId);
    
    // Count reviews by hotel
    long countByHotel(Hotel hotel);
    long countByHotelId(UUID hotelId);
    
    // Count reviews by user
    long countByUser(User user);
    long countByUserId(UUID userId);
    
    // Get average rating by hotel
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Optional<Double> getAverageRatingByHotel(@Param("hotelId") UUID hotelId);
    
    // Get recent reviews by hotel (limit 5)
    @Query("SELECT r FROM Review r WHERE r.hotel.id = :hotelId ORDER BY r.createdAt DESC")
    List<Review> findRecentReviewsByHotel(@Param("hotelId") UUID hotelId, Pageable pageable);
} 