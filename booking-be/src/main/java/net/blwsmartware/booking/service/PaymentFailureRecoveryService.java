package net.blwsmartware.booking.service;

import net.blwsmartware.booking.entity.Booking;

import java.util.List;
import java.util.UUID;

public interface PaymentFailureRecoveryService {
    
    /**
     * Find all bookings with FAILED payment status for admin review
     */
    List<Booking> findFailedPaymentBookings();
    
    /**
     * Check if a booking with failed payment can be retried
     */
    boolean canRetryPayment(UUID bookingId);
    
    /**
     * Manual cleanup for admin use - process expired failed bookings
     */
    void autoCancelExpiredFailedBookings();
} 