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

    Page<Review> findByHotel(Hotel hotel, Pageable pageable);
    List<Review> findByHotel(Hotel hotel);

    Page<Review> findByHotelId(UUID hotelId, Pageable pageable);
    List<Review> findByHotelId(UUID hotelId);

    Page<Review> findByUser(User user, Pageable pageable);
    List<Review> findByUser(User user);

    Page<Review> findByUserId(UUID userId, Pageable pageable);
    List<Review> findByUserId(UUID userId);
    

    

    Page<Review> findByRating(Integer rating, Pageable pageable);
    List<Review> findByRating(Integer rating);
    

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

    boolean existsByUserAndHotel(User user, Hotel hotel);
    boolean existsByUserIdAndHotelId(UUID userId, UUID hotelId);

    Optional<Review> findByUserAndHotel(User user, Hotel hotel);
    Optional<Review> findByUserIdAndHotelId(UUID userId, UUID hotelId);
    long countByHotel(Hotel hotel);
    long countByHotelId(UUID hotelId);
    long countByUser(User user);
    long countByUserId(UUID userId);
    
    // Get average rating by hotel
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Optional<Double> getAverageRatingByHotel(@Param("hotelId") UUID hotelId);
    
    // Get recent reviews by hotel (limit 5)
    @Query("SELECT r FROM Review r WHERE r.hotel.id = :hotelId ORDER BY r.createdAt DESC")
    List<Review> findRecentReviewsByHotel(@Param("hotelId") UUID hotelId, Pageable pageable);
    
    // Host-related queries
    @Query("SELECT r FROM Review r WHERE r.hotel.owner.id = :hostId")
    Page<Review> findByHostId(@Param("hostId") UUID hostId, Pageable pageable);
    
    @Query("SELECT r FROM Review r WHERE r.hotel.owner.id = :hostId AND " +
           "(:hotelId IS NULL OR r.hotel.id = :hotelId) AND " +
           "(:rating IS NULL OR r.rating = :rating)")
    Page<Review> findHostReviewsWithFilters(@Param("hostId") UUID hostId,
                                          @Param("hotelId") UUID hotelId,
                                          @Param("rating") Integer rating,
                                          Pageable pageable);
    
    @Query("SELECT r FROM Review r WHERE r.hotel.owner.id = :hostId AND r.hotel.id = :hotelId")
    Page<Review> findByHostIdAndHotelId(@Param("hostId") UUID hostId, @Param("hotelId") UUID hotelId, Pageable pageable);
    
    @Query("SELECT r FROM Review r WHERE r.hotel.owner.id = :hostId AND " +
           "LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Review> searchHostReviewsByComment(@Param("hostId") UUID hostId, @Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.owner.id = :hostId")
    Long countByHostId(@Param("hostId") UUID hostId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.owner.id = :hostId AND r.hotel.id = :hotelId")
    Long countByHostIdAndHotelId(@Param("hostId") UUID hostId, @Param("hotelId") UUID hotelId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.owner.id = :hostId")
    Optional<Double> getAverageRatingByHostId(@Param("hostId") UUID hostId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.owner.id = :hostId AND r.hotel.id = :hotelId")
    Optional<Double> getAverageRatingByHostIdAndHotelId(@Param("hostId") UUID hostId, @Param("hotelId") UUID hotelId);
} 