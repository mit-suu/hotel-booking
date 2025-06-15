package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.HotelCreateRequest;
import net.blwsmartware.booking.dto.request.HotelUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.HotelResponse;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.exception.AppException;
import net.blwsmartware.booking.exception.ErrorCode;
import net.blwsmartware.booking.mapper.HotelMapper;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.HotelService;
import net.blwsmartware.booking.util.DataResponseUtils;
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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HotelServiceImpl implements HotelService {

    HotelRepository hotelRepository;
    UserRepository userRepository;
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
    public HotelResponse getHotelById(UUID id) {
        log.info("Getting hotel by ID: {}", id);

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        HotelResponse response = hotelMapper.toResponse(hotel);

        return response;
    }

    @Override
    @IsAdmin
    @Transactional
    public HotelResponse toggleFeaturedStatus(UUID id) {
        log.info("Toggling hotel featured status: {}", id);

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        hotel.setFeatured(!hotel.isFeatured());
        hotel.setUpdatedBy(getCurrentUserId());

        Hotel updatedHotel = hotelRepository.save(hotel);

        return hotelMapper.toResponse(updatedHotel);
    }

    @Override
    public DataResponse<HotelResponse> searchHotels(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching hotels with keyword: {}", keyword);

        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.searchByNameOrCityOrCountry(keyword, pageable);

        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();

        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }

    @Override
    public DataResponse<HotelResponse> getHotelsByOwner(UUID ownerId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by owner: {}", ownerId);

        // Validate owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

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
    @IsAdmin
    public Long getHotelsCountByOwner(UUID ownerId) {
        // Validate owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

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
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }

    /**
     * Validate that the current user owns the specified hotel
     */
    private void validateHotelOwnership(UUID hotelId) {
        UUID currentUserId = getCurrentUserId();
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        if (!hotel.getOwner().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.HOTEL_ACCESS_DENIED);
        }
    }

    /**
     * Get hotel by ID and validate ownership
     */
    private Hotel getMyHotelEntity(UUID hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        UUID currentUserId = getCurrentUserId();
        if (!hotel.getOwner().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.HOTEL_ACCESS_DENIED);
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

        // Host can only create hotel for themselves
        User currentUser = getCurrentUser();

        // Check if hotel name already exists in the same city
        if (hotelRepository.existsByNameAndCity(request.getName(), request.getCity())) {
            throw new AppException(ErrorCode.HOTEL_NAME_ALREADY_EXISTS);
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

        Hotel hotel = getMyHotelEntity(id);

        // Check if new name conflicts with existing hotels in the same city
        if (request.getName() != null && !request.getName().equals(hotel.getName())) {
            String city = request.getCity() != null ? request.getCity() : hotel.getCity();
            if (hotelRepository.existsByNameAndCity(request.getName(), city)) {
                throw new AppException(ErrorCode.HOTEL_NAME_ALREADY_EXISTS);
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
    public DataResponse<HotelResponse> searchHotelsWithFilters(
            String city, String country, Integer starRating,
            BigDecimal minPrice, BigDecimal maxPrice, String amenities,
            Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching hotels with filters - city: {}, country: {}, stars: {}, minPrice: {}, maxPrice: {}, amenities: {}",
                city, country, starRating, minPrice, maxPrice, amenities);

        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findWithFiltersAndAmenities(
                city, country, starRating, true, null, minPrice, maxPrice, amenities, pageable);

        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponseWithoutRelations)
                .toList();

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
}