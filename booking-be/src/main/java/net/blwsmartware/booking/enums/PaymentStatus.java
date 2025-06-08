package net.blwsmartware.booking.enums;

public enum PaymentStatus {
    PENDING,              // Chờ thanh toán
    PAID,                 // Đã thanh toán
    FAILED,               // Thanh toán thất bại
    REFUNDED,             // Đã hoàn tiền
    PARTIALLY_REFUNDED    // Hoàn tiền một phần
}