package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.RoomTypeCreateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.RoomTypeResponse;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.RoomType;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.mapper.RoomTypeMapper;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.RoomTypeRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.RoomTypeService;
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
public class RoomTypeServiceImpl implements RoomTypeService {
    
    RoomTypeRepository roomTypeRepository;
    HotelRepository hotelRepository;
    UserRepository userRepository;
    RoomTypeMapper roomTypeMapper;
    
    @Override
    @IsAdmin
    public DataResponse<RoomTypeResponse> getAllRoomTypes(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting all room types with pagination: page={}, size={}, sortBy={}", pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findAll(pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    @IsAdmin
    public DataResponse<RoomTypeResponse> getAllRoomTypesWithFilters(
            UUID hotelId, Integer minOccupancy, Integer maxOccupancy,
            BigDecimal minPrice, BigDecimal maxPrice, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting room types with filters - hotel: {}, occupancy: {}-{}, price: {}-{}", 
                hotelId, minOccupancy, maxOccupancy, minPrice, maxPrice);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findWithFilters(
                hotelId, minOccupancy, maxOccupancy, minPrice, maxPrice, pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    public RoomTypeResponse getRoomTypeById(UUID id) {
        log.info("Getting room type by ID: {}", id);
        
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROOM_TYPE_NOT_FOUND));
        
        return roomTypeMapper.toResponse(roomType);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public RoomTypeResponse createRoomType(RoomTypeCreateRequest request) {
        log.info("Creating new room type: {} for hotel: {}", request.getName(), request.getHotelId());
        
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        // Check if room type name already exists for this hotel
        if (roomTypeRepository.existsByNameAndHotel(request.getName(), hotel)) {
            throw new AppRuntimeException(ErrorResponse.ROOM_TYPE_NAME_ALREADY_EXISTS);
        }
        
        // Convert request to entity
        RoomType roomType = roomTypeMapper.toEntity(request);
        roomType.setHotel(hotel);
        roomType.setCreatedBy(getCurrentUserId());
        roomType.setUpdatedBy(getCurrentUserId());
        
        // Save room type
        RoomType savedRoomType = roomTypeRepository.save(roomType);
        
        return roomTypeMapper.toResponse(savedRoomType);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public RoomTypeResponse updateRoomType(UUID id, RoomTypeCreateRequest request) {
        log.info("Updating room type: {}", id);
        
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROOM_TYPE_NOT_FOUND));
        
        // Check if new name conflicts with existing room types for the same hotel
        if (request.getName() != null && !request.getName().equals(roomType.getName())) {
            if (roomTypeRepository.existsByNameAndHotel(request.getName(), roomType.getHotel())) {
                throw new AppRuntimeException(ErrorResponse.ROOM_TYPE_NAME_ALREADY_EXISTS);
            }
        }
        
        // Update room type
        roomTypeMapper.updateEntity(roomType, request);
        roomType.setUpdatedBy(getCurrentUserId());
        
        RoomType updatedRoomType = roomTypeRepository.save(roomType);
        
        return roomTypeMapper.toResponse(updatedRoomType);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public void deleteRoomType(UUID id) {
        log.info("Deleting room type: {}", id);
        
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROOM_TYPE_NOT_FOUND));
        
        // TODO: Check if room type has any bookings when booking entity is implemented
        // For now, we'll allow deletion
        
