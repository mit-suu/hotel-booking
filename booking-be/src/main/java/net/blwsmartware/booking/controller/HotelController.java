package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.HotelCreateRequest;
import net.blwsmartware.booking.dto.request.HotelUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.HotelResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.service.HotelService;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Hotel Management Controller
 *
 * URL Structure (Fixed conflicts):
 * - Admin URLs:     /hotels/admin/...
 * - Host URLs:      /hotels/host/...
 * - Public URLs:    /hotels/{staticPath} (search, city, country, etc.)
 * - Public Details: /hotels/{id} (hotel details by ID)
 *
 * This structure avoids URL conflicts and provides clear separation between:
 * - Admin: Full management of ALL hotels
 * - Host: Management of OWNED hotels only
 * - Public: Read-only access to active hotels
 */
@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HotelController {

    HotelService hotelService;

    // ===== ADMIN ENDPOINTS =====
    @GetMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getAllHotels(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy) {

        DataResponse<HotelResponse> response = hotelService.getAllHotels(pageNumber, pageSize, sortBy);

        // Debug logging
        log.info("=== HOTEL RESPONSE DEBUG ===");
        log.info("Total hotels returned: {}", response.getContent().size());

        response.getContent().forEach((hotel) -> {
            log.info("Hotel {}:", hotel.getName());
            log.info("  - ID: {}", hotel.getId());
            log.info("  - isActive: {}", hotel.isActive());
            log.info("  - isFeatured: {} ", hotel.isFeatured());
        });

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels retrieved successfully")
                        .result(response)
                        .build());
    }

    @GetMapping("/admin/owner/{ownerId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getHotelsByOwner(
            @PathVariable UUID ownerId,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy) {

        DataResponse<HotelResponse> response = hotelService.getHotelsByOwner(ownerId, pageNumber, pageSize, sortBy);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels by owner retrieved successfully")
                        .result(response)
                        .build());
    }

    // ===== HOST ENDPOINTS =====
    @GetMapping("/host")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getMyHotels(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy) {

        DataResponse<HotelResponse> response = hotelService.getMyHotels(pageNumber, pageSize, sortBy);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("My hotels retrieved successfully")
                        .result(response)
                        .build());
    }

    @GetMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<HotelResponse>> getMyHotelById(@PathVariable UUID id) {
        HotelResponse response = hotelService.getMyHotelById(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel details retrieved successfully")
                        .result(response)
                        .build());
    }

    @PostMapping("/host")
    @IsHost
    public ResponseEntity<MessageResponse<HotelResponse>> createMyHotel(@Valid @RequestBody HotelCreateRequest request) {
        HotelResponse response = hotelService.createMyHotel(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel created successfully")
                        .result(response)
                        .build());
    }

    @PutMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<HotelResponse>> updateMyHotel(
            @PathVariable UUID id,
            @Valid @RequestBody HotelUpdateRequest request) {
        HotelResponse response = hotelService.updateMyHotel(id, request);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel updated successfully")
                        .result(response)
                        .build());
    }

    @DeleteMapping("/host/{id}")
    @IsHost
    public ResponseEntity<?> deleteMyHotel(@PathVariable UUID id) {
        hotelService.deleteMyHotel(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.builder()
                        .message("Hotel deleted successfully")
                        .build());
    }

    // Host Statistics endpoints
    @GetMapping("/host/stats/total")
    @IsHost
    public ResponseEntity<MessageResponse<Long>> getMyHotelsCount() {
        Long count = hotelService.getMyHotelsCount();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("My hotels count retrieved successfully")
                        .result(count)
                        .build());
    }

    // ===== PUBLIC ENDPOINTS =====
    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse<HotelResponse>> getHotelById(@PathVariable UUID id) {
        HotelResponse response = hotelService.getHotelById(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel retrieved successfully")
                        .result(response)
                        .build());
    }

    @GetMapping("/search")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> searchHotels(
            @RequestParam String keyword,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {

        DataResponse<HotelResponse> response = hotelService.searchHotels(keyword, pageNumber, pageSize, sortBy);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels search completed successfully")
                        .result(response)
                        .build());
    }

    @GetMapping("/amenities")
    public ResponseEntity<MessageResponse<List<String>>> getAvailableAmenities() {
        List<String> amenities = hotelService.getAvailableAmenities();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<List<String>>builder()
                        .message("Available amenities retrieved successfully")
                        .result(amenities)
                        .build());
    }
}