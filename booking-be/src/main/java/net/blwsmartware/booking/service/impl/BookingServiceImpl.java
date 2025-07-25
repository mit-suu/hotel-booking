package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.BookingCreateRequest;
import net.blwsmartware.booking.dto.request.BookingUpdateRequest;
import net.blwsmartware.booking.dto.request.CancellationRequest;
import net.blwsmartware.booking.dto.response.BookingResponse;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.HostDashboardResponse;
import net.blwsmartware.booking.entity.Booking;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.RoomType;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.mapper.BookingMapper;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.RoomTypeRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.repository.VNPayTransactionRepository;
import net.blwsmartware.booking.service.BookingService;
import net.blwsmartware.booking.service.VoucherService;
import net.blwsmartware.booking.service.WalletService;
import net.blwsmartware.booking.service.RevenueService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingServiceImpl implements BookingService {
    
    BookingRepository bookingRepository;
    HotelRepository hotelRepository;
    RoomTypeRepository roomTypeRepository;
    UserRepository userRepository;
    VNPayTransactionRepository vnPayTransactionRepository;
    BookingMapper bookingMapper;
    VoucherService voucherService;
    WalletService walletService;
    RevenueService revenueService;
    
    // ===== GUEST OPERATIONS =====
    
    @Override
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        log.info("Creating booking for hotel: {}, room type: {}", request.getHotelId(), request.getRoomTypeId());
        
        // 1. Require authentication - no guest booking allowed
        User currentUser = getCurrentUserRequired();
        
        // 2. Enhanced date validation
        validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());
        
        // 3. Get and validate hotel and room type
        Hotel hotel = getHotelById(request.getHotelId());
        RoomType roomType = getRoomTypeById(request.getRoomTypeId());
        
        // 4. Validate hotel is active - CRITICAL: Prevent booking inactive hotels
        if (!hotel.isActive()) {
            log.warn("Attempt to book inactive hotel: {} (ID: {})", hotel.getName(), hotel.getId());
            throw new AppRuntimeException(ErrorResponse.HOTEL_NOT_AVAILABLE);
        }
        
        // 5. Validate room type belongs to hotel
        if (!roomType.getHotel().getId().equals(hotel.getId())) {
            throw new AppRuntimeException(ErrorResponse.ROOM_TYPE_NOT_FOUND);
        }
        
        // 6. Enhanced guest count validation against room type
        validateGuestCount(request.getGuests(), roomType.getMaxOccupancy());
        
        // 7. Enhanced room availability check with conflict detection
        validateRoomAvailability(request.getRoomTypeId(), request.getCheckInDate(), request.getCheckOutDate());
        
        // 8. Kiểm tra availableRooms trước khi book
        if (roomType.getAvailableRooms() <= 0) {
            log.warn("Cannot create booking - no available rooms for roomType: {}", roomType.getId());
            throw new AppRuntimeException(ErrorResponse.NO_ROOMS_AVAILABLE);
        }
        
        // 9. Create booking entity with authenticated user info
        Booking booking = bookingMapper.toEntity(request);
        booking.setHotel(hotel);
        booking.setRoomType(roomType);
        booking.setUser(currentUser);
        
        // Use authenticated user info instead of manual guest input
        booking.setGuestName(currentUser.getName());
        booking.setGuestEmail(currentUser.getEmail());
        booking.setGuestPhone(currentUser.getTel());
        
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setBookingReference(generateBookingReference());
        
        if (currentUser != null) {
            booking.setCreatedBy(currentUser.getId());
        }
        
        // 10. Cập nhật số lượng phòng có sẵn (giảm 1 phòng)
        roomType.setAvailableRooms(roomType.getAvailableRooms() - 1);
        roomTypeRepository.save(roomType);
        log.info("Room availability updated for roomType {}: {} -> {}", 
                roomType.getId(), roomType.getAvailableRooms() + 1, roomType.getAvailableRooms());
        
        // 11. Save booking
        booking = bookingRepository.save(booking);
        
        // 12. Apply voucher if provided
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            try {
                log.info("Applying voucher {} to booking {}", request.getVoucherCode(), booking.getId());
                voucherService.applyVoucher(
                    request.getVoucherCode(), 
                    currentUser.getId(), 
                    booking.getId(), 
                    request.getTotalAmount(), 
                    hotel.getId()
                );
                log.info("Voucher {} applied successfully to booking {}", request.getVoucherCode(), booking.getId());
            } catch (Exception e) {
                log.warn("Failed to apply voucher {} to booking {}: {}", 
                        request.getVoucherCode(), booking.getId(), e.getMessage());
                // Note: We don't fail the booking if voucher application fails
                // The booking should succeed even if voucher is invalid
            }
        }
        
        log.info("Booking created successfully with ID: {} and reference: {}", 
                booking.getId(), booking.getBookingReference());
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    public DataResponse<BookingResponse> getMyBookings(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting user bookings");
        
        User currentUser = getCurrentUserRequired();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage = bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable);
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    @Override
    public BookingResponse getMyBookingById(UUID bookingId) {
        log.info("Getting user booking by ID: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @Transactional
    public BookingResponse updateMyBooking(UUID bookingId, BookingUpdateRequest request) {
        log.info("Updating user booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Only allow updates for pending bookings
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_CANNOT_BE_CANCELLED);
        }
        
        // Validate dates if provided
        if (request.getCheckInDate() != null && request.getCheckOutDate() != null) {
            validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());
            
            // Check availability for new dates (excluding current booking)
            if (!isRoomAvailable(booking.getRoomType().getId(), 
                               request.getCheckInDate(), request.getCheckOutDate(), bookingId)) {
                throw new AppRuntimeException(ErrorResponse.NO_ROOMS_AVAILABLE);
            }
        }
        
        // Validate guest count if provided
        if (request.getGuests() != null && request.getGuests() > booking.getRoomType().getMaxOccupancy()) {
            throw new AppRuntimeException(ErrorResponse.INVALID_GUEST_COUNT);
        }
        
        // Update booking (limited fields for users)
        if (request.getGuestName() != null) booking.setGuestName(request.getGuestName());
        if (request.getGuestEmail() != null) booking.setGuestEmail(request.getGuestEmail());
        if (request.getGuestPhone() != null) booking.setGuestPhone(request.getGuestPhone());
        if (request.getCheckInDate() != null) booking.setCheckInDate(request.getCheckInDate());
        if (request.getCheckOutDate() != null) booking.setCheckOutDate(request.getCheckOutDate());
        if (request.getGuests() != null) booking.setGuests(request.getGuests());
        if (request.getSpecialRequests() != null) booking.setSpecialRequests(request.getSpecialRequests());
        
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @Transactional
    public BookingResponse cancelMyBooking(UUID bookingId, String reason) {
        log.info("Cancelling user booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Check if booking can be cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED || 
            booking.getStatus() == BookingStatus.CANCELLED_BY_GUEST ||
            booking.getStatus() == BookingStatus.CANCELLED_BY_HOST) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_CANNOT_BE_CANCELLED);
        }
        
        // Store original payment status for refund logic
        PaymentStatus originalPaymentStatus = booking.getPaymentStatus();
        
        // Update booking status to cancelled by guest
        booking.setStatus(BookingStatus.CANCELLED_BY_GUEST);
        booking.setCancellationReason(reason);
        
        // Process refund based on current payment status
        if (originalPaymentStatus == PaymentStatus.PENDING) {
            // If not paid yet, set to NO_PAYMENT
            booking.setPaymentStatus(PaymentStatus.NO_PAYMENT);
            log.info("Booking cancelled before payment - no refund needed: {}", bookingId);
        } else if (originalPaymentStatus == PaymentStatus.FAILED) {
            // If payment failed, set to CANCELLED (no refund needed)
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
            log.info("Booking cancelled after payment failure - no refund needed: {}", bookingId);
        } else if (originalPaymentStatus == PaymentStatus.PAID) {
            // If already paid, process automatic refund to wallet
            BigDecimal refundAmount = booking.getTotalAmount();
            booking.setRefundAmount(refundAmount);
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
            
            try {
                // Add refund to user's wallet
                walletService.addRefund(
                    currentUser.getId(),
                    refundAmount,
                    "Booking cancellation refund - " + booking.getBookingReference()
                );
                
                log.info("Refund processed successfully for booking {}: {} VND", 
                        bookingId, refundAmount);
            } catch (Exception e) {
                log.error("Failed to process refund for booking {}: {}", bookingId, e.getMessage());
                // Rollback payment status if wallet refund fails
                booking.setPaymentStatus(PaymentStatus.REFUND_PENDING);
                booking.setRefundAmount(null);
                throw new AppRuntimeException(ErrorResponse.REFUND_PROCESSING_FAILED);
            }
        } else {
            // For other payment statuses, just set to cancelled
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
            log.info("Booking cancelled with payment status: {}", originalPaymentStatus);
        }
        
        // Restore room availability when booking is cancelled
        RoomType roomType = booking.getRoomType();
        roomType.setAvailableRooms(roomType.getAvailableRooms() + 1);
        roomTypeRepository.save(roomType);
        
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        // Revert commission if booking was paid before cancellation
        if (originalPaymentStatus == PaymentStatus.PAID) {
            try {
                revenueService.revertHotelRevenue(bookingId);
                log.info("Commission reverted for cancelled booking: {}", bookingId);
            } catch (Exception e) {
                log.error("Failed to revert commission for booking {}: {}", bookingId, e.getMessage());
                // Don't fail the cancellation if commission revert fails
            }
        }
        
        log.info("Booking cancelled successfully: {}", bookingId);
        return bookingMapper.toResponse(booking);
    }
    
    // ===== UTILITY METHODS =====
    
    private void validateBookingDates(LocalDate checkInDate, LocalDate checkOutDate) {
        LocalDate today = LocalDate.now();
        
        if (checkInDate.isBefore(today)) {
            throw new AppRuntimeException(ErrorResponse.CHECK_IN_DATE_PAST);
        }
        
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.equals(checkInDate)) {
            throw new AppRuntimeException(ErrorResponse.CHECK_OUT_BEFORE_CHECK_IN);
        }
        
        // Additional validation: Check-in date should not be too far in future (e.g., 2 years)
        LocalDate maxAdvanceDate = today.plusYears(2);
        if (checkInDate.isAfter(maxAdvanceDate)) {
            throw new AppRuntimeException(ErrorResponse.CHECK_IN_DATE_TOO_ADVANCE);
        }
        
        // Additional validation: Maximum stay duration (e.g., 30 days)
        long daysBetween = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        if (daysBetween > 30) {
            throw new AppRuntimeException(ErrorResponse.STAY_DURATION_TOO_LONG);
        }
    }
    
    /**
     * Enhanced guest count validation against room type capacity
     */
    private void validateGuestCount(Integer guests, Integer maxOccupancy) {
        if (guests == null || guests <= 0) {
            throw new AppRuntimeException(ErrorResponse.INVALID_GUEST_COUNT);
        }
        
        if (guests > maxOccupancy) {
            throw new AppRuntimeException(ErrorResponse.GUESTS_EXCEED_ROOM_CAPACITY);
        }
        
        // Additional business rule: minimum stay requirement
        if (guests > 8) { // Large groups need special approval
            throw new AppRuntimeException(ErrorResponse.LARGE_GROUP_NEEDS_APPROVAL);
        }
    }
    
    /**
     * Enhanced room availability validation with conflict detection
     */
    private void validateRoomAvailability(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        // Check basic availability using the comprehensive isRoomAvailable method
        if (!isRoomAvailable(roomTypeId, checkInDate, checkOutDate)) {
            throw new AppRuntimeException(ErrorResponse.NO_ROOMS_AVAILABLE);
        }
        
        // Additional validation: Check for maintenance periods (if implemented)
        if (isRoomUnderMaintenance(roomTypeId, checkInDate, checkOutDate)) {
            throw new AppRuntimeException(ErrorResponse.ROOM_UNDER_MAINTENANCE);
        }
        
        // Note: Conflict detection is already handled in isRoomAvailable() method
        // which properly considers totalRooms vs conflicting bookings
        log.info("Room availability validated successfully for roomType {} between {} and {}", 
                roomTypeId, checkInDate, checkOutDate);
    }
    
    /**
     * Check if room is under maintenance during the requested period
     */
    private boolean isRoomUnderMaintenance(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        // Placeholder for maintenance schedule check
        // This would query a maintenance schedule table
        return false;
    }
    
    private Hotel getHotelById(UUID hotelId) {
        return hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
    }
    
    private RoomType getRoomTypeById(UUID roomTypeId) {
        return roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROOM_TYPE_NOT_FOUND));
    }
    
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            log.info("Authentication object: {}", authentication);
            log.info("Authentication class: {}", authentication != null ? authentication.getClass().getName() : "null");
            
            if (authentication == null) {
                log.warn("No authentication found in SecurityContext");
                return null;
            }
            
            log.info("Authentication isAuthenticated: {}", authentication.isAuthenticated());
            log.info("Authentication principal: {}", authentication.getPrincipal());
            log.info("Authentication principal class: {}", authentication.getPrincipal().getClass().getName());
            log.info("Authentication authorities: {}", authentication.getAuthorities());
            
            if (!authentication.isAuthenticated()) {
                log.warn("Authentication is not authenticated: {}", authentication);
                return null;
            }
            
            if (authentication.getPrincipal().equals("anonymousUser")) {
                log.warn("Anonymous user detected");
                return null;
            }
            
            // Handle JWT Authentication - extract username from 'usn' claim
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                Jwt jwt = jwtAuth.getToken();
                
                // JWT has: subject = UID, usn = username
                String userId = jwt.getSubject();
                String username = jwt.getClaimAsString("usn");
                
                log.info("JWT subject (UID): {}", userId);
                log.info("JWT usn (username): {}", username);
                
                if (username != null) {
                    log.info("Attempting to find user by username from JWT usn claim: {}", username);
                    
                    Optional<User> userOpt = userRepository.findByUsername(username);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        log.info("User found: {} ({}) (ID: {})", user.getName(), user.getUsername(), user.getId());
                        return user;
                    } else {
                        log.warn("User not found in database for username: {}", username);
                        return null;
                    }
                } else {
                    // Fallback: try to find by ID if usn claim is missing
                    log.warn("JWT usn claim is missing, trying to find by subject (UID): {}", userId);
                    try {
                        UUID userIdUUID = UUID.fromString(userId);
                        Optional<User> userOpt = userRepository.findById(userIdUUID);
                        
                        if (userOpt.isPresent()) {
                            User user = userOpt.get();
                            log.info("User found by ID: {} ({}) (ID: {})", user.getName(), user.getUsername(), user.getId());
                            return user;
                        } else {
                            log.warn("User not found in database for ID: {}", userId);
                            return null;
                        }
                    } catch (IllegalArgumentException e) {
                        log.error("Invalid UUID format for user ID: {}", userId, e);
                        return null;
                    }
                }
            }
            
            // Fallback for other authentication types - find by username
            String username = authentication.getName();
            log.info("Attempting to find user by username: {}", username);
            
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                log.warn("User not found in database for username: {}", username);
            } else {
                log.info("User found: {} ({}) (ID: {})", user.getName(), user.getUsername(), user.getId());
            }
            
            return user;
        } catch (Exception e) {
            log.error("Error getting current user: ", e);
            return null;
        }
    }
    
    private User getCurrentUserRequired() {
        User user = getCurrentUser();
        if (user == null) {
            log.error("User authentication required but no authenticated user found");
            throw new AppRuntimeException(ErrorResponse.UNAUTHENTICATED);
        }
        return user;
    }
    
    private UUID getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }
    
    /**
     * Xử lý cập nhật availableRooms khi thay đổi trạng thái booking
     */
    private void handleRoomAvailabilityOnStatusChange(Booking booking, BookingStatus oldStatus, BookingStatus newStatus) {
        log.info("Handling room availability change for booking {}: {} -> {}", 
                booking.getId(), oldStatus, newStatus);
        
        RoomType roomType = booking.getRoomType();
        boolean shouldReleaseRoom = false;
        boolean shouldReserveRoom = false;
        
        // Logic xử lý dựa trên trạng thái cũ và mới
        // Các trạng thái "đã sử dụng phòng": PENDING, CONFIRMED
        // Các trạng thái "không sử dụng phòng": CANCELLED, CANCELLED_BY_GUEST, CANCELLED_BY_HOST, COMPLETED, NO_SHOW
        
        boolean oldStatusUsesRoom = isStatusUsingRoom(oldStatus);
        boolean newStatusUsesRoom = isStatusUsingRoom(newStatus);
        
        if (oldStatusUsesRoom && !newStatusUsesRoom) {
            // Chuyển từ "đang dùng phòng" sang "không dùng phòng" → Release room
            shouldReleaseRoom = true;
        } else if (!oldStatusUsesRoom && newStatusUsesRoom) {
            // Chuyển từ "không dùng phòng" sang "đang dùng phòng" → Reserve room
            shouldReserveRoom = true;
        }
        
        if (shouldReleaseRoom) {
            if (roomType.getAvailableRooms() < roomType.getTotalRooms()) {
                roomType.setAvailableRooms(roomType.getAvailableRooms() + 1);
                roomTypeRepository.save(roomType);
                log.info("Room released for booking status change {}: {} -> {} (availability: {} -> {})", 
                        booking.getId(), oldStatus, newStatus, 
                        roomType.getAvailableRooms() - 1, roomType.getAvailableRooms());
            }
        } else if (shouldReserveRoom) {
            if (roomType.getAvailableRooms() > 0) {
                roomType.setAvailableRooms(roomType.getAvailableRooms() - 1);
                roomTypeRepository.save(roomType);
                log.info("Room reserved for booking status change {}: {} -> {} (availability: {} -> {})", 
                        booking.getId(), oldStatus, newStatus, 
                        roomType.getAvailableRooms() + 1, roomType.getAvailableRooms());
            } else {
                log.warn("Cannot reserve room for booking {}: no available rooms", booking.getId());
                throw new AppRuntimeException(ErrorResponse.NO_ROOMS_AVAILABLE);
            }
        }
    }
    
    /**
     * Kiểm tra xem trạng thái booking có "sử dụng phòng" không
     */
    private boolean isStatusUsingRoom(BookingStatus status) {
        return status == BookingStatus.PENDING || status == BookingStatus.CONFIRMED;
    }
    
    @Override
    public boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        return isRoomAvailable(roomTypeId, checkInDate, checkOutDate, null);
    }
    
    @Override
    public boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, UUID excludeBookingId) {
        RoomType roomType = getRoomTypeById(roomTypeId);
        
        // Kiểm tra availableRooms trước (nhanh hơn)
        if (roomType.getAvailableRooms() <= 0) {
            return false;
        }
        
        // Kiểm tra conflict với bookings existing (đảm bảo accuracy)
        Long conflictingBookings;
        if (excludeBookingId != null) {
            conflictingBookings = bookingRepository.countConflictingBookingsExcluding(
                    roomTypeId, checkInDate, checkOutDate, excludeBookingId);
        } else {
            conflictingBookings = bookingRepository.countConflictingBookings(
                    roomTypeId, checkInDate, checkOutDate);
        }
        
        return conflictingBookings < roomType.getTotalRooms();
    }
    
    @Override
    public String generateBookingReference() {
        String prefix = "BK";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = String.format("%04d", new Random().nextInt(10000));
        
        String reference = prefix + datePart + randomPart;
        
        // Ensure uniqueness
        while (bookingRepository.existsByBookingReference(reference)) {
            randomPart = String.format("%04d", new Random().nextInt(10000));
            reference = prefix + datePart + randomPart;
        }
        
        return reference;
    }
    
    // ===== HOST OPERATIONS =====
    
    @Override
    @IsHost
    public DataResponse<BookingResponse> getHostBookings(String status, String paymentStatus, 
                                                         Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting host bookings with status: {}, paymentStatus: {}", status, paymentStatus);
        
        User currentUser = getCurrentUserRequired();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage;
        
        if (status != null && paymentStatus != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            PaymentStatus paymentStatusEnum = PaymentStatus.valueOf(paymentStatus.toUpperCase());
            bookingPage = bookingRepository.findByStatusAndPaymentStatusOrderByCreatedAtDesc(
                    bookingStatus, paymentStatusEnum, pageable);
        } else if (status != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            bookingPage = bookingRepository.findByHotelOwnerIdAndStatusOrderByCreatedAtDesc(
                    currentUser.getId(), bookingStatus, pageable);
        } else {
            bookingPage = bookingRepository.findByHotelOwnerIdOrderByCreatedAtDesc(currentUser.getId(), pageable);
        }
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    @Override
    @IsHost
    public BookingResponse getHostBookingById(UUID bookingId) {
        log.info("Getting host booking by ID: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse updateHostBooking(UUID bookingId, BookingUpdateRequest request) {
        log.info("Host updating booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Lưu status cũ để so sánh
        BookingStatus oldStatus = booking.getStatus();
        
        // Host can update more fields than regular users
        bookingMapper.updateEntity(booking, request);
        booking.setUpdatedBy(currentUser.getId());
        
        // Xử lý cập nhật availableRooms khi thay đổi status
        if (request.getStatus() != null && !oldStatus.equals(request.getStatus())) {
            handleRoomAvailabilityOnStatusChange(booking, oldStatus, request.getStatus());
        }
        
        booking = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse confirmBooking(UUID bookingId) {
        log.info("Confirming booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CONFIRMED);
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_CANNOT_BE_CONFIRMED);
        }
        
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        log.info("Booking confirmed: {}", bookingId);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, String reason) {
        log.info("Host cancelling booking: {} with reason: {}", bookingId, reason);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() == BookingStatus.CANCELLED ||
            booking.getStatus() == BookingStatus.CANCELLED_BY_GUEST ||
            booking.getStatus() == BookingStatus.CANCELLED_BY_HOST) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_CANNOT_BE_CANCELLED);
        }

        // Store original payment status for refund logic
        PaymentStatus originalPaymentStatus = booking.getPaymentStatus();
        
        // Update booking status to cancelled by host
        booking.setStatus(BookingStatus.CANCELLED_BY_HOST);
        booking.setCancellationReason(reason);
        
        // Process refund based on current payment status
        if (originalPaymentStatus == PaymentStatus.PENDING) {
            // If not paid yet, set to CANCELLED
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
            log.info("Host cancelled booking before payment - no refund needed: {}", bookingId);
        } else if (originalPaymentStatus == PaymentStatus.FAILED) {
            // If payment failed, set to CANCELLED (no refund needed)
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
            log.info("Host cancelled booking after payment failure - no refund needed: {}", bookingId);
        } else if (originalPaymentStatus == PaymentStatus.PAID && booking.getUser() != null) {
            // If already paid, process automatic 100% refund to wallet
            BigDecimal refundAmount = booking.getTotalAmount();
            booking.setRefundAmount(refundAmount);
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
            
            try {
                // Add refund to user's wallet
                walletService.addRefund(
                    booking.getUser().getId(),
                    refundAmount,
                    "Host cancelled booking refund - " + booking.getBookingReference() + 
                    (reason != null ? " | Reason: " + reason : "")
                );
                
                log.info("Full refund processed successfully for host cancelled booking {}: {} VND", 
                        bookingId, refundAmount);
            } catch (Exception e) {
                log.error("Failed to process refund for host cancelled booking {}: {}", bookingId, e.getMessage());
                // Rollback payment status if wallet refund fails
                booking.setPaymentStatus(PaymentStatus.REFUND_PENDING);
                booking.setRefundAmount(null);
                throw new AppRuntimeException(ErrorResponse.REFUND_PROCESSING_FAILED);
            }
        } else {
            // For other cases (guest booking or other payment statuses)
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
            log.info("Host cancelled booking with payment status: {}", originalPaymentStatus);
        }
        
        // Restore room availability when booking is cancelled
        RoomType roomType = booking.getRoomType();
        roomType.setAvailableRooms(roomType.getAvailableRooms() + 1);
        roomTypeRepository.save(roomType);
        
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        // Revert commission if booking was paid before cancellation
        if (originalPaymentStatus == PaymentStatus.PAID) {
            try {
                revenueService.revertHotelRevenue(bookingId);
                log.info("Commission reverted for host cancelled booking: {}", bookingId);
            } catch (Exception e) {
                log.error("Failed to revert commission for booking {}: {}", bookingId, e.getMessage());
                // Don't fail the cancellation if commission revert fails
            }
        }
        
        log.info("Host cancelled booking successfully: {}", bookingId);
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse completeBooking(UUID bookingId) {
        log.info("Completing booking with ID: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Validate business rules
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            log.warn("Booking {} is already completed", bookingId);
            return bookingMapper.toResponse(booking);
        }
        
        // Lưu status cũ để xử lý room availability
        BookingStatus oldStatus = booking.getStatus();
        
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setUpdatedAt(LocalDateTime.now());
        
        // Xử lý cập nhật availableRooms khi complete booking (khách trả phòng)
        handleRoomAvailabilityOnStatusChange(booking, oldStatus, BookingStatus.COMPLETED);
        
        booking = bookingRepository.save(booking);
        
        log.info("Successfully completed booking: {} (room released)", bookingId);
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @Transactional
    public BookingResponse confirmPayment(UUID bookingId) {
        log.info("Confirming payment for booking ID: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        Booking booking = null;
        
        // Check if user is admin or host
        boolean isAdmin = currentUser.getRole() != null && "ADMIN".equals(currentUser.getRole().getName());
        
        if (isAdmin) {
            // Admin can confirm payment for any booking
            booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        } else {
            // Host can only confirm payment for their own hotels' bookings
            booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                    .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        }
        
        // Validate business rules
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            log.warn("Payment for booking {} is already confirmed", bookingId);
            return bookingMapper.toResponse(booking);
        }
        
        if (booking.getPaymentStatus() == PaymentStatus.FAILED) {
            throw new AppRuntimeException(ErrorResponse.PAYMENT_FAILED);
        }
        
        // Update payment status to PAID
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setUpdatedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        
        log.info("Successfully confirmed payment for booking: {}", bookingId);
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse processCancellation(UUID bookingId, CancellationRequest request) {
        log.info("Processing cancellation for booking: {} with refund amount: {}", bookingId, request.getRefundAmount());
        
        User currentUser = getCurrentUserRequired();
        
        // Find booking with ownership validation
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Validate business rules
        if (booking.getStatus() == BookingStatus.CANCELLED ||
            booking.getStatus() == BookingStatus.CANCELLED_BY_GUEST ||
            booking.getStatus() == BookingStatus.CANCELLED_BY_HOST) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_CANNOT_BE_CANCELLED);
        }
        
        // Process refund if payment was made
        if (booking.getPaymentStatus() == PaymentStatus.PAID && booking.getUser() != null) {
            if (request.getRefundAmount() != null && request.getRefundAmount().compareTo(BigDecimal.ZERO) > 0) {
                try {
                    // Add refund to user's wallet
                    walletService.addRefund(
                        booking.getUser().getId(),
                        request.getRefundAmount(),
                        "Host cancelled booking refund - " + booking.getBookingReference() + 
                        (request.getReason() != null ? " | Reason: " + request.getReason() : "")
                    );
                    
                    booking.setStatus(BookingStatus.CANCELLED_BY_HOST);
                    
                    // Determine refund status based on amount
                    BigDecimal totalAmount = booking.getTotalAmount();
                    if (request.getRefundAmount().compareTo(totalAmount) == 0) {
                        // Full refund
                        booking.setPaymentStatus(PaymentStatus.REFUNDED);
                    } else {
                        // Partial refund
                        booking.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
                    }
                    
                    booking.setRefundAmount(request.getRefundAmount());
                    booking = bookingRepository.save(booking);
                    
                    log.info("Booking cancellation processed successfully with refund {}: {} VND", 
                            bookingId, request.getRefundAmount());
                            
                } catch (Exception e) {
                    log.error("Failed to process refund for booking {}: {}", bookingId, e.getMessage());
                    throw new AppRuntimeException(ErrorResponse.REFUND_PROCESSING_ERROR);
                }
            } else {
                // No refund - host cancelled without compensation
                booking.setStatus(BookingStatus.CANCELLED_BY_HOST);
                booking.setPaymentStatus(PaymentStatus.CANCELLED);
            }
        } else {
            // Booking was not paid, just cancel it
            booking.setStatus(BookingStatus.CANCELLED_BY_HOST);
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
        }
        
        booking.setCancellationReason(request.getReason());
        booking.setUpdatedBy(currentUser.getId());
        
        // Restore room availability
        RoomType roomType = booking.getRoomType();
        roomType.setAvailableRooms(roomType.getAvailableRooms() + 1);
        roomTypeRepository.save(roomType);
        
        booking = bookingRepository.save(booking);
        
        // Revert commission based on refund amount or full amount if no refund specified
        if (booking.getPaymentStatus() == PaymentStatus.PAID || 
            booking.getPaymentStatus() == PaymentStatus.REFUNDED ||
            booking.getPaymentStatus() == PaymentStatus.PARTIALLY_REFUNDED) {
            try {
                revenueService.revertHotelRevenue(bookingId);
                log.info("Commission reverted for processed cancellation: {}", bookingId);
            } catch (Exception e) {
                log.error("Failed to revert commission for booking {}: {}", bookingId, e.getMessage());
                // Don't fail the cancellation if commission revert fails
            }
        }
        
        log.info("Cancellation processed successfully for booking: {}", bookingId);
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    public DataResponse<BookingResponse> getBookingsByHotel(UUID hotelId, String status, 
                                                            Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting bookings for hotel: {} with status: {}", hotelId, status);
        
        User currentUser = getCurrentUserRequired();
        
        // Validate hotel ownership
        Hotel hotel = getHotelById(hotelId);
        if (!hotel.getOwner().getId().equals(currentUser.getId())) {
            throw new AppRuntimeException(ErrorResponse.HOTEL_ACCESS_DENIED);
        }
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage;
        
        if (status != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            bookingPage = bookingRepository.findByHotelIdAndStatusOrderByCreatedAtDesc(hotelId, bookingStatus, pageable);
        } else {
            bookingPage = bookingRepository.findByHotelIdOrderByCreatedAtDesc(hotelId, pageable);
        }
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    // ===== ADMIN OPERATIONS =====
    
    @Override
    @IsAdmin
    public DataResponse<BookingResponse> getAllBookings(String status, String paymentStatus, 
                                                        Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Admin getting all bookings with status: {}, paymentStatus: {}", status, paymentStatus);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage;
        
        if (status != null && paymentStatus != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            PaymentStatus paymentStatusEnum = PaymentStatus.valueOf(paymentStatus.toUpperCase());
            bookingPage = bookingRepository.findByStatusAndPaymentStatusOrderByCreatedAtDesc(
                    bookingStatus, paymentStatusEnum, pageable);
        } else if (status != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            bookingPage = bookingRepository.findByStatusOrderByCreatedAtDesc(bookingStatus, pageable);
        } else if (paymentStatus != null) {
            PaymentStatus paymentStatusEnum = PaymentStatus.valueOf(paymentStatus.toUpperCase());
            bookingPage = bookingRepository.findByPaymentStatusOrderByCreatedAtDesc(paymentStatusEnum, pageable);
        } else {
            bookingPage = bookingRepository.findAll(pageable);
        }
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    @Override
    @IsAdmin
    public BookingResponse getBookingById(UUID bookingId) {
        log.info("Admin getting booking by ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public BookingResponse updateBooking(UUID bookingId, BookingUpdateRequest request) {
        log.info("Admin updating booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Lưu status cũ để so sánh (Admin có thể thay đổi status)
        BookingStatus oldStatus = booking.getStatus();
        
        bookingMapper.updateEntity(booking, request);
        booking.setUpdatedBy(currentUser.getId());
        
        // Xử lý cập nhật availableRooms khi Admin thay đổi status
        if (request.getStatus() != null && !oldStatus.equals(request.getStatus())) {
            handleRoomAvailabilityOnStatusChange(booking, oldStatus, request.getStatus());
        }
        
        booking = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public void deleteBooking(UUID bookingId) {
        log.info("Admin deleting booking: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Cập nhật availableRooms nếu booking đang sử dụng phòng
        if (isStatusUsingRoom(booking.getStatus())) {
            RoomType roomType = booking.getRoomType();
            if (roomType.getAvailableRooms() < roomType.getTotalRooms()) {
                roomType.setAvailableRooms(roomType.getAvailableRooms() + 1);
                roomTypeRepository.save(roomType);
                log.info("Room availability restored after booking deletion {}: {} -> {}", 
                        booking.getId(), roomType.getAvailableRooms() - 1, roomType.getAvailableRooms());
            }
        }
        
        // Delete VNPay transaction records before deleting booking
        try {
            vnPayTransactionRepository.deleteByBookingId(booking.getId());
            log.info("VNPay transaction records deleted before deleting booking: {}", booking.getId());
        } catch (Exception e) {
            log.warn("Failed to delete VNPay transactions for booking {}: {}", booking.getId(), e.getMessage());
        }
        
        // Delete voucher usage records if booking had voucher applied
        try {
            voucherService.deleteVoucherUsageByBookingId(booking.getId());
            log.info("Voucher usage records deleted before deleting booking: {}", booking.getId());
        } catch (Exception e) {
            log.warn("Failed to delete voucher usage for booking {}: {}", booking.getId(), e.getMessage());
        }
        
        bookingRepository.delete(booking);
    }
    
    @Override
    public void save(Booking booking) {
        bookingRepository.save(booking);
    }
    
    // ===== SEARCH & FILTER OPERATIONS =====
    
    @Override
    public DataResponse<BookingResponse> searchBookings(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching bookings with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage = bookingRepository.searchBookings(keyword, pageable);
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    @Override
    public DataResponse<BookingResponse> getBookingsByDateRange(LocalDate startDate, LocalDate endDate, 
                                                                Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting bookings by date range: {} to {}", startDate, endDate);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage = bookingRepository.findByCheckInDateBetweenOrderByCreatedAtDesc(startDate, endDate, pageable);
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    // ===== STATISTICS =====
    
    @Override
    @IsAdmin
    public Long getTotalBookingsCount() {
        return bookingRepository.count();
    }
    
    @Override
    @IsAdmin
    public Long getBookingsCountByStatus(BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }
    
    @Override
    @IsAdmin
    public Long getBookingsCountByPaymentStatus(PaymentStatus paymentStatus) {
        return bookingRepository.countByPaymentStatus(paymentStatus);
    }
    
    @Override
    @IsHost
    public Long getHostBookingsCount() {
        User currentUser = getCurrentUserRequired();
        return bookingRepository.countByHotelOwnerId(currentUser.getId());
    }
    
    @Override
    @IsHost
    public Long getHostBookingsCountByStatus(BookingStatus status) {
        User currentUser = getCurrentUserRequired();
        return bookingRepository.countByHotelOwnerIdAndStatus(currentUser.getId(), status);
    }
    
    // ===== HOST DASHBOARD METHODS =====
    
    @Override
    @IsHost
    public BigDecimal getHostTotalRevenue() {
        User currentUser = getCurrentUserRequired();
        return bookingRepository.getTotalRevenueByHost(currentUser.getId());
    }
    
    @Override
    @IsHost
    public BigDecimal getHostMonthlyRevenue() {
        User currentUser = getCurrentUserRequired();
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
        return bookingRepository.getRevenueByHostAndDateRange(currentUser.getId(), startOfMonth, endOfMonth);
    }
    
    @Override
    @IsHost
    public Double getHostOccupancyRate() {
        User currentUser = getCurrentUserRequired();
        // Simple occupancy calculation - can be enhanced with more complex logic
        Long totalRooms = roomTypeRepository.getTotalRoomsByHost(currentUser.getId());
        Long occupiedRooms = bookingRepository.getOccupiedRoomsByHost(currentUser.getId());
        
        if (totalRooms == 0) return 0.0;
        return (occupiedRooms.doubleValue() / totalRooms.doubleValue()) * 100;
    }
    
    @Override
    @IsHost
    public Long getHostBookingsCountByDateRange(UUID hostId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        return bookingRepository.countByHotelOwnerIdAndCreatedAtBetween(hostId, startDateTime, endDateTime);
    }
    
    @Override
    @IsHost
    public BigDecimal getHostRevenueByDateRange(UUID hostId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        return bookingRepository.getRevenueByHostAndDateRange(hostId, startDateTime, endDateTime);
    }

    @Override
    @IsHost
    public BigDecimal getHostTotalCommission() {
        User currentUser = getCurrentUserRequired();
        return bookingRepository.getTotalCommissionByHost(currentUser.getId());
    }

    @Override
    @IsHost
    public BigDecimal getHostCommissionByDateRange(UUID hostId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        return bookingRepository.getCommissionByHostAndDateRange(hostId, startDateTime, endDateTime);
    }
    
    @Override
    @IsHost
    public List<HostDashboardResponse.RecentBooking> getHostRecentBookings(UUID hostId, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        List<Booking> recentBookings = bookingRepository.findRecentBookingsByHost(hostId, pageable);
        
        return recentBookings.stream()
                .map(booking -> HostDashboardResponse.RecentBooking.builder()
                        .id(booking.getId().toString())
                        .guestName(booking.getUser().getName())
                        .hotelName(booking.getHotel().getName())
                        .roomTypeName(booking.getRoomType().getName())
                        .checkInDate(booking.getCheckInDate().atStartOfDay())
                        .checkOutDate(booking.getCheckOutDate().atStartOfDay())
                        .totalAmount(booking.getTotalAmount())
                        .status(booking.getStatus().name())
                        .paymentStatus(booking.getPaymentStatus().name())
                        .createdAt(booking.getCreatedAt())
                        .build())
                .toList();
    }
    
    @Override
    @IsHost
    public List<HostDashboardResponse.MonthlyData> getHostMonthlyRevenueData(UUID hostId, int months) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(months);
        
        List<Object[]> monthlyData = bookingRepository.getMonthlyRevenueByHost(hostId, startDate, endDate);
        
        return monthlyData.stream()
                .map(data -> {
                    Integer year = (Integer) data[0];
                    Integer month = (Integer) data[1];
                    String monthString = String.format("%d-%02d", year, month);
                    return HostDashboardResponse.MonthlyData.builder()
                            .month(monthString)
                            .revenue((BigDecimal) data[2])
                            .bookings((Long) data[3])
                            .build();
                })
                .toList();
    }
    
    @Override
    @IsHost
    public List<HostDashboardResponse.MonthlyData> getHostMonthlyBookingData(UUID hostId, int months) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusMonths(months);
        
        List<Object[]> monthlyData = bookingRepository.getMonthlyBookingsByHost(hostId, startDate, endDate);
        
        return monthlyData.stream()
                .map(data -> {
                    Integer year = (Integer) data[0];
                    Integer month = (Integer) data[1];
                    String monthString = String.format("%d-%02d", year, month);
                    return HostDashboardResponse.MonthlyData.builder()
                            .month(monthString)
                            .bookings((Long) data[2])
                            .revenue(BigDecimal.ZERO) // This method focuses on bookings count
                            .build();
                })
                .toList();
    }
    
    @Override
    @IsHost
    public List<HostDashboardResponse.MonthlyData> getHostMonthlyAnalytics(UUID hostId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Get actual data from database
        List<Object[]> actualData = bookingRepository.getMonthlyAnalyticsByHost(hostId, startDateTime, endDateTime);
        
        // Convert to map for easy lookup
        Map<String, HostDashboardResponse.MonthlyData> dataMap = new HashMap<>();
        for (Object[] data : actualData) {
            Integer year = (Integer) data[0];
            Integer month = (Integer) data[1];
            String monthString = String.format("%d-%02d", year, month);
            BigDecimal revenue = (BigDecimal) data[2];
            Long bookings = (Long) data[3];
            
            dataMap.put(monthString, HostDashboardResponse.MonthlyData.builder()
                    .month(monthString)
                    .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                    .bookings(bookings != null ? bookings : 0L)
                    .build());
        }
        
        // Generate all months in the range (similar to Admin Analytics logic)
        List<HostDashboardResponse.MonthlyData> result = new ArrayList<>();
        YearMonth start = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        YearMonth current = start;
        while (!current.isAfter(end) && result.size() < 12) {
            String monthKey = String.format("%d-%02d", current.getYear(), current.getMonthValue());
            
            // Use actual data if exists, otherwise create empty month
            HostDashboardResponse.MonthlyData monthData = dataMap.getOrDefault(monthKey, 
                HostDashboardResponse.MonthlyData.builder()
                        .month(monthKey)
                        .revenue(BigDecimal.ZERO)
                        .bookings(0L)
                        .build());
            
            result.add(monthData);
            current = current.plusMonths(1);
        }
        
        return result;
    }

    @Override
    @IsHost
    @Transactional
    public BookingResponse checkInBookingByHost(UUID bookingId) {
        User currentUser = getCurrentUserRequired();
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        if (booking.isQrCodeUsed()) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CHECKED_IN);
        }
        booking.setQrCodeUsed(true);
        bookingRepository.save(booking);
        return bookingMapper.toResponse(booking);
    }
} 