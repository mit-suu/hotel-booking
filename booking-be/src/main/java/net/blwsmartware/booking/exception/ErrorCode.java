package net.blwsmartware.booking.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // General errors
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),

    PAYMENT_FAILED(1508, "Payment failed", HttpStatus.BAD_REQUEST),
    INVALID_BOOKING_STATUS(1509, "INVALID BOOKING STATUS", HttpStatus.BAD_REQUEST),

    // User-related errors
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND(1005, "User not found", HttpStatus.NOT_FOUND),

    // Hotel-related errors
    HOTEL_NOT_FOUND(2001, "Hotel not found", HttpStatus.NOT_FOUND),
    HOTEL_NAME_ALREADY_EXISTS(2002, "Hotel name already exists for this owner", HttpStatus.BAD_REQUEST),
    HOTEL_HAS_ROOM_TYPES(2003, "Cannot delete hotel that has room types", HttpStatus.BAD_REQUEST),
    HOTEL_HAS_BOOKINGS(2004, "Cannot delete hotel that has bookings", HttpStatus.BAD_REQUEST),
    HOTEL_ACCESS_DENIED(2005, "You do not have permission to access this hotel", HttpStatus.FORBIDDEN),

    // Room type-related errors
    ROOM_TYPE_NOT_FOUND(3001, "Room type not found", HttpStatus.NOT_FOUND),
    ROOM_TYPE_NAME_ALREADY_EXISTS(3002, "Room type name already exists for this hotel", HttpStatus.BAD_REQUEST),
    ROOM_TYPE_HAS_BOOKINGS(3003, "Cannot delete room type that has bookings", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_ROOMS_AVAILABLE(3004, "Not enough rooms available", HttpStatus.BAD_REQUEST),

    // Review-related errors
    REVIEW_NOT_FOUND(4001, "Review not found", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(4002, "User has already reviewed this hotel", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_ALLOWED(4003, "User is not allowed to review this hotel", HttpStatus.FORBIDDEN),

    // Booking-related errors
    BOOKING_NOT_FOUND(5001, "Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CANCELLED(5002, "Booking is already cancelled", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_BE_CANCELLED(5003, "Booking cannot be cancelled", HttpStatus.BAD_REQUEST),
    INVALID_BOOKING_DATES(5004, "Invalid booking dates", HttpStatus.BAD_REQUEST),
    NO_ROOMS_AVAILABLE(5005, "No rooms available for selected dates", HttpStatus.BAD_REQUEST),
    BOOKING_ACCESS_DENIED(5006, "You do not have permission to access this booking", HttpStatus.FORBIDDEN),
    BOOKING_ALREADY_CONFIRMED(5007, "Booking is already confirmed", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_BE_CONFIRMED(5008, "Booking cannot be confirmed", HttpStatus.BAD_REQUEST),
    INVALID_GUEST_COUNT(5009, "Guest count exceeds room capacity", HttpStatus.BAD_REQUEST),
    CHECK_IN_DATE_PAST(5010, "Check-in date cannot be in the past", HttpStatus.BAD_REQUEST),
    CHECK_OUT_BEFORE_CHECK_IN(5011, "Check-out date must be after check-in date", HttpStatus.BAD_REQUEST),

    // Enhanced booking validation errors
    CHECK_IN_DATE_TOO_ADVANCE(5012, "Check-in date cannot be more than 2 years in advance", HttpStatus.BAD_REQUEST),
    STAY_DURATION_TOO_LONG(5013, "Stay duration cannot exceed 30 days", HttpStatus.BAD_REQUEST),
    GUESTS_EXCEED_ROOM_CAPACITY(5014, "Number of guests exceeds room maximum occupancy", HttpStatus.BAD_REQUEST),
    LARGE_GROUP_NEEDS_APPROVAL(5015, "Large groups (8+ guests) require special approval", HttpStatus.BAD_REQUEST),
    BOOKING_CONFLICT_DETECTED(5016, "Booking conflict detected with existing reservations", HttpStatus.CONFLICT),
    ROOM_UNDER_MAINTENANCE(5017, "Room is under maintenance during selected dates", HttpStatus.BAD_REQUEST),

    // Role-related errors
    ROLE_NOT_FOUND(6001, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTS(6002, "Role already exists", HttpStatus.BAD_REQUEST),

    // Token-related errors
    INVALID_TOKEN(7001, "Invalid token", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(7002, "Token expired", HttpStatus.UNAUTHORIZED),
    TOKEN_NOT_FOUND(7003, "Token not found", HttpStatus.NOT_FOUND),

    // Validation errors
    INVALID_EMAIL(8001, "Invalid email format", HttpStatus.BAD_REQUEST),
    INVALID_PHONE(8002, "Invalid phone number format", HttpStatus.BAD_REQUEST),
    INVALID_DATE_FORMAT(8003, "Invalid date format", HttpStatus.BAD_REQUEST),
    INVALID_PRICE(8004, "Invalid price value", HttpStatus.BAD_REQUEST),
    INVALID_RATING(8005, "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST),

    // File upload errors
    FILE_TOO_LARGE(9001, "File size exceeds maximum limit", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(9002, "Invalid file type", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED(9003, "File upload failed", HttpStatus.INTERNAL_SERVER_ERROR),
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
} 