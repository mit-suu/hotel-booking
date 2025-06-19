package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.BookingCreateRequest;
import net.blwsmartware.booking.dto.request.BookingUpdateRequest;
import net.blwsmartware.booking.dto.request.CancellationRequest;
import net.blwsmartware.booking.dto.response.BookingResponse;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;

import java.time.LocalDate;
import java.util.UUID;

public interface BookingService {
    
    // ===== GUEST OPERATIONS =====
    /**
     * Create a new booking (for both guest and registered users)
     */
    BookingResponse createBooking(BookingCreateRequest request);
    
    /**
     * Get user's own bookings (for registered users)
     */
    DataResponse<BookingResponse> getMyBookings(Integer pageNumber, Integer pageSize, String sortBy);
    
    /**
     * Get booking by ID (user can only access their own bookings)
     */
    BookingResponse getMyBookingById(UUID bookingId);
    
    /**
     * Update user's own booking (limited fields)
     */
    BookingResponse updateMyBooking(UUID bookingId, BookingUpdateRequest request);
    
    /**
     * Cancel user's own booking
     */
    BookingResponse cancelMyBooking(UUID bookingId, String reason);
    
    // ===== HOST OPERATIONS =====
    /**
     * Get all bookings for host's hotels
     */
    DataResponse<BookingResponse> getHostBookings(String status, String paymentStatus, 
                                                  Integer pageNumber, Integer pageSize, String sortBy);
    
    /**
     * Get specific booking for host (with ownership validation)
     */
    BookingResponse getHostBookingById(UUID bookingId);
    
    /**
     * Update booking (host can update status, payment info)
     */
    BookingResponse updateHostBooking(UUID bookingId, BookingUpdateRequest request);
    
    /**
     * Confirm booking
     */
    BookingResponse confirmBooking(UUID bookingId);
    
    /**
     * Cancel booking with reason
     */
    BookingResponse cancelBooking(UUID bookingId, String reason);
    
    /**
     * Complete booking (mark as checked out)
     */
    BookingResponse completeBooking(UUID bookingId);
    
    /**
     * Confirm payment status (for cash payments or manual confirmation)
     */
    BookingResponse confirmPayment(UUID bookingId);
    
    /**
     * Process cancellation request with refund decision
     */
    BookingResponse processCancellation(UUID bookingId, CancellationRequest request);
    
    /**
     * Get bookings for specific hotel
     */
    DataResponse<BookingResponse> getBookingsByHotel(UUID hotelId, String status, 
                                                     Integer pageNumber, Integer pageSize, String sortBy);
    
    // ===== ADMIN OPERATIONS =====
    /**
     * Get all bookings (admin only)
     */
    DataResponse<BookingResponse> getAllBookings(String status, String paymentStatus, 
                                                 Integer pageNumber, Integer pageSize, String sortBy);
    
    /**
     * Get booking by ID (admin can access any booking)
     */
    BookingResponse getBookingById(UUID bookingId);
    
    /**
     * Update any booking (admin)
     */
    BookingResponse updateBooking(UUID bookingId, BookingUpdateRequest request);
    
    /**
     * Delete booking (admin only)
     */
    void deleteBooking(UUID bookingId);
    
    // ===== SEARCH & FILTER OPERATIONS =====
    /**
     * Search bookings by keyword
     */
    DataResponse<BookingResponse> searchBookings(String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    
    /**
     * Get bookings by date range
     */
    DataResponse<BookingResponse> getBookingsByDateRange(LocalDate startDate, LocalDate endDate, 
                                                         Integer pageNumber, Integer pageSize, String sortBy);
    
    // ===== STATISTICS =====
    /**
     * Get total bookings count
     */
    Long getTotalBookingsCount();
    
    /**
     * Get bookings count by status
     */
    Long getBookingsCountByStatus(BookingStatus status);
    
    /**
     * Get bookings count by payment status
     */
    Long getBookingsCountByPaymentStatus(PaymentStatus paymentStatus);
    
    /**
     * Get host's bookings statistics
     */
    Long getHostBookingsCount();
    
    /**
     * Get host's bookings count by status
     */
    Long getHostBookingsCountByStatus(BookingStatus status);
    
    // ===== UTILITY METHODS =====
    /**
     * Check room availability for given dates
     */
    boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate);
    
    /**
     * Check room availability excluding specific booking
     */
    boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, UUID excludeBookingId);
    
    /**
     * Generate unique booking reference
     */
    String generateBookingReference();
} 