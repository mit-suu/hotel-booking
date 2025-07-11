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

    long countByHotelId(UUID hotelId);

    // Find reviews by rating
    Page<Review> findByRating(Integer rating, Pageable pageable);
    List<Review> findByRating(Integer rating);

    // Search reviews by comment
    @Query("SELECT r FROM Review r WHERE LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Review> searchByComment(@Param("keyword") String keyword, Pageable pageable);


}