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
    boolean isVerified;
    boolean isApproved;
    Integer helpfulCount;

    UUID hotelId;
    String hotelName;

    UUID userId;
    String userName;
    String userEmail;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}