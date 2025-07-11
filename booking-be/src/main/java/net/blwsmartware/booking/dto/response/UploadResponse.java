package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UploadResponse {
    String imageUrl;
    String fileName;
    Long fileSize;
    String folder;
    String dimensions;
    boolean optimized;
    
    // For multiple uploads
    List<String> imageUrls;
    Integer uploadedCount;
    Integer totalFiles;
    
    // For delete operations
    String publicId;
    boolean deleted;
} 