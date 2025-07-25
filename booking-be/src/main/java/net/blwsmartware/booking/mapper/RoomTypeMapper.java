package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.request.RoomTypeCreateRequest;
import net.blwsmartware.booking.dto.response.RoomTypeResponse;
import net.blwsmartware.booking.entity.RoomType;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomTypeMapper {
    
    // Convert RoomType entity to RoomTypeResponse with full details
    @Named("toResponse")
    @Mapping(target = "hotelId", source = "hotel.id")
    @Mapping(target = "hotelName", source = "hotel.name")
    RoomTypeResponse toResponse(RoomType roomType);
    
    // Convert RoomType entity to RoomTypeResponse without hotel info (for nested use)
    @Named("toResponseWithoutHotel")
    @Mapping(target = "hotelId", ignore = true)
    @Mapping(target = "hotelName", ignore = true)
    RoomTypeResponse toResponseWithoutHotel(RoomType roomType);
    
    // Convert RoomTypeCreateRequest to RoomType entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hotel", ignore = true) // Will be set manually
    @Mapping(target = "availableRooms", source = "totalRooms") // Initially all rooms are available
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    RoomType toEntity(RoomTypeCreateRequest request);
    
    // Update RoomType entity from RoomTypeCreateRequest (for updates)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hotel", ignore = true)
    @Mapping(target = "availableRooms", ignore = true) // Don't auto-update available rooms
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget RoomType roomType, RoomTypeCreateRequest request);
    
    // Convert list of RoomType entities to list of RoomTypeResponse with full details
    @IterableMapping(qualifiedByName = "toResponse")
    List<RoomTypeResponse> toResponseList(List<RoomType> roomTypes);
    
    // Convert list of RoomType entities to list of RoomTypeResponse without hotel info
    @IterableMapping(qualifiedByName = "toResponseWithoutHotel")
    List<RoomTypeResponse> toResponseListWithoutHotel(List<RoomType> roomTypes);
} 