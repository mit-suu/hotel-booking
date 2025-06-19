package net.blwsmartware.booking.enums;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorResponse {
    UNKNOWN_EXCEPTION(9001, "Something went wrong!", HttpStatus.INTERNAL_SERVER_ERROR),
    UNCATEGORIZED_ERROR(9002, "Uncategorized error!", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_KEY(9003, "Uncategorized key!", HttpStatus.BAD_REQUEST),

    MANY_DATA_INVALID(8001, "Many data invalid!", HttpStatus.BAD_REQUEST),
    UNIQUE_EXISTED(8002, "Data of unique field already exists!", HttpStatus.CONFLICT),
    NAME_EXISTED(8003, "Name already exists!", HttpStatus.CONFLICT),
    QUERY_KEY_INVALID(8004, "Your ID in the request has conflicted!", HttpStatus.CONFLICT),

    ROLE_NOT_EXISTED(3200, "Role not found in database!", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(3201, "Name of role already exists!", HttpStatus.CONFLICT),


    PERMISSION_NOT_EXISTED(3210, "Permission not found in database!", HttpStatus.NOT_FOUND),
    PERMISSION_EXISTED(3211, "Name of permission already exists!", HttpStatus.CONFLICT),

    EMAIL_EXISTED(3011, "Email already exists!", HttpStatus.CONFLICT),
    EMAIL_INVALID(3012, "Invalid email!", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_NULL(3011, "Email cannot be null!", HttpStatus.BAD_REQUEST),
    USERNAME_NOT_NULL(3041, "Username cannot be null!", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(3042, "Invalid username!", HttpStatus.BAD_REQUEST),
    USERNAME_EXISTED(3043, "Username already exists!", HttpStatus.CONFLICT),

    USER_NOT_FOUND(3004, "User not found!", HttpStatus.NOT_FOUND),
    USER_NOT_LOGIN(1001, "Incorrect password!", HttpStatus.BAD_REQUEST),
    USER_BLOCKED(4008, "User has been blocked!", HttpStatus.FORBIDDEN),
    USER_NOT_VERIFICATION(4009, "Email not verified!", HttpStatus.FORBIDDEN),
    USER_ALREADY_HOST(4010, "User already has host role!", HttpStatus.CONFLICT),
    HOST_REQUEST_NOT_FOUND(4011, "Host request not found!", HttpStatus.NOT_FOUND),
    CODE_EXPIRED(4012, "Code has expired!", HttpStatus.BAD_REQUEST),
    CODE_INVALID(4017, "Invalid code!", HttpStatus.BAD_REQUEST),
    CODE_NOT_FOUND(4113, "Code not found!", HttpStatus.BAD_REQUEST),

    PASSWORD_MUST_8_DIGITS(2005, "Password must be at least 8 characters!", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_NULL(2006, "Password cannot be null!", HttpStatus.BAD_REQUEST),
    NAME_NOT_NULL(3002, "Name cannot be null!", HttpStatus.BAD_REQUEST),
    PASSWORD_INCORRECT(3003, "Incorrect password!", HttpStatus.BAD_REQUEST),

    JWT_REFRESH_INVALID(7009, "Invalid token. Request requires a refresh token!", HttpStatus.FORBIDDEN),
    JWT_ACCESS_INVALID(7008, "Invalid token. Request requires a access token!", HttpStatus.FORBIDDEN),
    JWT_INVALID(7011, "Token is invalid!", HttpStatus.UNAUTHORIZED),
    JWT_EXPIRED(7012, "Token has expired!", HttpStatus.UNAUTHORIZED),
    JWT_NOT_NULL(7015, "Token cannot be null!", HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(7030, "Access denied!", HttpStatus.FORBIDDEN),

    // Hotel-related errors
    HOTEL_NOT_FOUND(2001, "Hotel not found!", HttpStatus.NOT_FOUND),
    HOTEL_NAME_ALREADY_EXISTS(2002, "Hotel name already exists for this owner!", HttpStatus.BAD_REQUEST),
    HOTEL_HAS_ROOM_TYPES(2003, "Cannot delete hotel that has room types!", HttpStatus.BAD_REQUEST),
    HOTEL_HAS_BOOKINGS(2004, "Cannot delete hotel that has bookings!", HttpStatus.BAD_REQUEST),
    HOTEL_ACCESS_DENIED(2005, "You do not have permission to access this hotel!", HttpStatus.FORBIDDEN),
    HOTEL_NOT_AVAILABLE(2006, "Hotel is not available for booking!", HttpStatus.BAD_REQUEST),
    
    // Room type-related errors
    ROOM_TYPE_NOT_FOUND(3001, "Room type not found!", HttpStatus.NOT_FOUND),
    ROOM_TYPE_NAME_ALREADY_EXISTS(3002, "Room type name already exists for this hotel!", HttpStatus.BAD_REQUEST),
    ROOM_TYPE_HAS_BOOKINGS(3003, "Cannot delete room type that has bookings!", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_ROOMS_AVAILABLE(3004, "Not enough rooms available!", HttpStatus.BAD_REQUEST),
    
    // Review-related errors
    REVIEW_NOT_FOUND(4001, "Review not found!", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(4002, "User has already reviewed this hotel!", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_ALLOWED(4003, "User is not allowed to review this hotel!", HttpStatus.FORBIDDEN),
    
    // Booking-related errors
    BOOKING_NOT_FOUND(5001, "Booking not found!", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CANCELLED(5002, "Booking is already cancelled!", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_BE_CANCELLED(5003, "Booking cannot be cancelled!", HttpStatus.BAD_REQUEST),
    INVALID_BOOKING_DATES(5004, "Invalid booking dates!", HttpStatus.BAD_REQUEST),
    NO_ROOMS_AVAILABLE(5005, "No rooms available for selected dates!", HttpStatus.BAD_REQUEST),
    BOOKING_ACCESS_DENIED(5006, "You do not have permission to access this booking!", HttpStatus.FORBIDDEN),
    BOOKING_ALREADY_CONFIRMED(5007, "Booking is already confirmed!", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_BE_CONFIRMED(5008, "Booking cannot be confirmed!", HttpStatus.BAD_REQUEST),
    INVALID_GUEST_COUNT(5009, "Guest count exceeds room capacity!", HttpStatus.BAD_REQUEST),
    CHECK_IN_DATE_PAST(5010, "Check-in date cannot be in the past!", HttpStatus.BAD_REQUEST),
    CHECK_OUT_BEFORE_CHECK_IN(5011, "Check-out date must be after check-in date!", HttpStatus.BAD_REQUEST),
    CHECK_IN_DATE_TOO_ADVANCE(5012, "Check-in date cannot be more than 2 years in advance!", HttpStatus.BAD_REQUEST),
    STAY_DURATION_TOO_LONG(5013, "Stay duration cannot exceed 30 days!", HttpStatus.BAD_REQUEST),
    GUESTS_EXCEED_ROOM_CAPACITY(5014, "Number of guests exceeds room maximum occupancy!", HttpStatus.BAD_REQUEST),
    LARGE_GROUP_NEEDS_APPROVAL(5015, "Large groups (8+ guests) require special approval!", HttpStatus.BAD_REQUEST),
    BOOKING_CONFLICT_DETECTED(5016, "Booking conflict detected with existing reservations!", HttpStatus.CONFLICT),
    ROOM_UNDER_MAINTENANCE(5017, "Room is under maintenance during selected dates!", HttpStatus.BAD_REQUEST),
    
    // Enhanced errors
    PAYMENT_FAILED(1508, "Payment failed!", HttpStatus.BAD_REQUEST),
    INVALID_BOOKING_STATUS(1509, "Invalid booking status!", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated!", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission!", HttpStatus.FORBIDDEN),

    // Voucher-related errors
    VOUCHER_NOT_FOUND(6001, "Voucher not found!", HttpStatus.NOT_FOUND),
    VOUCHER_CODE_ALREADY_EXISTS(6002, "Voucher code already exists!", HttpStatus.CONFLICT),
    VOUCHER_EXPIRED(6003, "Voucher has expired!", HttpStatus.BAD_REQUEST),
    VOUCHER_NOT_ACTIVE(6004, "Voucher is not active!", HttpStatus.BAD_REQUEST),
    VOUCHER_USAGE_LIMIT_EXCEEDED(6005, "Voucher usage limit exceeded!", HttpStatus.BAD_REQUEST),
    VOUCHER_NOT_APPLICABLE_TO_HOTEL(6006, "Voucher is not applicable to this hotel!", HttpStatus.BAD_REQUEST),
    VOUCHER_MIN_BOOKING_VALUE_NOT_MET(6007, "Minimum booking value requirement not met!", HttpStatus.BAD_REQUEST),
    VOUCHER_ALREADY_USED_BY_USER(6008, "Voucher has already been used by this user!", HttpStatus.BAD_REQUEST),
    VOUCHER_HAS_USAGE_RECORDS(6009, "Voucher has been used in bookings. Please disable instead of deleting to preserve data integrity!", HttpStatus.CONFLICT),

    ;

    private final int code;
    private final String message;
    private final HttpStatusCode httpCode;

    ErrorResponse(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.httpCode = statusCode;
    }
}
