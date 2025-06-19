package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    UUID id;
    String guestName;
    String guestEmail;
    String guestPhone;
    
    // Hotel information
    UUID hotelId;
    String hotelName;
    String hotelAddress;
    String hotelPhone;
    String hotelEmail;
    
    // Room type information
    UUID roomTypeId;
    String roomTypeName;
    String roomDescription;
    Integer maxOccupancy;
    String bedType;
    
    // User information (if registered user)
    UUID userId;
    String userName;
    
    LocalDate checkInDate;
    LocalDate checkOutDate;
    Integer guests;
    BigDecimal totalAmount;
    BookingStatus status;
    PaymentStatus paymentStatus;
    String paymentMethod;
    String bookingReference;
    String specialRequests;
    
    // Calculated fields
    Integer numberOfNights;
    BigDecimal pricePerNight;
    
    // Audit fields
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UUID createdBy;
    UUID updatedBy;
} 