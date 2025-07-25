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
public class HotelCreateRequest {
    
    @NotBlank(message = "Hotel name is required")
    @Size(min = 2, max = 100, message = "Hotel name must be between 2 and 100 characters")
    String name;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    String description;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address cannot exceed 500 characters")
    String address;

    @Size(max = 100, message = "City name cannot exceed 100 characters")
    String city;

    @Size(max = 100, message = "Country name cannot exceed 100 characters")
    String country;

    @Pattern(regexp = "^$|^[+]?[0-9\\s\\-\\(\\)]{10,15}$", message = "Invalid phone number format")
    String phone;

    @Email(message = "Invalid email format")
    String email;

    @Pattern(regexp = "^$|^(https?://)?(www\\.)?[a-zA-Z0-9\\-\\.]+\\.[a-zA-Z]{2,}(/.*)?$", 
             message = "Invalid website URL format")
    String website;

    @Min(value = 1, message = "Star rating must be at least 1")
    @Max(value = 5, message = "Star rating cannot exceed 5")
    Integer starRating;

    @Pattern(regexp = "^$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Check-in time must be in HH:mm format")
    String checkInTime;

    @Pattern(regexp = "^$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Check-out time must be in HH:mm format")
    String checkOutTime;

    String imageUrl;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price per night must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Price format is invalid")
    BigDecimal pricePerNight;

    String amenities; // JSON string or comma-separated values

    @Size(max = 1000, message = "Cancellation policy cannot exceed 1000 characters")
    String cancellationPolicy;

    @Size(max = 1000, message = "Pet policy cannot exceed 1000 characters")
    String petPolicy;

    @DecimalMin(value = "0.00", message = "Commission rate must be at least 0%")
    @DecimalMax(value = "100.00", message = "Commission rate cannot exceed 100%")
    @Digits(integer = 3, fraction = 2, message = "Commission rate format is invalid")
    BigDecimal commissionRate = new BigDecimal("15.00");

    UUID ownerId; // Optional - if not provided, will use current user

    Boolean isActive = false;
    Boolean isFeatured = false;
} 