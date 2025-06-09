package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.HotelCreateRequest;
import net.blwsmartware.booking.dto.request.HotelUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.HotelResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface HotelService {

    // ===== ADMIN OPERATIONS =====
    DataResponse<HotelResponse> getAllHotels(Integer pageNumber, Integer pageSize, String sortBy);
    HotelResponse toggleFeaturedStatus(UUID id);
    DataResponse<HotelResponse> getHotelsByOwner(UUID ownerId, Integer pageNumber, Integer pageSize, String sortBy);

    // Admin Statistics
    Long getHotelsCountByOwner(UUID ownerId);

    // ===== HOST OPERATIONS =====
    DataResponse<HotelResponse> getMyHotels(Integer pageNumber, Integer pageSize, String sortBy);

    HotelResponse getMyHotelById(UUID id);
    HotelResponse createMyHotel(HotelCreateRequest request);
    HotelResponse updateMyHotel(UUID id, HotelUpdateRequest request);
    void deleteMyHotel(UUID id);
    HotelResponse toggleMyHotelStatus(UUID id);

    // Host Statistics
    Long getMyHotelsCount();
    Long getMyActiveHotelsCount();

    // ===== PUBLIC OPERATIONS =====
    HotelResponse getHotelById(UUID id);
    DataResponse<HotelResponse> searchHotels(String keyword, Integer pageNumber, Integer pageSize, String sortBy);

    // New search with filters method
    DataResponse<HotelResponse> searchHotelsWithFilters(
            String city, String country, Integer starRating,
            BigDecimal minPrice, BigDecimal maxPrice, String amenities,
            Integer pageNumber, Integer pageSize, String sortBy);

    // Get available amenities
    List<String> getAvailableAmenities();

    // ===== UTILITY METHODS =====
    boolean isHotelNameExistsInCity(String name, String city);
}