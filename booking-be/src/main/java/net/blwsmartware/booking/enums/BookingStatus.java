package net.blwsmartware.booking.enums;

public enum BookingStatus {
    PENDING,      // Đặt phòng đang chờ xác nhận
    CONFIRMED,    // Đã xác nhận
    CANCELLED,    // Đã hủy
    COMPLETED,    // Đã hoàn thành (check-out)
    NO_SHOW       // Khách không đến
}