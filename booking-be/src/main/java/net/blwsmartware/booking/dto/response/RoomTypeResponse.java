package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeResponse {
    UUID id;
    String name;
    String description;
    Integer maxOccupancy;
    String bedType;
    Double roomSize;
    BigDecimal pricePerNight;
    Integer totalRooms;
    Integer availableRooms;
    String imageUrl;
    boolean isActive;
    String amenities;
    
    // Hotel information
    UUID hotelId;
    String hotelName;
    
    // Audit fields
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UUID createdBy;
    UUID updatedBy;
} 