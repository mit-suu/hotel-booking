package net.blwsmartware.booking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.UploadResponse;
import net.blwsmartware.booking.service.CloudinaryService;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Upload Management Controller
 * 
 * Provides endpoints for file upload to Cloudinary with:
 * - Single image upload with custom folder
 * - Optimized hotel images (1200x800)  
 * - Optimized room images (800x600)
 * - Multiple images upload
 * - Image deletion by URL
 * - Service status testing
 */
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Upload Controller", description = "APIs for file upload management")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UploadController {

    CloudinaryService cloudinaryService;
    
    // ===== PUBLIC ENDPOINTS =====

    @PostMapping("/image")
    @Operation(summary = "Upload single image", description = "Upload a single image to Cloudinary")
    public ResponseEntity<MessageResponse<UploadResponse>> uploadImage(
            @RequestParam("file") @NotNull MultipartFile file,
            @RequestParam(defaultValue = "uploads") String folder) {

        log.info("Uploading image: {} to folder: {}", file.getOriginalFilename(), folder);
        String imageUrl = cloudinaryService.uploadImage(file, folder);
        
        UploadResponse uploadResponse = UploadResponse.builder()
                .imageUrl(imageUrl)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .folder(folder)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<UploadResponse>builder()
                        .success(true)
                        .message("Image uploaded successfully")
                        .result(uploadResponse)
                        .build());
    }

    @PostMapping("/images/multiple")
    @Operation(summary = "Upload multiple images", description = "Upload multiple images to Cloudinary")
    public ResponseEntity<MessageResponse<UploadResponse>> uploadMultipleImages(
            @RequestParam("files") @NotNull List<MultipartFile> files,
            @RequestParam(defaultValue = "uploads") String folder) {

        log.info("Uploading {} images to folder: {}", files.size(), folder);
        List<String> imageUrls = cloudinaryService.uploadMultipleImages(files, folder);
        
        UploadResponse uploadResponse = UploadResponse.builder()
                .imageUrls(imageUrls)
                .uploadedCount(imageUrls.size())
                .totalFiles(files.size())
                .folder(folder)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<UploadResponse>builder()
                        .success(true)
                        .message(String.format("Successfully uploaded %d out of %d images", imageUrls.size(), files.size()))
                        .result(uploadResponse)
                        .build());
    }
    
    // ===== HOST ENDPOINTS =====

    @PostMapping("/hotel-image")
    @IsHost
    @Operation(summary = "Upload hotel image", description = "Upload optimized hotel image")
    public ResponseEntity<MessageResponse<UploadResponse>> uploadHotelImage(
            @RequestParam("file") @NotNull MultipartFile file) {

        log.info("Uploading hotel image: {}", file.getOriginalFilename());
        String imageUrl = cloudinaryService.uploadImageWithTransformation(file, "hotels", 1200, 800);
        
        UploadResponse uploadResponse = UploadResponse.builder()
                .imageUrl(imageUrl)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .folder("hotels")
                .dimensions("1200x800")
                .optimized(true)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<UploadResponse>builder()
                        .success(true)
                        .message("Hotel image uploaded successfully")
                        .result(uploadResponse)
                        .build());
    }

    @PostMapping("/room-image")
    @IsHost
    @Operation(summary = "Upload room image", description = "Upload optimized room image")
    public ResponseEntity<MessageResponse<UploadResponse>> uploadRoomImage(
            @RequestParam("file") @NotNull MultipartFile file) {

        log.info("Uploading room image: {}", file.getOriginalFilename());
        String imageUrl = cloudinaryService.uploadImageWithTransformation(file, "rooms", 800, 600);
        
        UploadResponse uploadResponse = UploadResponse.builder()
                .imageUrl(imageUrl)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .folder("rooms")
                .dimensions("800x600")
                .optimized(true)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<UploadResponse>builder()
                        .success(true)
                        .message("Room image uploaded successfully")
                        .result(uploadResponse)
                        .build());
    }

    // ===== DELETE ENDPOINTS =====

    @DeleteMapping("/image")
    @Operation(summary = "Delete image", description = "Delete image from Cloudinary")
    public ResponseEntity<MessageResponse<UploadResponse>> deleteImage(@RequestParam String imageUrl) {
        
        log.info("Deleting image: {}", imageUrl);
        String publicId = cloudinaryService.extractPublicIdFromUrl(imageUrl);
        if (publicId == null) {
            UploadResponse uploadResponse = UploadResponse.builder()
                    .imageUrl(imageUrl)
                    .deleted(false)
                    .build();

            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(MessageResponse.<UploadResponse>builder()
                            .success(false)
                            .message("Invalid image URL format")
                            .result(uploadResponse)
                            .build());
        }

        boolean deleted = cloudinaryService.deleteImage(publicId);
        
        UploadResponse uploadResponse = UploadResponse.builder()
                .imageUrl(imageUrl)
                .publicId(publicId)
                .deleted(deleted)
                .build();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<UploadResponse>builder()
                        .success(deleted)
                        .message(deleted ? "Image deleted successfully" : "Failed to delete image")
                        .result(uploadResponse)
                        .build());
    }
} 