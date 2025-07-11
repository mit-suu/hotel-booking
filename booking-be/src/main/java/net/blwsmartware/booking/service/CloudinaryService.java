package net.blwsmartware.booking.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CloudinaryService {
    String uploadImage(MultipartFile file, String folder);
    String uploadImageWithTransformation(MultipartFile file, String folder, int width, int height);
    List<String> uploadMultipleImages(List<MultipartFile> files, String folder);
    boolean deleteImage(String publicId);
    String extractPublicIdFromUrl(String imageUrl);
} 