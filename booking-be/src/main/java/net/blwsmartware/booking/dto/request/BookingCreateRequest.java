package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingCreateRequest {
    
    @NotNull(message = "Hotel ID is required")
    UUID hotelId;
    
    @NotNull(message = "Room type ID is required")
    UUID roomTypeId;
    
    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date cannot be in the past")
    LocalDate checkInDate;
    
    @NotNull(message = "Check-out date is required")
    @Future(message = "Check-out date must be in the future")
    LocalDate checkOutDate;
    
    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "Number of guests must be at least 1")
    @Max(value = 10, message = "Number of guests cannot exceed 10")
    Integer guests;
    
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid total amount format")
    BigDecimal totalAmount;
    
    @Size(max = 50, message = "Payment method cannot exceed 50 characters")
    String paymentMethod;
    
    @Size(max = 1000, message = "Special requests cannot exceed 1000 characters")
    String specialRequests;
    
    @Size(max = 50, message = "Voucher code cannot exceed 50 characters")
    String voucherCode;
    
    @AssertTrue(message = "Check-out date must be after check-in date")
    public boolean isCheckOutAfterCheckIn() {
        if (checkInDate == null || checkOutDate == null) {
            return true; // Let @NotNull handle null validation
        }
        return checkOutDate.isAfter(checkInDate);
    }
} 