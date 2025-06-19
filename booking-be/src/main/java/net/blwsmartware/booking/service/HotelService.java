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
    DataResponse<HotelResponse> getAllHotelsWithFilters(
            String city, String country, Integer starRating, Boolean isActive, Boolean isFeatured,
            BigDecimal minPrice, BigDecimal maxPrice, Integer pageNumber, Integer pageSize, String sortBy);
    HotelResponse createHotelByAdmin(HotelCreateRequest request);
    HotelResponse updateHotelByAdmin(UUID id, HotelUpdateRequest request);
    void deleteHotelByAdmin(UUID id);
    HotelResponse toggleHotelStatus(UUID id);
    HotelResponse toggleFeaturedStatus(UUID id);
    DataResponse<HotelResponse> getHotelsByOwner(UUID ownerId, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Admin Statistics
    Long getTotalHotelsCount();
    Long getActiveHotelsCount();
    Long getFeaturedHotelsCount();
    Long getHotelsCountByOwner(UUID ownerId);
    
    // ===== HOST OPERATIONS =====
    DataResponse<HotelResponse> getMyHotels(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getMyHotelsWithFilters(
            String city, String country, Integer starRating, Boolean isActive,
            Integer pageNumber, Integer pageSize, String sortBy);
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
    DataResponse<HotelResponse> getHotelsByCity(String city, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getHotelsByCountry(String country, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getHotelsByStarRating(Integer starRating, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getActiveHotels(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getFeaturedHotels(Integer pageNumber, Integer pageSize, String sortBy);
    
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