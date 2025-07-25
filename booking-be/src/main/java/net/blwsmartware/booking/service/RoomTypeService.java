package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.RoomTypeCreateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.RoomTypeResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface RoomTypeService {
    
    // Admin operations
    DataResponse<RoomTypeResponse> getAllRoomTypes(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<RoomTypeResponse> getAllRoomTypesWithFilters(
            UUID hotelId, Integer minOccupancy, Integer maxOccupancy,
            BigDecimal minPrice, BigDecimal maxPrice, Integer pageNumber, Integer pageSize, String sortBy);
    RoomTypeResponse getRoomTypeById(UUID id);
    RoomTypeResponse createRoomType(RoomTypeCreateRequest request);
    RoomTypeResponse updateRoomType(UUID id, RoomTypeCreateRequest request);
    void deleteRoomType(UUID id);

    // Host operations
    DataResponse<RoomTypeResponse> getMyRoomTypes(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<RoomTypeResponse> getMyHotelRoomTypes(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    RoomTypeResponse getMyRoomTypeById(UUID id);
    RoomTypeResponse createMyRoomType(RoomTypeCreateRequest request);
    RoomTypeResponse updateMyRoomType(UUID id, RoomTypeCreateRequest request);
    void deleteMyRoomType(UUID id);

    // Hotel-specific operations
    DataResponse<RoomTypeResponse> getRoomTypesByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<RoomTypeResponse> getAvailableRoomTypesByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Search and filter operations
    DataResponse<RoomTypeResponse> searchRoomTypes(String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<RoomTypeResponse> getRoomTypesByOccupancy(Integer minOccupancy, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<RoomTypeResponse> getRoomTypesByPriceRange(
            BigDecimal minPrice, BigDecimal maxPrice, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<RoomTypeResponse> getAvailableRoomTypes(Integer pageNumber, Integer pageSize, String sortBy);
    
    // Statistics
    Long getTotalRoomTypesCount();
    Long getRoomTypesCountByHotel(UUID hotelId);
    Long getMyRoomTypesCount();
    
    // Validation methods
    boolean isRoomTypeNameExistsForHotel(String name, UUID hotelId);
} 