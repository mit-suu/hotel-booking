package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {

    Page<RoomType> findByHotel(Hotel hotel, Pageable pageable);
    List<RoomType> findByHotel(Hotel hotel);
    Page<RoomType> findByHotelId(UUID hotelId, Pageable pageable);
    List<RoomType> findByHotelId(UUID hotelId);

    // Find room types by host (owner of the hotel)
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.owner.id = :hostId")
    Page<RoomType> findByHostId(@Param("hostId") UUID hostId, Pageable pageable);
    
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.owner.id = :hostId")
    List<RoomType> findByHostId(@Param("hostId") UUID hostId);
    
    // Find room types by max occupancy
    Page<RoomType> findByMaxOccupancyGreaterThanEqual(Integer minOccupancy, Pageable pageable);
    List<RoomType> findByMaxOccupancyGreaterThanEqual(Integer minOccupancy);

    Page<RoomType> findByPricePerNightBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    List<RoomType> findByPricePerNightBetween(BigDecimal minPrice, BigDecimal maxPrice);

    @Query("SELECT rt FROM RoomType rt WHERE rt.availableRooms > 0")
    Page<RoomType> findAvailableRoomTypes(Pageable pageable);
    
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.id = :hotelId AND rt.availableRooms > 0")
    Page<RoomType> findAvailableRoomTypesByHotel(@Param("hotelId") UUID hotelId, Pageable pageable);

    Page<RoomType> findByHotelIdAndAvailableRoomsGreaterThan(UUID hotelId, Integer availableRooms, Pageable pageable);
    List<RoomType> findByHotelIdAndAvailableRoomsGreaterThan(UUID hotelId, Integer availableRooms);

    @Query("SELECT rt FROM RoomType rt WHERE LOWER(rt.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<RoomType> searchByName(@Param("keyword") String keyword, Pageable pageable);
    
    // Search room types by name or description
    @Query("SELECT rt FROM RoomType rt WHERE " +
           "LOWER(rt.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rt.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<RoomType> searchByNameOrDescription(@Param("keyword") String keyword, Pageable pageable);
    
    // Find room types with filters
    @Query("SELECT rt FROM RoomType rt WHERE " +
           "(:hotelId IS NULL OR rt.hotel.id = :hotelId) AND " +
           "(:minOccupancy IS NULL OR rt.maxOccupancy >= :minOccupancy) AND " +
           "(:maxOccupancy IS NULL OR rt.maxOccupancy <= :maxOccupancy) AND " +
           "(:minPrice IS NULL OR rt.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR rt.pricePerNight <= :maxPrice)")
    Page<RoomType> findWithFilters(@Param("hotelId") UUID hotelId,
                                  @Param("minOccupancy") Integer minOccupancy,
                                  @Param("maxOccupancy") Integer maxOccupancy,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  Pageable pageable);

    long countByHotel(Hotel hotel);
    long countByHotelId(UUID hotelId);

    boolean existsByNameAndHotel(String name, Hotel hotel);
    boolean existsByNameAndHotelId(String name, UUID hotelId);

    @Query("SELECT SUM(rt.totalRooms) FROM RoomType rt WHERE rt.hotel.id = :hotelId")
    Long getTotalRoomsByHotel(@Param("hotelId") UUID hotelId);
    
    @Query("SELECT SUM(rt.availableRooms) FROM RoomType rt WHERE rt.hotel.id = :hotelId")
    Long getAvailableRoomsByHotel(@Param("hotelId") UUID hotelId);

    @Query("SELECT MIN(rt.pricePerNight) FROM RoomType rt WHERE rt.hotel.id = :hotelId")
    BigDecimal getMinPriceByHotel(@Param("hotelId") UUID hotelId);
    
    @Query("SELECT MAX(rt.pricePerNight) FROM RoomType rt WHERE rt.hotel.id = :hotelId")
    BigDecimal getMaxPriceByHotel(@Param("hotelId") UUID hotelId);
    
    // Host statistics queries
    @Query("SELECT COUNT(rt) FROM RoomType rt WHERE rt.hotel.owner.id = :hostId")
    Long countByHostId(@Param("hostId") UUID hostId);
    
    @Query("SELECT SUM(rt.totalRooms) FROM RoomType rt WHERE rt.hotel.owner.id = :hostId")
    Long getTotalRoomsByHost(@Param("hostId") UUID hostId);
} 