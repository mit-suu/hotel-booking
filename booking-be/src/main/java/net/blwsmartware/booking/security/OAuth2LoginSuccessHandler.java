package net.blwsmartware.booking.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PredefinedRole;
import net.blwsmartware.booking.entity.Role;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.repository.RoleRepository;
import net.blwsmartware.booking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${spring.security.oauth2.success-redirect-url}")
    private String successRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        log.info("=== OAuth2 Login Success Handler Triggered ===");
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Authentication type: {}", authentication.getClass().getSimpleName());
        
        try {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            OAuth2User oauth2User = oauthToken.getPrincipal();
            
            log.info("OAuth2 User attributes: {}", oauth2User.getAttributes());
            
            // Extract user information from Google
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String picture = oauth2User.getAttribute("picture");
            String googleId = oauth2User.getAttribute("sub");
            
            log.info("Extracted user info - Email: {}, Name: {}, GoogleId: {}", email, name, googleId);
            
            if (email == null || googleId == null) {
                log.error("Missing required user information from Google OAuth2");
                response.sendRedirect(successRedirectUrl + "?error=missing_user_info");
                return;
            }

            // Find or create user
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                // Case 1: New user - create with Google info
                log.info("Creating new user for email: {}", email);
                user = createNewGoogleUser(email, name, picture, googleId);
                log.info("Created new user with ID: {}", user.getId());
            } else {
                // Case 2: Existing user - handle Google account linking
                log.info("Found existing user with ID: {} for email: {}", user.getId(), email);
                user = handleExistingUserGoogleLogin(user, googleId, name, picture);
            }

            // Generate JWT tokens
            log.info("Generating JWT tokens for user: {}", user.getId());
            CustomUserDetails userDetails = new CustomUserDetails(user);
            String accessToken = jwtTokenProvider.createAccessToken(userDetails);
            String refreshToken = jwtTokenProvider.createRefreshToken(userDetails);
            
            log.info("Generated tokens successfully");

            // Redirect to frontend with tokens
            String redirectUrl = String.format("%s?accessToken=%s&refreshToken=%s&type=oauth2",
                    successRedirectUrl, accessToken, refreshToken);
            
            //log.info("Redirecting to: {}", redirectUrl);
            response.sendRedirect(redirectUrl);
            
        } catch (RuntimeException e) {
            log.error("Runtime error during OAuth2 authentication: {}", e.getMessage());
            
            if (e.getMessage().contains("different Google account")) {
                response.sendRedirect(successRedirectUrl + "?error=account_conflict&message=This email is already linked to a different Google account");
            } else if (e.getMessage().contains("role not found")) {
                response.sendRedirect(successRedirectUrl + "?error=system_error&message=System configuration error");
            } else {
                response.sendRedirect(successRedirectUrl + "?error=authentication_failed&message=" + e.getMessage());
            }
        } catch (Exception e) {
            log.error("Unexpected error during OAuth2 authentication:", e);
            response.sendRedirect(successRedirectUrl + "?error=authentication_failed&message=An unexpected error occurred");
        }
    }

    private User createNewGoogleUser(String email, String name, String picture, String googleId) {
        log.info("Creating new user from Google OAuth2: {}", email);
        
        Role userRole = roleRepository.findByName(PredefinedRole.USER_ROLE)
                .orElseThrow(() -> new RuntimeException("Default user role not found"));

        String username = generateUsernameFromEmail(email);
        
        User newUser = User.builder()
                .email(email)
                .name(name != null ? name : "Google User")
                .username(username)
                .googleId(googleId)
                .avatarUrl(picture)
                .provider("google")
                .emailVerified(true)
                .isActive(true)
                .role(userRole)
                .build();

        return userRepository.save(newUser);
    }

    private String generateUsernameFromEmail(String email) {
        log.info("Generating username from email: {}", email);
        
        String baseUsername = email.split("@")[0];
        
        // Clean up username - remove special characters and make it URL-safe
        baseUsername = baseUsername.replaceAll("[^a-zA-Z0-9._-]", "")
                                  .toLowerCase();
        
        // Ensure minimum length
        if (baseUsername.length() < 3) {
            baseUsername = "user" + baseUsername;
        }
        
        String username = baseUsername;
        int counter = 1;
        
        // Ensure username is unique
        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
            
            // Prevent infinite loop
            if (counter > 9999) {
                username = baseUsername + UUID.randomUUID().toString().substring(0, 8);
                break;
            }
        }
        
        log.info("Generated unique username: {}", username);
        return username;
    }

    private User handleExistingUserGoogleLogin(User existingUser, String googleId, String name, String picture) {
        log.info("Handling existing user Google login - Current provider: {}, GoogleId: {}", 
                existingUser.getProvider(), existingUser.getGoogleId());
        
        if (existingUser.getGoogleId() == null) {
            // Case 2a: User registered locally, first time linking Google account
            log.info("Linking Google account to existing local user: {}", existingUser.getEmail());
            existingUser.setGoogleId(googleId);
            
            // Update provider to indicate Google account is linked
            if ("local".equals(existingUser.getProvider())) {
                existingUser.setProvider("google-linked"); // Indicates originally local but now has Google
            }
            
            // Update avatar if user doesn't have one and Google provides it
            if (existingUser.getAvatarUrl() == null && picture != null) {
                log.info("Updating user avatar from Google profile");
                existingUser.setAvatarUrl(picture);
            }
            
            // Update name if user doesn't have full name and Google provides it
            if ((existingUser.getName() == null || existingUser.getName().equals(existingUser.getEmail())) 
                && name != null) {
                log.info("Updating user name from Google profile: {}", name);
                existingUser.setName(name);
            }
            
            existingUser = userRepository.save(existingUser);
            log.info("Successfully linked Google account to existing user");
            
        } else if (googleId.equals(existingUser.getGoogleId())) {
            // Case 2b: User already has this Google account linked
            log.info("User already has this Google account linked - proceeding with login");
            
            // Optionally update avatar if it has changed
            if (picture != null && !picture.equals(existingUser.getAvatarUrl())) {
                log.info("Updating user avatar from Google profile");
                existingUser.setAvatarUrl(picture);
                existingUser = userRepository.save(existingUser);
            }
            
        } else {
            // Case 2c: User has different Google account linked - this is a conflict
            log.warn("User {} tried to login with different Google account. Existing GoogleId: {}, New GoogleId: {}", 
                    existingUser.getEmail(), existingUser.getGoogleId(), googleId);
            throw new RuntimeException("This email is already linked to a different Google account");
        }
        
        return existingUser;
    }
} 