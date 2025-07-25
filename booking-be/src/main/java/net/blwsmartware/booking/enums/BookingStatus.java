package net.blwsmartware.booking.enums;

public enum BookingStatus {
    PENDING,             // Đặt phòng đang chờ xác nhận
    CONFIRMED,           // Đã xác nhận
    CANCELLED,           // Đã hủy (general cancellation)
    CANCELLED_BY_GUEST,  // Hủy bởi khách hàng (có hoàn tiền)
    CANCELLED_BY_HOST,   // Hủy bởi host (không hoàn tiền)
    COMPLETED,           // Đã hoàn thành (check-out)
    NO_SHOW              // Khách không đến
} 