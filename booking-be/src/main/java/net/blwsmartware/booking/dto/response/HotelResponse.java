package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HotelResponse {
    UUID id;
    String name;
    String description;
    String address;
    String city;
    String country;
    String location; // Combined location string
    String phone;
    String email;
    String website;
    Integer starRating;
    String checkInTime;
    String checkOutTime;
    String imageUrl;
    boolean isActive;
    boolean isFeatured;
    BigDecimal pricePerNight;
    Double latitude;
    Double longitude;
    String amenities;
    String cancellationPolicy;
    String petPolicy;
    
    // Owner information
    UUID ownerId;
    String ownerName;
    String ownerEmail;
    
    // Statistics
    Integer totalRoomTypes;
    Integer totalRooms;
    Integer availableRooms;
    Double averageRating;
    Integer totalReviews;
    
    // Room types (optional, for detailed view)
    List<RoomTypeResponse> roomTypes;
    
    // Recent reviews (optional, for detailed view)
    List<ReviewResponse> recentReviews;
    
    // Audit fields
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UUID createdBy;
    UUID updatedBy;
} 