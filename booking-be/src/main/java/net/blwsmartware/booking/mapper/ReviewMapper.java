package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.response.ReviewResponse;
import net.blwsmartware.booking.entity.Review;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    
    // Default mapping method - full response with all info
    @Named("toResponse")
    @Mapping(target = "hotelId", source = "hotel.id")
    @Mapping(target = "hotelName", source = "hotel.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "userEmail", source = "user.email")
    ReviewResponse toResponse(Review review);
    
    // Public response without user email
    @Named("toPublicResponse")
    @Mapping(target = "hotelId", source = "hotel.id")
    @Mapping(target = "hotelName", source = "hotel.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "userEmail", ignore = true)
    ReviewResponse toPublicResponse(Review review);
    
    // Response without hotel info (for nested use in hotel details)
    @Named("toResponseWithoutHotel")
    @Mapping(target = "hotelId", ignore = true)
    @Mapping(target = "hotelName", ignore = true)
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "userEmail", ignore = true)
    ReviewResponse toResponseWithoutHotel(Review review);
    
    // List mappings with explicit qualifiers
    @IterableMapping(qualifiedByName = "toResponse")
    List<ReviewResponse> toResponseList(List<Review> reviews);
    
    @IterableMapping(qualifiedByName = "toPublicResponse")
    List<ReviewResponse> toPublicResponseList(List<Review> reviews);
    
    @IterableMapping(qualifiedByName = "toResponseWithoutHotel")
    List<ReviewResponse> toResponseListWithoutHotel(List<Review> reviews);
} 