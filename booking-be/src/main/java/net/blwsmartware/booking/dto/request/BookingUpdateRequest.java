package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingUpdateRequest {
    
    @Size(min = 2, max = 100, message = "Guest name must be between 2 and 100 characters")
    String guestName;
    
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email cannot exceed 255 characters")
    String guestEmail;

    String guestPhone;
    
    @FutureOrPresent(message = "Check-in date cannot be in the past")
    LocalDate checkInDate;
    
    @Future(message = "Check-out date must be in the future")
    LocalDate checkOutDate;
    
    @Min(value = 1, message = "Number of guests must be at least 1")
    @Max(value = 10, message = "Number of guests cannot exceed 10")
    Integer guests;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Invalid total amount format")
    BigDecimal totalAmount;
    
    BookingStatus status;
    
    PaymentStatus paymentStatus;
    
    @Size(max = 50, message = "Payment method cannot exceed 50 characters")
    String paymentMethod;
    
    @Size(max = 1000, message = "Special requests cannot exceed 1000 characters")
    String specialRequests;
} 