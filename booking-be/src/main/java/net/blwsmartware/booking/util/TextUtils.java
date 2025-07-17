package net.blwsmartware.booking.util;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.stream.Collectors;

public class TextUtils {
    
    /**
     * Chuyển đổi tiếng Việt có dấu thành không dấu và viết hoa chữ cái đầu mỗi từ
     * Ví dụ: "Việt Nam" -> "Viet Nam"
     */
    public static String normalizeVietnameseText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        // Bước 1: Trim và loại bỏ khoảng trắng thừa
        String cleanText = text.trim().replaceAll("\\s+", " ");
        
        // Bước 2: Chuyển đổi có dấu thành không dấu
        String normalized = removeDiacritics(cleanText);
        
        // Bước 3: Viết hoa chữ cái đầu mỗi từ
        String capitalized = capitalizeWords(normalized);
        
        return capitalized;
    }
    
    /**
     * Loại bỏ dấu tiếng Việt
     */
    private static String removeDiacritics(String text) {
        // Sử dụng Normalizer để tách dấu ra khỏi chữ cái
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        
        // Loại bỏ các ký tự dấu (combining marks)
        String withoutDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        
        // Xử lý các trường hợp đặc biệt của tiếng Việt
        withoutDiacritics = withoutDiacritics
                .replace("Đ", "D")
                .replace("đ", "d");
        
        return withoutDiacritics;
    }
    
    /**
     * Viết hoa chữ cái đầu mỗi từ
     */
    private static String capitalizeWords(String text) {
        return Arrays.stream(text.split("\\s+"))
                .map(word -> {
                    if (word.isEmpty()) {
                        return word;
                    }
                    return word.substring(0, 1).toUpperCase() + 
                           (word.length() > 1 ? word.substring(1).toLowerCase() : "");
                })
                .collect(Collectors.joining(" "));
    }
    
    /**
     * Chuyển đổi city name
     */
    public static String normalizeCityName(String cityName) {
        return normalizeVietnameseText(cityName);
    }
    
    /**
     * Chuyển đổi country name
     */
    public static String normalizeCountryName(String countryName) {
        return normalizeVietnameseText(countryName);
    }
} 