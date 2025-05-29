package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewCreateRequest {
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    Integer rating;

    @Size(max = 2000, message = "Comment cannot exceed 2000 characters")
    String comment;

    @NotNull(message = "Hotel ID is required")
    UUID hotelId;

    // Optional - if not provided, will use current user
    UUID userId;
} 