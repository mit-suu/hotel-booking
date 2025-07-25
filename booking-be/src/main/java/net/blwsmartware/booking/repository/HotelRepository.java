package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, UUID> {

    Page<Hotel> findByOwner(User owner, Pageable pageable);
    List<Hotel> findByOwner(User owner);

    Page<Hotel> findByOwnerId(UUID ownerId, Pageable pageable);
    List<Hotel> findByOwnerId(UUID ownerId);

    Page<Hotel> findByIsActiveTrue(Pageable pageable);
    List<Hotel> findByIsActiveTrue();
    
    // Find featured hotels - ADMIN ONLY (all featured regardless of status)
    Page<Hotel> findByIsFeaturedTrue(Pageable pageable);
    List<Hotel> findByIsFeaturedTrue();
    
    // Find active featured hotels - PUBLIC API
    Page<Hotel> findByIsFeaturedTrueAndIsActiveTrue(Pageable pageable);
    List<Hotel> findByIsFeaturedTrueAndIsActiveTrue();
    
    // Find hotels by city - PUBLIC API (only active)
    Page<Hotel> findByCityAndIsActiveTrue(String city, Pageable pageable);
    Page<Hotel> findByCityIgnoreCaseAndIsActiveTrue(String city, Pageable pageable);
    List<Hotel> findByCityIgnoreCaseAndIsActiveTrue(String city);
    
    // Find hotels by city - ADMIN (all)
    Page<Hotel> findByCity(String city, Pageable pageable);
    Page<Hotel> findByCityIgnoreCase(String city, Pageable pageable);
    List<Hotel> findByCityIgnoreCase(String city);
    
    // Find hotels by country - PUBLIC API (only active)
    Page<Hotel> findByCountryAndIsActiveTrue(String country, Pageable pageable);
    Page<Hotel> findByCountryIgnoreCaseAndIsActiveTrue(String country, Pageable pageable);
    List<Hotel> findByCountryIgnoreCaseAndIsActiveTrue(String country);
    
    // Find hotels by country - ADMIN (all)
    Page<Hotel> findByCountry(String country, Pageable pageable);
    Page<Hotel> findByCountryIgnoreCase(String country, Pageable pageable);
    List<Hotel> findByCountryIgnoreCase(String country);
    
    // Find hotels by star rating - PUBLIC API (only active)
    Page<Hotel> findByStarRatingAndIsActiveTrue(Integer starRating, Pageable pageable);
    List<Hotel> findByStarRatingAndIsActiveTrue(Integer starRating);
    
    // Find hotels by star rating - ADMIN (all)
    Page<Hotel> findByStarRating(Integer starRating, Pageable pageable);
    List<Hotel> findByStarRating(Integer starRating);
    
    // Search hotels by name, city or country - PUBLIC API (only active)
    @Query("SELECT h FROM Hotel h WHERE " +
           "h.isActive = true AND (" +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.country) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Hotel> searchActiveByNameOrCityOrCountry(@Param("keyword") String keyword, Pageable pageable);
    
    // Search hotels by name, city or country - ADMIN (all)
    @Query("SELECT h FROM Hotel h WHERE " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.country) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Hotel> searchByNameOrCityOrCountry(@Param("keyword") String keyword, Pageable pageable);
    
    // Find hotels with comprehensive filters
    @Query("SELECT h FROM Hotel h WHERE " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:country IS NULL OR LOWER(h.country) = LOWER(:country)) AND " +
           "(:starRating IS NULL OR h.starRating = :starRating) AND " +
           "(:isActive IS NULL OR h.isActive = :isActive) AND " +
           "(:isFeatured IS NULL OR h.isFeatured = :isFeatured) AND " +
           "(:minPrice IS NULL OR h.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR h.pricePerNight <= :maxPrice)")
    Page<Hotel> findWithFilters(@Param("city") String city,
                               @Param("country") String country,
                               @Param("starRating") Integer starRating,
                               @Param("isActive") Boolean isActive,
                               @Param("isFeatured") Boolean isFeatured,
                               @Param("minPrice") BigDecimal minPrice,
                               @Param("maxPrice") BigDecimal maxPrice,
                               Pageable pageable);
    
    // Find my hotels with filters (for Host)
    @Query("SELECT h FROM Hotel h WHERE " +
           "h.owner.id = :ownerId AND " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:country IS NULL OR LOWER(h.country) = LOWER(:country)) AND " +
           "(:starRating IS NULL OR h.starRating = :starRating) AND " +
           "(:isActive IS NULL OR h.isActive = :isActive)")
    Page<Hotel> findMyHotelsWithFilters(@Param("ownerId") UUID ownerId,
                                       @Param("city") String city,
                                       @Param("country") String country,
                                       @Param("starRating") Integer starRating,
                                       @Param("isActive") Boolean isActive,
                                       Pageable pageable);
    
    // Legacy method for backward compatibility (if needed)
    @Query("SELECT h FROM Hotel h WHERE " +
           "(:isActive IS NULL OR h.isActive = :isActive) AND " +
           "(:isFeatured IS NULL OR h.isFeatured = :isFeatured) AND " +
           "(:starRating IS NULL OR h.starRating = :starRating) AND " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:ownerId IS NULL OR h.owner.id = :ownerId)")
    Page<Hotel> findWithBasicFilters(@Param("isActive") Boolean isActive,
                                    @Param("isFeatured") Boolean isFeatured,
                                    @Param("starRating") Integer starRating,
                                    @Param("city") String city,
                                    @Param("ownerId") UUID ownerId,
                                    Pageable pageable);
    
    // Count hotels by owner
    long countByOwner(User owner);
    long countByOwnerId(UUID ownerId);
    long countByOwnerIdAndIsActiveTrue(UUID ownerId);
    
    // Count active hotels
    long countByIsActiveTrue();
    
    // Count featured hotels
    long countByIsFeaturedTrue();
    
    // Check if hotel name exists
    boolean existsByNameAndOwner(String name, User owner);
    boolean existsByNameAndOwnerId(String name, UUID ownerId);
    boolean existsByNameAndCity(String name, String city);

    @Query("SELECT COUNT(h) FROM Hotel h WHERE h.isActive = true")
    long countActiveHotels();
    
    @Query("SELECT COUNT(h) FROM Hotel h WHERE h.isFeatured = true")
    long countFeaturedHotels();
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Optional<Double> getAverageRating(@Param("hotelId") UUID hotelId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId")
    long getReviewCount(@Param("hotelId") UUID hotelId);

    @Query("SELECT h FROM Hotel h WHERE " +
           "h.isActive = true AND " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:country IS NULL OR LOWER(h.country) = LOWER(:country)) AND " +
           "(:starRating IS NULL OR h.starRating = :starRating) AND " +
           "(:isFeatured IS NULL OR h.isFeatured = :isFeatured) AND " +
           "(:minPrice IS NULL OR h.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR h.pricePerNight <= :maxPrice) AND " +
           "(:amenities IS NULL OR :amenities = '' OR " +
           " h.amenities IS NULL OR " +
           " LOWER(h.amenities) LIKE LOWER(CONCAT('%', :amenities, '%')))")
    Page<Hotel> findActiveWithFiltersAndAmenities(@Param("city") String city,
                                           @Param("country") String country,
                                           @Param("starRating") Integer starRating,
                                           @Param("isFeatured") Boolean isFeatured,
                                           @Param("minPrice") BigDecimal minPrice,
                                           @Param("maxPrice") BigDecimal maxPrice,
                                           @Param("amenities") String amenities,
                                           Pageable pageable);

    // Get all unique amenities from hotels - simplified approach
    @Query("SELECT DISTINCT h.amenities FROM Hotel h " +
           "WHERE h.amenities IS NOT NULL AND h.amenities != '' AND h.isActive = true")
    List<String> findAllAmenitiesRaw();

    // Count active featured hotels
    long countByIsFeaturedTrueAndIsActiveTrue();
    
    // Get hotel statistics - count active featured hotels 
    @Query("SELECT COUNT(h) FROM Hotel h WHERE h.isFeatured = true AND h.isActive = true")
    long countActiveFeaturedHotels();

    // ===== REVENUE ANALYSIS QUERIES =====
    @Query("SELECT AVG(h.commissionRate) FROM Hotel h WHERE h.isActive = true")
    Optional<BigDecimal> getAverageCommissionRate();

    @Query("SELECT h FROM Hotel h WHERE " +
           "(:searchTerm IS NULL OR :searchTerm = '' OR " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.owner.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.country) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:isActive IS NULL OR h.isActive = :isActive)")
    Page<Hotel> findHotelsForRevenue(@Param("searchTerm") String searchTerm, 
                                     @Param("isActive") Boolean isActive, 
                                     Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(h.totalRevenue), 0) FROM Hotel h WHERE h.isActive = true")
    BigDecimal getTotalRevenue();
    
    @Query("SELECT COALESCE(SUM(h.commissionEarned), 0) FROM Hotel h WHERE h.isActive = true")
    BigDecimal getTotalCommissionEarned();
    
    // Host specific queries
    List<Hotel> findByOwnerIdAndIsActiveTrueOrderByCreatedAtDesc(UUID ownerId);
    
    // ===== CITY STATISTICS QUERIES =====
    @Query("SELECT h.city as cityName, COUNT(h) as hotelCount " +
           "FROM Hotel h " +
           "WHERE h.isActive = true AND h.city IS NOT NULL AND h.city != '' " +
           "GROUP BY h.city " +
           "ORDER BY COUNT(h) DESC")
    List<Object[]> findTopCitiesByHotelCount(Pageable pageable);

}