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

    // Find room types by hotel ID
    Page<RoomType> findByHotelId(UUID hotelId, Pageable pageable);

    // Find room types by host (owner of the hotel)
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.owner.id = :hostId")
    Page<RoomType> findByHostId(@Param("hostId") UUID hostId, Pageable pageable);

    // Find room types by max occupancy
    Page<RoomType> findByMaxOccupancyGreaterThanEqual(Integer minOccupancy, Pageable pageable);

    // Find room types by price range
    Page<RoomType> findByPricePerNightBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    // Find available room types (where availableRooms > 0)
    @Query("SELECT rt FROM RoomType rt WHERE rt.availableRooms > 0")
    Page<RoomType> findAvailableRoomTypes(Pageable pageable);

    // Find room types by hotel ID with available rooms
    Page<RoomType> findByHotelIdAndAvailableRoomsGreaterThan(UUID hotelId, Integer availableRooms, Pageable pageable);

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

    // Count room types by hotel
    long countByHotelId(UUID hotelId);

    // Check if room type name exists for hotel (for validation)
    boolean existsByNameAndHotel(String name, Hotel hotel);

}