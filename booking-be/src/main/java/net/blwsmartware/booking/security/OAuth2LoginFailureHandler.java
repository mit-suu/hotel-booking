package net.blwsmartware.booking.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    @Value("${spring.security.oauth2.success-redirect-url}")
    private String successRedirectUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        log.error("=== OAuth2 Login Failure Handler Triggered ===");
        log.error("Request URL: {}", request.getRequestURL());
        log.error("Request from IP: {}", request.getRemoteAddr());
        log.error("Exception type: {}", exception.getClass().getSimpleName());
        log.error("Exception message: {}", exception.getMessage());
        log.error("Full exception: ", exception);
        
        // Redirect to frontend with error
        String redirectUrl = String.format("%s?error=oauth2_failed&message=%s", 
                successRedirectUrl, exception.getMessage());
        
        log.error("Redirecting to error page: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }
} 