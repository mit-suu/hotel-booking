package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {
    UUID id;
    Integer rating;
    String comment;
    Integer helpfulCount;
    
    // Hotel information
    UUID hotelId;
    String hotelName;
    
    // User information
    UUID userId;
    String userName;
    String userEmail;
    
    // Audit fields
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
} 