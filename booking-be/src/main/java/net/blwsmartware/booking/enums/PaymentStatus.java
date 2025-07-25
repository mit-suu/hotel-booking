package net.blwsmartware.booking.enums;

public enum PaymentStatus {
    PENDING,              // Chờ thanh toán
    PAID,                 // Đã thanh toán
    FAILED,               // Thanh toán thất bại
    REFUNDED,             // Đã hoàn tiền
    PARTIALLY_REFUNDED,   // Hoàn tiền một phần
    REFUND_PENDING,       // Chờ hoàn tiền
    NO_PAYMENT,           // Không thanh toán (hủy trước khi thanh toán)
    CANCELLED             // Đã hủy (không hoàn tiền)
} 