package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Booking;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    
    // ===== GUEST QUERIES =====
    Page<Booking> findByGuestEmailOrderByCreatedAtDesc(String guestEmail, Pageable pageable);
    
    Page<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    Optional<Booking> findByIdAndUserId(UUID bookingId, UUID userId);
    
    Optional<Booking> findByIdAndGuestEmail(UUID bookingId, String guestEmail);
    
    // ===== HOST QUERIES =====
    Page<Booking> findByHotelOwnerIdOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);
    
    Page<Booking> findByHotelOwnerIdAndStatusOrderByCreatedAtDesc(UUID ownerId, BookingStatus status, Pageable pageable);
    
    Optional<Booking> findByIdAndHotelOwnerId(UUID bookingId, UUID ownerId);
    
    List<Booking> findByHotelOwnerIdAndStatusInOrderByCreatedAtDesc(UUID ownerId, List<BookingStatus> statuses);
    
    // ===== ADMIN QUERIES =====
    Page<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);
    
    Page<Booking> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus, Pageable pageable);
    
    Page<Booking> findByStatusAndPaymentStatusOrderByCreatedAtDesc(BookingStatus status, PaymentStatus paymentStatus, Pageable pageable);
    
    // ===== HOTEL SPECIFIC QUERIES =====
    Page<Booking> findByHotelIdOrderByCreatedAtDesc(UUID hotelId, Pageable pageable);
    
    Page<Booking> findByHotelIdAndStatusOrderByCreatedAtDesc(UUID hotelId, BookingStatus status, Pageable pageable);
    
    // ===== AVAILABILITY QUERIES =====
    /**
     * Count bookings that conflict with the given date range for a specific room type
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.roomType.id = :roomTypeId " +
           "AND b.status != 'CANCELLED' " +
           "AND ((b.checkInDate <= :checkOutDate AND b.checkOutDate > :checkInDate))")
    Long countConflictingBookings(@Param("roomTypeId") UUID roomTypeId, 
                                 @Param("checkInDate") LocalDate checkInDate, 
                                 @Param("checkOutDate") LocalDate checkOutDate);
    
    /**
     * Count bookings that conflict with the given date range excluding a specific booking
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.roomType.id = :roomTypeId " +
           "AND b.status != 'CANCELLED' " +
           "AND b.id != :excludeBookingId " +
           "AND ((b.checkInDate <= :checkOutDate AND b.checkOutDate > :checkInDate))")
    Long countConflictingBookingsExcluding(@Param("roomTypeId") UUID roomTypeId, 
                                          @Param("checkInDate") LocalDate checkInDate, 
                                          @Param("checkOutDate") LocalDate checkOutDate,
                                          @Param("excludeBookingId") UUID excludeBookingId);
    
    /**
     * Find bookings that overlap with the given date range for conflict detection
     */
    @Query("SELECT b FROM Booking b WHERE b.roomType.id = :roomTypeId " +
           "AND b.status IN ('PENDING', 'CONFIRMED') " +
           "AND ((b.checkInDate <= :checkOutDate AND b.checkOutDate > :checkInDate))")
    List<Booking> findOverlappingBookings(@Param("roomTypeId") UUID roomTypeId, 
                                         @Param("checkInDate") LocalDate checkInDate, 
                                         @Param("checkOutDate") LocalDate checkOutDate);
    
    // ===== STATISTICS QUERIES =====
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.hotel.owner.id = :ownerId")
    Long countByHotelOwnerId(@Param("ownerId") UUID ownerId);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.hotel.owner.id = :ownerId AND b.status = :status")
    Long countByHotelOwnerIdAndStatus(@Param("ownerId") UUID ownerId, @Param("status") BookingStatus status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    Long countByStatus(@Param("status") BookingStatus status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.paymentStatus = :paymentStatus")
    Long countByPaymentStatus(@Param("paymentStatus") PaymentStatus paymentStatus);
    
    // ===== REVENUE QUERIES =====
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.hotel.owner.id = :ownerId " +
           "AND b.paymentStatus = 'PAID'")
    BigDecimal getTotalRevenueByOwner(@Param("ownerId") UUID ownerId);
    
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.hotel.owner.id = :ownerId " +
           "AND b.paymentStatus = 'PAID' " +
           "AND YEAR(b.createdAt) = :year AND MONTH(b.createdAt) = :month")
    BigDecimal getMonthlyRevenueByOwner(@Param("ownerId") UUID ownerId, 
                                        @Param("year") int year, 
                                        @Param("month") int month);
    
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.paymentStatus = 'PAID'")
    BigDecimal getTotalRevenue();
    
    // ===== SEARCH QUERIES =====
    @Query("SELECT b FROM Booking b WHERE " +
           "(LOWER(b.guestName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.guestEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.hotel.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.bookingReference) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY b.createdAt DESC")
    Page<Booking> searchBookings(@Param("keyword") String keyword, Pageable pageable);
    
    // ===== DATE RANGE QUERIES =====
    Page<Booking> findByCheckInDateBetweenOrderByCreatedAtDesc(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    Page<Booking> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    // ===== VALIDATION QUERIES =====
    /**
     * Check if booking reference exists (for uniqueness)
     */
    boolean existsByBookingReference(String bookingReference);
} 