        roomTypeRepository.delete(roomType);
    }

    @Override
    public DataResponse<RoomTypeResponse> getRoomTypesByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting room types by hotel: {}", hotelId);
        
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findByHotelId(hotelId, pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    public DataResponse<RoomTypeResponse> getAvailableRoomTypesByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting available room types by hotel: {}", hotelId);
        
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findByHotelIdAndAvailableRoomsGreaterThan(hotelId, 0, pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponseWithoutHotel)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    public DataResponse<RoomTypeResponse> searchRoomTypes(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching room types with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.searchByNameOrDescription(keyword, pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    public DataResponse<RoomTypeResponse> getRoomTypesByOccupancy(Integer minOccupancy, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting room types by occupancy: {}", minOccupancy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findByMaxOccupancyGreaterThanEqual(minOccupancy, pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    public DataResponse<RoomTypeResponse> getRoomTypesByPriceRange(
            BigDecimal minPrice, BigDecimal maxPrice, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting room types by price range: {} - {}", minPrice, maxPrice);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findByPricePerNightBetween(minPrice, maxPrice, pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    public DataResponse<RoomTypeResponse> getAvailableRoomTypes(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting available room types");
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findAvailableRoomTypes(pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    @IsAdmin
    public Long getTotalRoomTypesCount() {
        return roomTypeRepository.count();
    }
    
    @Override
    @IsAdmin
    public Long getRoomTypesCountByHotel(UUID hotelId) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        return roomTypeRepository.countByHotelId(hotelId);
    }
    
    @Override
    public boolean isRoomTypeNameExistsForHotel(String name, UUID hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        return roomTypeRepository.existsByNameAndHotel(name, hotel);
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

    // Host operations
    @Override
    @IsHost
    public DataResponse<RoomTypeResponse> getMyRoomTypes(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting my room types for host: {}", getCurrentUserId());
        
        UUID hostId = getCurrentUserId();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findByHostId(hostId, pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    @IsHost
    public DataResponse<RoomTypeResponse> getMyHotelRoomTypes(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting room types for my hotel: {} by host: {}", hotelId, getCurrentUserId());
        
        UUID hostId = getCurrentUserId();
        
        // Validate hotel exists and belongs to the host
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        if (!hotel.getOwner().getId().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHORIZED);
        }
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<RoomType> roomTypePage = roomTypeRepository.findByHotelId(hotelId, pageable);
        
        List<RoomTypeResponse> roomTypeResponses = roomTypePage.getContent().stream()
                .map(roomTypeMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(roomTypePage, roomTypeResponses);
    }
    
    @Override
    @IsHost
    public RoomTypeResponse getMyRoomTypeById(UUID id) {
        log.info("Getting my room type by ID: {} for host: {}", id, getCurrentUserId());
        
        UUID hostId = getCurrentUserId();
        
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROOM_TYPE_NOT_FOUND));
        
        // Validate room type belongs to the host
        if (!roomType.getHotel().getOwner().getId().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHORIZED);
        }
        
        return roomTypeMapper.toResponse(roomType);
    }
    
    @Override
    @IsHost
    @Transactional
    public RoomTypeResponse createMyRoomType(RoomTypeCreateRequest request) {
        log.info("Creating new room type: {} for hotel: {} by host: {}", 
                request.getName(), request.getHotelId(), getCurrentUserId());
        
        UUID hostId = getCurrentUserId();
        
        // Validate hotel exists and belongs to the host
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        if (!hotel.getOwner().getId().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHORIZED);
        }
        
        // Check if room type name already exists for this hotel
        if (roomTypeRepository.existsByNameAndHotel(request.getName(), hotel)) {
            throw new AppRuntimeException(ErrorResponse.ROOM_TYPE_NAME_ALREADY_EXISTS);
        }
        
        // Convert request to entity
        RoomType roomType = roomTypeMapper.toEntity(request);
        roomType.setHotel(hotel);
        roomType.setCreatedBy(hostId);
        roomType.setUpdatedBy(hostId);
        
        // Save room type
        RoomType savedRoomType = roomTypeRepository.save(roomType);
        
        return roomTypeMapper.toResponse(savedRoomType);
    }
    
    @Override
    @IsHost
    @Transactional
    public RoomTypeResponse updateMyRoomType(UUID id, RoomTypeCreateRequest request) {
        log.info("Updating my room type: {} by host: {}", id, getCurrentUserId());
        
        UUID hostId = getCurrentUserId();
        
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROOM_TYPE_NOT_FOUND));
        
        // Validate room type belongs to the host
        if (!roomType.getHotel().getOwner().getId().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHORIZED);
        }
        
        // Check if new name conflicts with existing room types for the same hotel
        if (request.getName() != null && !request.getName().equals(roomType.getName())) {
            if (roomTypeRepository.existsByNameAndHotel(request.getName(), roomType.getHotel())) {
                throw new AppRuntimeException(ErrorResponse.ROOM_TYPE_NAME_ALREADY_EXISTS);
            }
        }
        
        // Update room type
        roomTypeMapper.updateEntity(roomType, request);
        roomType.setUpdatedBy(hostId);
        
        RoomType updatedRoomType = roomTypeRepository.save(roomType);
        
        return roomTypeMapper.toResponse(updatedRoomType);
    }
    
    @Override
    @IsHost
    @Transactional
    public void deleteMyRoomType(UUID id) {
        log.info("Deleting my room type: {} by host: {}", id, getCurrentUserId());
        
        UUID hostId = getCurrentUserId();
        
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROOM_TYPE_NOT_FOUND));
        
        // Validate room type belongs to the host
        if (!roomType.getHotel().getOwner().getId().equals(hostId)) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHORIZED);
        }
        
        // TODO: Check if room type has any bookings when booking entity is implemented
        // For now, we'll allow deletion
        
        roomTypeRepository.delete(roomType);
    }
} 