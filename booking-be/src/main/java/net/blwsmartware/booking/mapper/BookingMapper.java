package net.blwsmartware.booking.mapper;

import net.blwsmartware.booking.dto.request.BookingCreateRequest;
import net.blwsmartware.booking.dto.request.BookingUpdateRequest;
import net.blwsmartware.booking.dto.response.BookingResponse;
import net.blwsmartware.booking.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.temporal.ChronoUnit;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BookingMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hotel", ignore = true)
    @Mapping(target = "roomType", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "paymentStatus", ignore = true)
    @Mapping(target = "bookingReference", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Booking toEntity(BookingCreateRequest request);
    
    @Mapping(target = "hotelId", source = "hotel.id")
    @Mapping(target = "hotelName", source = "hotel.name")
    @Mapping(target = "hotelAddress", source = "hotel.address")
    @Mapping(target = "hotelPhone", source = "hotel.phone")
    @Mapping(target = "hotelEmail", source = "hotel.email")
    @Mapping(target = "roomTypeId", source = "roomType.id")
    @Mapping(target = "roomTypeName", source = "roomType.name")
    @Mapping(target = "roomDescription", source = "roomType.description")
    @Mapping(target = "maxOccupancy", source = "roomType.maxOccupancy")
    @Mapping(target = "bedType", source = "roomType.bedType")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.name")
    @Mapping(target = "numberOfNights", expression = "java(calculateNumberOfNights(booking))")
    @Mapping(target = "pricePerNight", source = "roomType.pricePerNight")
    BookingResponse toResponse(Booking booking);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "hotel", ignore = true)
    @Mapping(target = "roomType", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "bookingReference", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    void updateEntity(@MappingTarget Booking booking, BookingUpdateRequest request);
    
    default Integer calculateNumberOfNights(Booking booking) {
        if (booking.getCheckInDate() != null && booking.getCheckOutDate() != null) {
            return (int) ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        }
        return null;
    }
} 