package net.blwsmartware.booking.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.service.CloudinaryService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;
    
    private static final List<String> ALLOWED_FORMATS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        validateFile(file);
        
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", folder,
                "transformation", "q_auto,f_auto",
                "allowed_formats", ALLOWED_FORMATS,
                "resource_type", "image"
            );

            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            log.info("Image uploaded successfully to folder: {}", folder);
            return result.get("secure_url").toString();
        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary for folder: {}", folder, e);
            throw new AppRuntimeException(ErrorResponse.FILE_PROCESSING_ERROR);
        }
    }

    @Override
    public String uploadImageWithTransformation(MultipartFile file, String folder, int width, int height) {
        validateFile(file);
        
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", folder,
                "transformation", String.format("w_%d,h_%d,c_fill,q_auto,f_auto", width, height),
                "allowed_formats", ALLOWED_FORMATS,
                "resource_type", "image"
            );

            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            log.info("Image uploaded with transformation {}x{} to folder: {}", width, height, folder);
            return result.get("secure_url").toString();
        } catch (IOException e) {
            log.error("Error uploading image with transformation to Cloudinary", e);
            throw new AppRuntimeException(ErrorResponse.FILE_PROCESSING_ERROR);
        }
    }

    @Override
    public List<String> uploadMultipleImages(List<MultipartFile> files, String folder) {
        List<String> uploadedUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                String url = uploadImage(file, folder);
                uploadedUrls.add(url);
            } catch (Exception e) {
                log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
                // Continue with other files
            }
        }
        
        return uploadedUrls;
    }

    @Override
    public boolean deleteImage(String publicId) {
        try {
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted with publicId: {}", publicId);
            return "ok".equals(result.get("result"));
        } catch (IOException e) {
            log.error("Error deleting image from Cloudinary with publicId: {}", publicId, e);
            return false;
        }
    }

    @Override
    public String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return null;
        }
        
        try {
            // Extract public_id from Cloudinary URL
            // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformation}/{folder}/{public_id}.{format}
            String[] parts = imageUrl.split("/");
            if (parts.length > 0) {
                String lastPart = parts[parts.length - 1];
                // Remove file extension
                int dotIndex = lastPart.lastIndexOf('.');
                if (dotIndex > 0) {
                    return lastPart.substring(0, dotIndex);
                }
                return lastPart;
            }
        } catch (Exception e) {
            log.error("Error extracting public_id from URL: {}", imageUrl, e);
        }
        
        return null;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new AppRuntimeException(ErrorResponse.FILE_EMPTY);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppRuntimeException(ErrorResponse.FILE_TOO_LARGE);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppRuntimeException(ErrorResponse.INVALID_FILE_TYPE);
        }
    }
} 