package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.request.HotelCreateRequest;
import net.blwsmartware.booking.dto.request.HotelUpdateRequest;
import net.blwsmartware.booking.dto.response.HotelResponse;
import net.blwsmartware.booking.entity.Hotel;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RoomTypeMapper.class, ReviewMapper.class})
public interface HotelMapper {
    
    // Convert Hotel entity to HotelResponse with full details
    @Named("toResponse")
    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerName", source = "owner.name")
    @Mapping(target = "ownerEmail", source = "owner.email")
    @Mapping(target = "isActive", source = "active")
    @Mapping(target = "isFeatured", source = "featured")
    @Mapping(target = "totalRoomTypes", ignore = true) // Will be set manually
    @Mapping(target = "totalRooms", ignore = true) // Will be set manually
    @Mapping(target = "availableRooms", ignore = true) // Will be set manually
    @Mapping(target = "averageRating", ignore = true) // Will be set manually
    @Mapping(target = "totalReviews", ignore = true) // Will be set manually
    @Mapping(target = "roomTypes", source = "roomTypes", qualifiedByName = "toResponse")
    @Mapping(target = "recentReviews", source = "reviews", qualifiedByName = "toResponseWithoutHotel")
    HotelResponse toResponse(Hotel hotel);
    
    // Convert Hotel entity to HotelResponse without relationships (for list view)
    @Named("toResponseWithoutRelations")
    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "ownerName", source = "owner.name")
    @Mapping(target = "ownerEmail", source = "owner.email")
    @Mapping(target = "isActive", source = "active")
    @Mapping(target = "isFeatured", source = "featured")
    @Mapping(target = "totalRoomTypes", ignore = true)
    @Mapping(target = "totalRooms", ignore = true)
    @Mapping(target = "availableRooms", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "roomTypes", ignore = true)
    @Mapping(target = "recentReviews", ignore = true)
    HotelResponse toResponseWithoutRelations(Hotel hotel);
    
    // Convert HotelCreateRequest to Hotel entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true) // Will be set manually
    @Mapping(target = "location", expression = "java(buildLocation(request.getAddress(), request.getCity(), request.getCountry()))")
    @Mapping(target = "roomTypes", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Hotel toEntity(HotelCreateRequest request);
    
    // Update Hotel entity from HotelUpdateRequest
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "location", expression = "java(buildLocationForUpdate(request.getAddress(), request.getCity(), request.getCountry(), hotel.getAddress(), hotel.getCity(), hotel.getCountry()))")
    @Mapping(target = "roomTypes", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Hotel hotel, HotelUpdateRequest request);
    
    // Convert list of Hotel entities to list of HotelResponse with full details
    @IterableMapping(qualifiedByName = "toResponse")
    List<HotelResponse> toResponseList(List<Hotel> hotels);
    
    // Convert list of Hotel entities to list of HotelResponse without relations
    @IterableMapping(qualifiedByName = "toResponseWithoutRelations")
    List<HotelResponse> toResponseListWithoutRelations(List<Hotel> hotels);
    
    // Helper method to build location string
    default String buildLocation(String address, String city, String country) {
        StringBuilder location = new StringBuilder();
        if (address != null && !address.trim().isEmpty()) {
            location.append(address.trim());
        }
        if (city != null && !city.trim().isEmpty()) {
            if (location.length() > 0) location.append(", ");
            location.append(city.trim());
        }
        if (country != null && !country.trim().isEmpty()) {
            if (location.length() > 0) location.append(", ");
            location.append(country.trim());
        }
        return location.length() > 0 ? location.toString() : null;
    }
    
    // Helper method to build location string for updates (handles null values)
    default String buildLocationForUpdate(String newAddress, String newCity, String newCountry, 
                                        String currentAddress, String currentCity, String currentCountry) {
        String address = newAddress != null ? newAddress : currentAddress;
        String city = newCity != null ? newCity : currentCity;
        String country = newCountry != null ? newCountry : currentCountry;
        return buildLocation(address, city, country);
    }
} 