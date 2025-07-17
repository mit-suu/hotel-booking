package net.blwsmartware.booking.controller;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.MessageResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/oauth2")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class OAuth2Controller {

    @Value("${config.cors}")
    String frontendUrl;

    @Value("${spring.security.oauth2.success-redirect-url}")
    String successRedirectUrl;

    @GetMapping("/test")
    public ResponseEntity<MessageResponse<String>> test(HttpServletRequest request) {
        log.info("OAuth2 test endpoint called from: {}", request.getRemoteAddr());
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Request Headers: User-Agent = {}", request.getHeader("User-Agent"));
        
        return ResponseEntity.ok()
                .body(MessageResponse.<String>builder()
                        .message("OAuth2 test endpoint working!")
                        .result("Backend is receiving requests properly")
                        .build());
    }

    @GetMapping("/authorization/google")
    public ResponseEntity<MessageResponse<String>> googleLogin(HttpServletRequest request) {
        log.info("=== GOOGLE OAUTH2 LOGIN REQUEST RECEIVED ===");
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Request from IP: {}", request.getRemoteAddr());
        log.info("User-Agent: {}", request.getHeader("User-Agent"));
        log.info("Referer: {}", request.getHeader("Referer"));
        
        // Return the OAuth2 authorization URL
        String authUrl = "/oauth2/authorization/google";
        
        log.info("Returning auth URL: {}", authUrl);
        
        return ResponseEntity.ok()
                .body(MessageResponse.<String>builder()
                        .message("Redirect to Google OAuth2")
                        .result(authUrl)
                        .build());
    }

    @GetMapping("/config/debug")
    public ResponseEntity<MessageResponse<Map<String, String>>> debugConfig() {
        log.info("OAuth2 debug config requested");
        
        Map<String, String> config = new HashMap<>();
        config.put("frontendUrl", frontendUrl);
        config.put("successRedirectUrl", successRedirectUrl);
        config.put("expectedGoogleAuthUrl", "/oauth2/authorization/google");
        config.put("expectedCallbackUrl", "/login/oauth2/code/google");
        
        return ResponseEntity.ok()
                .body(MessageResponse.<Map<String, String>>builder()
                        .message("OAuth2 Configuration Debug Info")
                        .result(config)
                        .build());
    }

    @GetMapping("/success")
    public ResponseEntity<MessageResponse<String>> oauthSuccess() {
        log.info("OAuth2 success page accessed");
        
        return ResponseEntity.ok()
                .body(MessageResponse.<String>builder()
                        .message("OAuth2 authentication successful")
                        .result("Please check your authentication tokens in the URL parameters")
                        .build());
    }

    @GetMapping("/error")
    public ResponseEntity<MessageResponse<String>> oauthError() {
        log.info("OAuth2 error page accessed");
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(MessageResponse.<String>builder()
                        .message("OAuth2 authentication failed")
                        .result("Please try again or contact support")
                        .success(false)
                        .build());
    }

    @GetMapping("/scenarios")
    public ResponseEntity<MessageResponse<Map<String, String>>> getTestScenarios() {
        log.info("OAuth2 test scenarios requested");
        
        Map<String, String> scenarios = new HashMap<>();
        scenarios.put("scenario_1", "New user with Gmail - Will create new account with Google provider");
        scenarios.put("scenario_2", "Existing local user, first Google login - Will link Google account to existing user");
        scenarios.put("scenario_3", "Existing user with same Google account - Will login normally");
        scenarios.put("scenario_4", "Existing user with different Google account - Will show conflict error");
        scenarios.put("note", "Test by creating users manually with same email but different googleId values");
        
        return ResponseEntity.ok()
                .body(MessageResponse.<Map<String, String>>builder()
                        .message("OAuth2 Test Scenarios")
                        .result(scenarios)
                        .build());
    }
} 