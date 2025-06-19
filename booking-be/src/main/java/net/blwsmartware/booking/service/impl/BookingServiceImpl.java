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
import net.blwsmartware.booking.service.BookingService;
import net.blwsmartware.booking.service.VoucherService;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
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
    BookingMapper bookingMapper;
    VoucherService voucherService;
    
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
        
        // 8. Create booking entity with authenticated user info
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
        
        // 9. Save booking
        booking = bookingRepository.save(booking);
        
        // 10. Apply voucher if provided
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
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_CANNOT_BE_CANCELLED);
        }
        
        // Update booking status to cancelled by guest
        booking.setStatus(BookingStatus.CANCELLED_BY_GUEST);
        
        // Update payment status based on current payment status
        if (booking.getPaymentStatus() == PaymentStatus.PENDING) {
            // If not paid yet, set to NO_PAYMENT
            booking.setPaymentStatus(PaymentStatus.NO_PAYMENT);
        } else if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            // If already paid, set to REFUND_PENDING for host to process
            booking.setPaymentStatus(PaymentStatus.REFUND_PENDING);
        }
        // Other payment statuses remain unchanged
        
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        // Remove voucher usage if booking had voucher applied
        try {
            voucherService.removeVoucherUsage(booking.getId());
            log.info("Voucher usage removed for cancelled booking: {}", booking.getId());
        } catch (Exception e) {
            log.warn("Failed to remove voucher usage for booking {}: {}", booking.getId(), e.getMessage());
        }
        
        log.info("Booking cancelled: {}", bookingId);
        
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
        // Check basic availability
        if (!isRoomAvailable(roomTypeId, checkInDate, checkOutDate)) {
            throw new AppRuntimeException(ErrorResponse.NO_ROOMS_AVAILABLE);
        }
        
        // Check for overlapping bookings (conflict detection)
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                roomTypeId, checkInDate, checkOutDate);
        
        if (!overlappingBookings.isEmpty()) {
            log.warn("Found {} overlapping bookings for room type {} between {} and {}", 
                    overlappingBookings.size(), roomTypeId, checkInDate, checkOutDate);
            throw new AppRuntimeException(ErrorResponse.BOOKING_CONFLICT_DETECTED);
        }
        
        // Check for maintenance periods (if implemented)
        if (isRoomUnderMaintenance(roomTypeId, checkInDate, checkOutDate)) {
            throw new AppRuntimeException(ErrorResponse.ROOM_UNDER_MAINTENANCE);
        }
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
    
    @Override
    public boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        return isRoomAvailable(roomTypeId, checkInDate, checkOutDate, null);
    }
    
    @Override
    public boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, UUID excludeBookingId) {
        RoomType roomType = getRoomTypeById(roomTypeId);
        
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
        
        // Host can update more fields than regular users
        bookingMapper.updateEntity(booking, request);
        booking.setUpdatedBy(currentUser.getId());
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
        
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppRuntimeException(ErrorResponse.BOOKING_CANNOT_BE_CANCELLED);
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        // Remove voucher usage if booking had voucher applied
        try {
            voucherService.removeVoucherUsage(booking.getId());
            log.info("Voucher usage removed for host cancelled booking: {}", booking.getId());
        } catch (Exception e) {
            log.warn("Failed to remove voucher usage for booking {}: {}", booking.getId(), e.getMessage());
        }
        
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
        
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setUpdatedAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        
        log.info("Successfully completed booking: {}", bookingId);
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @Transactional
    public BookingResponse confirmPayment(UUID bookingId) {
        log.info("Confirming payment for booking ID: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        Booking booking = null;
        
        // Check if user is admin or host
        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getName()));
        
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
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new AppRuntimeException(ErrorResponse.INVALID_BOOKING_STATUS);
        }
        
        // Update booking status based on refund decision
        if (request.getRefundAmount() != null && request.getRefundAmount().compareTo(BigDecimal.ZERO) > 0) {
            booking.setStatus(BookingStatus.CANCELLED_BY_GUEST);
            
            // Determine refund status based on amount
            BigDecimal totalAmount = booking.getTotalAmount();
            if (request.getRefundAmount().compareTo(totalAmount) == 0) {
                // Full refund
                booking.setPaymentStatus(PaymentStatus.REFUNDED);
            } else {
                // Partial refund
                booking.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
            }
        } else {
            booking.setStatus(BookingStatus.CANCELLED_BY_HOST);
            booking.setPaymentStatus(PaymentStatus.CANCELLED);
        }
        
        // Set cancellation details
        booking.setCancellationReason(request.getReason());
        booking.setRefundAmount(request.getRefundAmount());
        booking.setUpdatedAt(LocalDateTime.now());
        booking.setUpdatedBy(currentUser.getId());
        
        booking = bookingRepository.save(booking);
        
        // Remove voucher usage if booking had voucher applied
        try {
            voucherService.removeVoucherUsage(booking.getId());
            log.info("Voucher usage removed for processed cancellation: {}", booking.getId());
        } catch (Exception e) {
            log.warn("Failed to remove voucher usage for booking {}: {}", booking.getId(), e.getMessage());
        }
        
        log.info("Successfully processed cancellation for booking: {}", bookingId);
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
        
        bookingMapper.updateEntity(booking, request);
        booking.setUpdatedBy(currentUser.getId());
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
        
        // Delete voucher usage records if booking had voucher applied
        try {
            voucherService.deleteVoucherUsageByBookingId(booking.getId());
            log.info("Voucher usage records deleted before deleting booking: {}", booking.getId());
        } catch (Exception e) {
            log.warn("Failed to delete voucher usage for booking {}: {}", booking.getId(), e.getMessage());
        }
        
        bookingRepository.delete(booking);
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
} 