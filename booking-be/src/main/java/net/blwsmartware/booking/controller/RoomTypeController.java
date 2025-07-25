package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.RoomTypeCreateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.RoomTypeResponse;
import net.blwsmartware.booking.service.RoomTypeService;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/room-types")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoomTypeController {
    
    RoomTypeService roomTypeService;
    
    // Admin endpoints
    @GetMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getAllRoomTypes(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getAllRoomTypes(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Room types retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/admin/filter")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getAllRoomTypesWithFilters(
            @RequestParam(required = false) UUID hotelId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Integer minOccupancy,
            @RequestParam(required = false) Integer maxOccupancy,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy){
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getAllRoomTypesWithFilters(
                hotelId, minOccupancy, maxOccupancy, minPrice, maxPrice, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Filtered room types retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PostMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<RoomTypeResponse>> createRoomType(@Valid @RequestBody RoomTypeCreateRequest request) {
        RoomTypeResponse response = roomTypeService.createRoomType(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<RoomTypeResponse>builder()
                        .message("Room type created successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<RoomTypeResponse>> updateRoomType(
            @PathVariable UUID id,
            @Valid @RequestBody RoomTypeCreateRequest request) {
        RoomTypeResponse response = roomTypeService.updateRoomType(id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<RoomTypeResponse>builder()
                        .message("Room type updated successfully")
                        .result(response)
                        .build());
    }
    
    @DeleteMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<?> deleteRoomType(@PathVariable UUID id) {
        roomTypeService.deleteRoomType(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.builder()
                        .message("Room type deleted successfully")
                        .build());
    }

    // Host endpoints
    @GetMapping("/host/my-room-types")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getMyRoomTypes(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getMyRoomTypes(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("My room types retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/host/hotel/{hotelId}/room-types")
    @IsHost
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getMyHotelRoomTypes(
            @PathVariable UUID hotelId,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getMyHotelRoomTypes(hotelId, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("My hotel room types retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PostMapping("/host")
    @IsHost
    public ResponseEntity<MessageResponse<RoomTypeResponse>> createMyRoomType(@Valid @RequestBody RoomTypeCreateRequest request) {
        RoomTypeResponse response = roomTypeService.createMyRoomType(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<RoomTypeResponse>builder()
                        .message("Room type created successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<RoomTypeResponse>> updateMyRoomType(
            @PathVariable UUID id,
            @Valid @RequestBody RoomTypeCreateRequest request) {
        RoomTypeResponse response = roomTypeService.updateMyRoomType(id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<RoomTypeResponse>builder()
                        .message("Room type updated successfully")
                        .result(response)
                        .build());
    }
    
    @DeleteMapping("/host/{id}")
    @IsHost
    public ResponseEntity<?> deleteMyRoomType(@PathVariable UUID id) {
        roomTypeService.deleteMyRoomType(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.builder()
                        .message("Room type deleted successfully")
                        .build());
    }
    
    @GetMapping("/host/{id}")
    @IsHost
    public ResponseEntity<MessageResponse<RoomTypeResponse>> getMyRoomTypeById(@PathVariable UUID id) {
        RoomTypeResponse response = roomTypeService.getMyRoomTypeById(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<RoomTypeResponse>builder()
                        .message("Room type retrieved successfully")
                        .result(response)
                        .build());
    }

    // Statistics endpoints
    @GetMapping("/admin/stats/total")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getTotalRoomTypesCount() {
        Long count = roomTypeService.getTotalRoomTypesCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Total room types count retrieved successfully")
                        .result(count)
                        .build());
    }
    

    @GetMapping("/admin/stats/hotel/{hotelId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getRoomTypesCountByHotel(@PathVariable UUID hotelId) {
        Long count = roomTypeService.getRoomTypesCountByHotel(hotelId);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Room types count by hotel retrieved successfully")
                        .result(count)
                        .build());
    }
    
    // Public endpoints
    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse<RoomTypeResponse>> getRoomTypeById(@PathVariable UUID id) {
        RoomTypeResponse response = roomTypeService.getRoomTypeById(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<RoomTypeResponse>builder()
                        .message("Room type retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getRoomTypesByHotel(
            @PathVariable UUID hotelId,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getRoomTypesByHotel(hotelId, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Room types by hotel retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/hotel/{hotelId}/active")
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getActiveRoomTypesByHotel(
            @PathVariable UUID hotelId,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getRoomTypesByHotel(hotelId, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Active room types by hotel retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/hotel/{hotelId}/available")
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getAvailableRoomTypesByHotel(
            @PathVariable UUID hotelId,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "pricePerNight") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getAvailableRoomTypesByHotel(hotelId, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Available room types by hotel retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> searchRoomTypes(
            @RequestParam String keyword,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.searchRoomTypes(keyword, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Room types search completed successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/occupancy/{minOccupancy}")
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getRoomTypesByOccupancy(
            @PathVariable Integer minOccupancy,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "maxOccupancy") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getRoomTypesByOccupancy(minOccupancy, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Room types by occupancy retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/price-range")
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getRoomTypesByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "pricePerNight") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getRoomTypesByPriceRange(
                minPrice, maxPrice, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Room types by price range retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/available")
    public ResponseEntity<MessageResponse<DataResponse<RoomTypeResponse>>> getAvailableRoomTypes(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "pricePerNight") String sortBy) {
        
        DataResponse<RoomTypeResponse> response = roomTypeService.getAvailableRoomTypes(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<RoomTypeResponse>>builder()
                        .message("Available room types retrieved successfully")
                        .result(response)
                        .build());
    }
} 