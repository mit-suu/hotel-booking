package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomTypeCreateRequest {
    
    @NotBlank(message = "Room type name is required")
    @Size(min = 2, max = 100, message = "Room type name must be between 2 and 100 characters")
    String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    String description;

    @NotNull(message = "Max occupancy is required")
    @Min(value = 1, message = "Max occupancy must be at least 1")
    @Max(value = 10, message = "Max occupancy cannot exceed 10")
    Integer maxOccupancy;

    @Size(max = 50, message = "Bed type cannot exceed 50 characters")
    String bedType;

    @DecimalMin(value = "1.0", message = "Room size must be at least 1 square meter")
    @DecimalMax(value = "1000.0", message = "Room size cannot exceed 1000 square meters")
    Double roomSize;

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price per night must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Price format is invalid")
    BigDecimal pricePerNight;

    @NotNull(message = "Total rooms is required")
    @Min(value = 1, message = "Total rooms must be at least 1")
    @Max(value = 1000, message = "Total rooms cannot exceed 1000")
    Integer totalRooms;

    String imageUrl;

    String amenities; // JSON string or comma-separated values

    @NotNull(message = "Hotel ID is required")
    UUID hotelId;

    Boolean isActive = true;
} 