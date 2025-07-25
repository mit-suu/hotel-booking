package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.HotelCreateRequest;
import net.blwsmartware.booking.dto.request.HotelUpdateRequest;
import net.blwsmartware.booking.dto.response.CityStatsResponse;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.HostDashboardResponse;
import net.blwsmartware.booking.dto.response.HotelResponse;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.entity.RoomType;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.mapper.HotelMapper;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.ReviewRepository;
import net.blwsmartware.booking.repository.RoomTypeRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.service.HotelService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.util.TextUtils;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HotelServiceImpl implements HotelService {
    
    HotelRepository hotelRepository;
    UserRepository userRepository;
    ReviewRepository reviewRepository;
    RoomTypeRepository roomTypeRepository;
    BookingRepository bookingRepository;
    HotelMapper hotelMapper;
    
    @Override
    @IsAdmin
    public DataResponse<HotelResponse> getAllHotels(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting all hotels with pagination: page={}, size={}, sortBy={}", pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findAll(pageable);
        
        // Debug: Log raw entities from database
        log.info("=== DATABASE ENTITIES DEBUG ===");
        log.info("Total hotels from DB: {}", hotelPage.getContent().size());
        hotelPage.getContent().forEach((hotel) -> {
            log.info("DB Hotel: {}", hotel.getName());
            log.info("  - ID: {}", hotel.getId());
            log.info("  - isActive: {} (type: {})", hotel.isActive(), hotel.isActive() ? "true" : "false");
            log.info("  - isFeatured: {} (type: {})", hotel.isFeatured(), hotel.isFeatured() ? "true" : "false");
        });
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        // Populate review data
        populateReviewData(hotelResponses);
        // Populate room data
        populateRoomData(hotelResponses);
        
        // Debug: Log mapped responses
        log.info("=== MAPPED RESPONSES DEBUG ===");
        log.info("Total hotel responses: {}", hotelResponses.size());
        hotelResponses.forEach((response) -> {
            log.info("Response : {}", response.getName());
            log.info("  - ID: {}", response.getId());
            log.info("  - isActive: {} (type: {})", response.isActive(), response.isActive() ? "true" : "false");
            log.info("  - isFeatured: {} (type: {})", response.isFeatured(), response.isFeatured() ? "true" : "false");
            log.info("  - averageRating: {}", response.getAverageRating());
            log.info("  - totalReviews: {}", response.getTotalReviews());
        });
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    @IsAdmin
    public DataResponse<HotelResponse> getAllHotelsWithFilters(
            String city, String country, Integer starRating, Boolean isActive, Boolean isFeatured,
            BigDecimal minPrice, BigDecimal maxPrice, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels with filters - city: {}, country: {}, stars: {}, active: {}, featured: {}", 
                city, country, starRating, isActive, isFeatured);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findWithFilters(
                city, country, starRating, isActive, isFeatured, minPrice, maxPrice, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        // Populate review data
        populateReviewData(hotelResponses);
        // Populate room data
        populateRoomData(hotelResponses);
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public HotelResponse getHotelById(UUID id) {
        log.info("Getting hotel by ID: {} (public API)", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        // Public API should only return active hotels
        if (!hotel.isActive()) {
            log.warn("Attempt to access inactive hotel: {} (ID: {})", hotel.getName(), hotel.getId());
            throw new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND);
        }
        
        HotelResponse response = hotelMapper.toResponse(hotel);
        populateReviewData(response);
        populateRoomData(response);
        
        return response;
    }
    
    @Override
    @IsAdmin
    public HotelResponse getHotelByIdForAdmin(UUID id) {
        log.info("Getting hotel by ID: {} (admin API)", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        // Admin can access hotels regardless of status
        HotelResponse response = hotelMapper.toResponse(hotel);
        populateReviewData(response);
        populateRoomData(response);
        
        return response;
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse createHotelByAdmin(HotelCreateRequest request) {
        log.info("Admin creating new hotel: {}", request.getName());
        
        // Normalize city and country names (remove Vietnamese diacritics, capitalize words)
        if (request.getCity() != null) {
            String normalizedCity = TextUtils.normalizeCityName(request.getCity());
            log.info("Normalized city: '{}' -> '{}'", request.getCity(), normalizedCity);
            request.setCity(normalizedCity);
        }
        
        if (request.getCountry() != null) {
            String normalizedCountry = TextUtils.normalizeCountryName(request.getCountry());
            log.info("Normalized country: '{}' -> '{}'", request.getCountry(), normalizedCountry);
            request.setCountry(normalizedCountry);
        }
        
        // Determine owner - use provided ownerId or current user
        User owner;
        if (request.getOwnerId() != null) {
            owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        } else {
            // Use current user as owner if ownerId is not provided
            owner = getCurrentUser();
        }
        
        // Check if hotel name already exists in the same city (using normalized city)
        if (hotelRepository.existsByNameAndCity(request.getName(), request.getCity())) {
            throw new AppRuntimeException(ErrorResponse.HOTEL_NAME_ALREADY_EXISTS);
        }

        log.info("Admin creating hotel with normalized request: {}", request);
        
        // Convert request to entity
        Hotel hotel = hotelMapper.toEntity(request);
        log.info("Hotel entity created: {}", hotel);
        hotel.setOwner(owner);
        hotel.setCreatedBy(getCurrentUserId());
        hotel.setUpdatedBy(getCurrentUserId());
        
        // Save hotel
        Hotel savedHotel = hotelRepository.save(hotel);
        log.info("Admin done");
        return hotelMapper.toResponse(savedHotel);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse updateHotelByAdmin(UUID id, HotelUpdateRequest request) {
        log.info("Admin updating hotel: {}", id);

        // Normalize city and country names if provided
        if (request.getCity() != null) {
            String normalizedCity = TextUtils.normalizeCityName(request.getCity());
            log.info("Normalized city: '{}' -> '{}'", request.getCity(), normalizedCity);
            request.setCity(normalizedCity);
        }
        
        if (request.getCountry() != null) {
            String normalizedCountry = TextUtils.normalizeCountryName(request.getCountry());
            log.info("Normalized country: '{}' -> '{}'", request.getCountry(), normalizedCountry);
            request.setCountry(normalizedCountry);
        }

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));

        // Check if new name conflicts with existing hotels in the same city (using normalized city)
        if (request.getName() != null && !request.getName().equals(hotel.getName())) {
            String city = request.getCity() != null ? request.getCity() : hotel.getCity();
            if (hotelRepository.existsByNameAndCity(request.getName(), city)) {
                throw new AppRuntimeException(ErrorResponse.HOTEL_NAME_ALREADY_EXISTS);
            }
        }

        // Handle owner change (only admin can do this)
        if (request.getOwnerId() != null && !request.getOwnerId().equals(hotel.getOwner().getId())) {
            log.info("Admin changing hotel owner from {} to {}", hotel.getOwner().getId(), request.getOwnerId());
            
            // Validate new owner exists
            User newOwner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
            
            hotel.setOwner(newOwner);
        }

        // Update hotel
        hotelMapper.updateEntity(hotel, request);
        hotel.setUpdatedBy(getCurrentUserId());

        Hotel updatedHotel = hotelRepository.save(hotel);

        return hotelMapper.toResponse(updatedHotel);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public void deleteHotelByAdmin(UUID id) {
        log.info("Admin deleting hotel: {}", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        // TODO: Check if hotel has any bookings when booking entity is implemented
        // For now, we'll allow deletion
        
        hotelRepository.delete(hotel);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse toggleHotelStatus(UUID id) {
        log.info("Toggling hotel status: {}", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        // Debug: Before toggle
        log.info("=== TOGGLE STATUS DEBUG ===");
        log.info("Before toggle - Hotel: {} (ID: {})", hotel.getName(), hotel.getId());
        log.info("  - Current isActive: {}", hotel.isActive());
        log.info("  - Current isFeatured: {}", hotel.isFeatured());
        
        hotel.setActive(!hotel.isActive());
        hotel.setUpdatedBy(getCurrentUserId());
        
        // Debug: After toggle, before save
        log.info("After toggle - Hotel: {} (ID: {})", hotel.getName(), hotel.getId());
        log.info("  - New isActive: {}", hotel.isActive());
        log.info("  - New isFeatured: {}", hotel.isFeatured());
        
        Hotel updatedHotel = hotelRepository.save(hotel);
        
        // Debug: After save
        log.info("After save - Hotel: {} (ID: {})", updatedHotel.getName(), updatedHotel.getId());
        log.info("  - Saved isActive: {}", updatedHotel.isActive());
        log.info("  - Saved isFeatured: {}", updatedHotel.isFeatured());
        
        HotelResponse response = hotelMapper.toResponse(updatedHotel);
        
        // Debug: Final response
        log.info("Final response - Hotel: {} (ID: {})", response.getName(), response.getId());
        log.info("  - Response isActive: {}", response.isActive());
        log.info("  - Response isFeatured: {}", response.isFeatured());
        
        return response;
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse toggleFeaturedStatus(UUID id) {
        log.info("Toggling hotel featured status: {}", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        hotel.setFeatured(!hotel.isFeatured());
        hotel.setUpdatedBy(getCurrentUserId());
        
        Hotel updatedHotel = hotelRepository.save(hotel);
        
        return hotelMapper.toResponse(updatedHotel);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse updateCommissionRate(UUID id, BigDecimal commissionRate) {
        log.info("Updating hotel commission rate: {} to {}%", id, commissionRate);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        hotel.setCommissionRate(commissionRate);
        hotel.setUpdatedBy(getCurrentUserId());
        
        Hotel updatedHotel = hotelRepository.save(hotel);
        
        return hotelMapper.toResponse(updatedHotel);
    }
    
    @Override
    public DataResponse<HotelResponse> searchHotels(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching hotels with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.searchActiveByNameOrCityOrCountry(keyword, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        // Populate review data
        populateReviewData(hotelResponses);
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsByCity(String city, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by city: {}", city);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByCityIgnoreCaseAndIsActiveTrue(city, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        // Populate review data
        populateReviewData(hotelResponses);
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsByCountry(String country, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by country: {}", country);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByCountryIgnoreCaseAndIsActiveTrue(country, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsByStarRating(Integer starRating, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by star rating: {}", starRating);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByStarRatingAndIsActiveTrue(starRating, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getActiveHotels(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting active hotels");
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByIsActiveTrue(pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        // Populate review data
        populateReviewData(hotelResponses);
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getFeaturedHotels(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting featured hotels (only active ones for public API)");
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByIsFeaturedTrueAndIsActiveTrue(pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        // Populate review data
        populateReviewData(hotelResponses);
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsByOwner(UUID ownerId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by owner: {}", ownerId);
        
        // Validate owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByOwnerId(ownerId, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponseWithoutRelations)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    @IsHost
    public DataResponse<HotelResponse> getMyHotels(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting current user's hotels");
        
        UUID currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByOwnerId(currentUserId, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponseWithoutRelations)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    @IsHost
    public DataResponse<HotelResponse> getMyHotelsWithFilters(
            String city, String country, Integer starRating, Boolean isActive,
            Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting current user's hotels with filters - city: {}, country: {}, stars: {}, active: {}", 
                city, country, starRating, isActive);
        
        UUID currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findMyHotelsWithFilters(
                currentUserId, city, country, starRating, isActive, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponseWithoutRelations)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    @IsAdmin
    public Long getTotalHotelsCount() {
        return hotelRepository.count();
    }
    
    @Override
    @IsAdmin
    public Long getActiveHotelsCount() {
        return hotelRepository.countByIsActiveTrue();
    }
    
    @Override
    @IsAdmin
    public Long getFeaturedHotelsCount() {
        return hotelRepository.countByIsFeaturedTrue();
    }
    
    @Override
    @IsAdmin
    public Long getHotelsCountByOwner(UUID ownerId) {
        // Validate owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        return hotelRepository.countByOwnerId(ownerId);
    }
    
    @Override
    public boolean isHotelNameExistsInCity(String name, String city) {
        return hotelRepository.existsByNameAndCity(name, city);
    }
    
    // Helper methods
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
    }
    
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }

    private void populateReviewData(HotelResponse response) {
        try {
            UUID hotelId = UUID.fromString(String.valueOf(response.getId()));
            
            // Get average rating
            Double averageRating = hotelRepository.getAverageRating(hotelId).orElse(0.0);
            response.setAverageRating(averageRating);
            
            // Get total reviews count
            Long totalReviews = reviewRepository.countByHotelId(hotelId);
            response.setTotalReviews(totalReviews.intValue());
            
        } catch (Exception e) {
            log.warn("Error populating review data for hotel {}: {}", response.getId(), e.getMessage());
            response.setAverageRating(0.0);
            response.setTotalReviews(0);
        }
    }

    private void populateReviewData(List<HotelResponse> responses) {
        responses.forEach(this::populateReviewData);
    }
    
    /**
     * Validate that the current user owns the specified hotel
     */
    private void validateHotelOwnership(UUID hotelId) {
        UUID currentUserId = getCurrentUserId();
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        if (!hotel.getOwner().getId().equals(currentUserId)) {
            throw new AppRuntimeException(ErrorResponse.HOTEL_ACCESS_DENIED);
        }
    }
    
    /**
     * Get hotel by ID and validate ownership
     */
    private Hotel getMyHotelEntity(UUID hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        UUID currentUserId = getCurrentUserId();
        if (!hotel.getOwner().getId().equals(currentUserId)) {
            throw new AppRuntimeException(ErrorResponse.HOTEL_ACCESS_DENIED);
        }
        
        return hotel;
    }

    // ===== HOST OPERATIONS =====
    
    @Override
    @IsHost
    public HotelResponse getMyHotelById(UUID id) {
        log.info("Host getting hotel details: {}", id);
        
        Hotel hotel = getMyHotelEntity(id);
        return hotelMapper.toResponse(hotel);
    }
    
    @Override
    @IsHost
    @Transactional
    public HotelResponse createMyHotel(HotelCreateRequest request) {
        log.info("Host creating new hotel: {}", request.getName());
        
        // Normalize city and country names (remove Vietnamese diacritics, capitalize words)
        if (request.getCity() != null) {
            String normalizedCity = TextUtils.normalizeCityName(request.getCity());
            log.info("Normalized city: '{}' -> '{}'", request.getCity(), normalizedCity);
            request.setCity(normalizedCity);
        }
        
        if (request.getCountry() != null) {
            String normalizedCountry = TextUtils.normalizeCountryName(request.getCountry());
            log.info("Normalized country: '{}' -> '{}'", request.getCountry(), normalizedCountry);
            request.setCountry(normalizedCountry);
        }
        
        // Host can only create hotel for themselves
        User currentUser = getCurrentUser();
        
        // Check if hotel name already exists in the same city (using normalized city)
        if (hotelRepository.existsByNameAndCity(request.getName(), request.getCity())) {
            throw new AppRuntimeException(ErrorResponse.HOTEL_NAME_ALREADY_EXISTS);
        }
        
        // Convert request to entity
        Hotel hotel = hotelMapper.toEntity(request);
        hotel.setOwner(currentUser);
        hotel.setCreatedBy(getCurrentUserId());
        hotel.setUpdatedBy(getCurrentUserId());
        
        // Host cannot set featured status - only admin can
        hotel.setFeatured(false);
        
        // Save hotel
        Hotel savedHotel = hotelRepository.save(hotel);
        
        return hotelMapper.toResponse(savedHotel);
    }
    
    @Override
    @IsHost  
    @Transactional
    public HotelResponse updateMyHotel(UUID id, HotelUpdateRequest request) {
        log.info("Host updating hotel: {}", id);

        // Normalize city and country names if provided
        if (request.getCity() != null) {
            String normalizedCity = TextUtils.normalizeCityName(request.getCity());
            log.info("Normalized city: '{}' -> '{}'", request.getCity(), normalizedCity);
            request.setCity(normalizedCity);
        }
        
        if (request.getCountry() != null) {
            String normalizedCountry = TextUtils.normalizeCountryName(request.getCountry());
            log.info("Normalized country: '{}' -> '{}'", request.getCountry(), normalizedCountry);
            request.setCountry(normalizedCountry);
        }

        Hotel hotel = getMyHotelEntity(id);

        // Check if new name conflicts with existing hotels in the same city (using normalized city)
        if (request.getName() != null && !request.getName().equals(hotel.getName())) {
            String city = request.getCity() != null ? request.getCity() : hotel.getCity();
            if (hotelRepository.existsByNameAndCity(request.getName(), city)) {
                throw new AppRuntimeException(ErrorResponse.HOTEL_NAME_ALREADY_EXISTS);
            }
        }

        // Save current featured status - host cannot change this
        boolean currentFeaturedStatus = hotel.isFeatured();

        // Update hotel
        hotelMapper.updateEntity(hotel, request);
        hotel.setUpdatedBy(getCurrentUserId());
        
        // Restore featured status - only admin can change this
        hotel.setFeatured(currentFeaturedStatus);

        Hotel updatedHotel = hotelRepository.save(hotel);

        return hotelMapper.toResponse(updatedHotel);
    }
    
    @Override
    @IsHost
    @Transactional
    public void deleteMyHotel(UUID id) {
        log.info("Host deleting hotel: {}", id);
        
        Hotel hotel = getMyHotelEntity(id);
        
        // TODO: Check if hotel has any bookings when booking entity is implemented
        // For now, we'll allow deletion
        
        hotelRepository.delete(hotel);
    }
    
    @Override
    @IsHost
    @Transactional
    public HotelResponse toggleMyHotelStatus(UUID id) {
        log.info("Host toggling hotel status: {}", id);
        
        Hotel hotel = getMyHotelEntity(id);
        
        hotel.setActive(!hotel.isActive());
        hotel.setUpdatedBy(getCurrentUserId());
        
        Hotel updatedHotel = hotelRepository.save(hotel);
        
        return hotelMapper.toResponse(updatedHotel);
    }
    
    // Host Statistics
    @Override
    @IsHost
    public Long getMyHotelsCount() {
        UUID currentUserId = getCurrentUserId();
        return hotelRepository.countByOwnerId(currentUserId);
    }
    
    @Override
    @IsHost  
    public Long getMyActiveHotelsCount() {
        UUID currentUserId = getCurrentUserId();
        return hotelRepository.countByOwnerIdAndIsActiveTrue(currentUserId);
    }
    
    @Override
    @IsHost
    public List<HostDashboardResponse.HotelPerformance> getHostTopPerformingHotels(UUID hostId, int limit) {
        log.info("Getting top performing hotels for host: {}", hostId);
        
        // For now, return a simple implementation based on hotel data
        // This can be enhanced with actual booking performance data
        List<Hotel> hostHotels = hotelRepository.findByOwnerIdAndIsActiveTrueOrderByCreatedAtDesc(hostId);
        
        return hostHotels.stream()
                .limit(limit)
                .map(hotel -> HostDashboardResponse.HotelPerformance.builder()
                        .id(hotel.getId().toString())
                        .name(hotel.getName())
                        .location(hotel.getAddress())
                        .bookings(0L) // TODO: Get actual booking count from BookingRepository
                        .revenue(BigDecimal.ZERO) // TODO: Get actual revenue from BookingRepository
                        .averageRating(0.0) // TODO: Get actual rating from ReviewRepository
                        .occupancyRate(0.0) // TODO: Calculate actual occupancy rate
                        .build())
                .toList();
    }

    @Override
    public DataResponse<HotelResponse> searchHotelsWithFilters(
            String city, String country, Integer starRating, 
            BigDecimal minPrice, BigDecimal maxPrice, String amenities,
            Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching hotels with filters - city: {}, country: {}, stars: {}, minPrice: {}, maxPrice: {}, amenities: {}", 
                city, country, starRating, minPrice, maxPrice, amenities);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findActiveWithFiltersAndAmenities(
                city, country, starRating, null, minPrice, maxPrice, amenities, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponseWithoutRelations)
                .toList();
        
        // Populate review data
        populateReviewData(hotelResponses);
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }

    @Override
    public List<String> getAvailableAmenities() {
        log.info("Getting all available amenities from hotels");
        
        List<String> rawAmenities = hotelRepository.findAllAmenitiesRaw();
        
        // Parse comma-separated amenities and create unique list
        List<String> allAmenities = rawAmenities.stream()
                .filter(amenitiesString -> amenitiesString != null && !amenitiesString.trim().isEmpty())
                .flatMap(amenitiesString -> java.util.Arrays.stream(amenitiesString.split(",")))
                .map(String::trim)
                .filter(amenity -> !amenity.isEmpty())
                .distinct()
                .sorted()
                .toList();
        
        log.info("Found {} unique amenities from {} hotel records", allAmenities.size(), rawAmenities.size());
        
        return allAmenities;
    }

    @Override
    public List<CityStatsResponse> getTopCitiesByHotelCount(int limit) {
        log.info("Getting top {} cities by hotel count", limit);
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> results = hotelRepository.findTopCitiesByHotelCount(pageable);
        
        List<CityStatsResponse> cityStats = results.stream()
                .map(result -> CityStatsResponse.builder()
                        .cityName((String) result[0])
                        .hotelCount((Long) result[1])
                        .build())
                .toList();
        
        log.info("Found {} cities with hotel counts", cityStats.size());
        
        return cityStats;
    }

    private void populateRoomData(HotelResponse response) {
        try {
            UUID hotelId = response.getId(); // getId() already returns UUID
            
            // Get total room types count
            Long totalRoomTypes = roomTypeRepository.countByHotelId(hotelId);
            response.setTotalRoomTypes(totalRoomTypes != null ? totalRoomTypes.intValue() : 0);
            
            // Get total rooms count
            Long totalRooms = roomTypeRepository.getTotalRoomsByHotel(hotelId);
            response.setTotalRooms(totalRooms != null ? totalRooms.intValue() : 0);
            
            // Get available rooms count
            Long availableRooms = roomTypeRepository.getAvailableRoomsByHotel(hotelId);
            response.setAvailableRooms(availableRooms != null ? availableRooms.intValue() : 0);
            
            log.debug("Room statistics populated for hotel {}: {} room types, {} total rooms, {} available rooms", 
                    response.getName(), response.getTotalRoomTypes(), response.getTotalRooms(), response.getAvailableRooms());
                    
        } catch (Exception e) {
            log.error("Error populating room data for hotel {}: {}", response.getId(), e.getMessage());
            // Set default values in case of error
            response.setTotalRoomTypes(0);
            response.setTotalRooms(0);
            response.setAvailableRooms(0);
        }
    }

    private void populateRoomData(List<HotelResponse> responses) {
        responses.forEach(this::populateRoomData);
    }

    @Override
    public int getAvailableRoomsByHotel(UUID hotelId, LocalDate checkInDate, LocalDate checkOutDate) {
        // Lấy tất cả RoomType của khách sạn
        List<RoomType> roomTypes = roomTypeRepository.findByHotelId(hotelId);
        if (roomTypes.isEmpty()) return 0;
        // Lấy tổng số phòng từng loại
        int totalRooms = roomTypes.stream().mapToInt(rt -> rt.getTotalRooms() != null ? rt.getTotalRooms() : 0).sum();
        // Đếm số phòng đã được đặt (không bị hủy) theo từng loại phòng trong khoảng ngày
        List<Object[]> bookedCounts = bookingRepository.countActiveBookingsByHotelAndDateRange(hotelId, checkInDate, checkOutDate);
        int totalBooked = 0;
        for (Object[] row : bookedCounts) {
            Long count = (Long) row[1];
            totalBooked += count != null ? count : 0;
        }
        // Số phòng trống thực tế
        return Math.max(totalRooms - totalBooked, 0);
    }
} 