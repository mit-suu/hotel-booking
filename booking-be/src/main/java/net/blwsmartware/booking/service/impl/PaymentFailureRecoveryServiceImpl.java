package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.entity.Booking;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.service.PaymentFailureRecoveryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentFailureRecoveryServiceImpl implements PaymentFailureRecoveryService {
    
    BookingRepository bookingRepository;
    

    
    @Override
    public List<Booking> findFailedPaymentBookings() {
        // Find all bookings with FAILED payment for admin review
        return bookingRepository.findByPaymentStatus(PaymentStatus.FAILED);
    }
    
    @Override
    public boolean canRetryPayment(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Can retry if payment failed but booking is still pending and not expired
        if (booking.getPaymentStatus() == PaymentStatus.FAILED && 
            booking.getStatus() == BookingStatus.PENDING) {
            
            // Check if booking is not expired (within 24 hours of creation)
            LocalDateTime expiryTime = booking.getCreatedAt().plusHours(24);
            return LocalDateTime.now().isBefore(expiryTime);
        }
        
        return false;
    }
    
    @Override
    public void autoCancelExpiredFailedBookings() {
        // This method is kept for manual admin use if needed
        // No automatic scheduling - host will handle booking decisions
        log.info("Manual cleanup of expired failed bookings requested");
        
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
        List<Booking> expiredFailedBookings = bookingRepository
                .findByPaymentStatusAndStatusAndCreatedAtBefore(
                    PaymentStatus.FAILED, BookingStatus.PENDING, cutoffTime);
        
        if (expiredFailedBookings.isEmpty()) {
            log.info("No expired failed bookings found");
            return;
        }
        
        log.info("Found {} expired failed bookings for manual cleanup", expiredFailedBookings.size());
        
        for (Booking booking : expiredFailedBookings) {
            try {
                // Just log expired failed bookings for admin review
                // Host will decide whether to confirm or cancel
                log.info("Found expired failed booking for admin review: {} (Created: {}, Status: {}, Payment: {})", 
                        booking.getId(), booking.getCreatedAt(), booking.getStatus(), booking.getPaymentStatus());
            } catch (Exception e) {
                log.error("Error reviewing expired failed booking {}: {}", 
                         booking.getId(), e.getMessage());
            }
        }
    }
    

} 