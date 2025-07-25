package net.blwsmartware.booking.configuration;

import net.blwsmartware.booking.security.JwtCustomDecoder;
import net.blwsmartware.booking.security.OAuth2LoginFailureHandler;
import net.blwsmartware.booking.security.OAuth2LoginSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String SIGNER_KEY;

    @Value("${config.cors}")
    private String URL_CORS;

    private static final String[] PUBLIC_ENDPOINTS = {
            "/users",
            "/auth/**",
            "/oauth2/**", // Add OAuth2 endpoints
            "/login/oauth2/**", // Add OAuth2 login endpoints
            "/api/payment/vnpay/ipn" // VNPay IPN callback - không cần authentication
    };

    private static final String[] PUBLIC_GET_ENDPOINTS = {
            "/hotels/{id}",
            "/hotels/search",
            "/hotels/city/**",
            "/hotels/country/**", 
            "/hotels/rating/**",
            "/hotels/active",
            "/hotels/featured",
            "/hotels/search/filters",
            "/hotels/amenities",
            "/room-types/hotel/**",
            "/bookings/check-availability", // Only keep availability check as public
            "/api/upload/test", // Allow test endpoint for upload service verification
            "/api/payment/vnpay/return", // VNPay return URL - không cần authentication
            "/oauth2/**", // Add OAuth2 GET endpoints
            "/login/oauth2/**" // Add OAuth2 login GET endpoints
    };
    private final JwtCustomDecoder customJwtDecoder;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    public SecurityConfig(JwtCustomDecoder customJwtDecoder, 
                         OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                         OAuth2LoginFailureHandler oAuth2LoginFailureHandler) {
        this.customJwtDecoder = customJwtDecoder;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorize -> {
                    authorize.requestMatchers(
                                    HttpMethod.POST,PUBLIC_ENDPOINTS).permitAll()
                            .requestMatchers(
                                    HttpMethod.GET,PUBLIC_GET_ENDPOINTS).permitAll()
                            .requestMatchers("/swagger-ui/**").permitAll()
                            .requestMatchers("/v3/**").permitAll()
                            .requestMatchers("/actuator/**").permitAll()
                            .anyRequest().authenticated();
                } )
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception->exception.authenticationEntryPoint(new JwtAuthEntryPoint()))

                // Add OAuth2 Login configuration
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )

                .oauth2ResourceServer(oauth2 -> {
                            oauth2.jwt(jwtConfigurer ->
                                            jwtConfigurer.decoder(customJwtDecoder)
                                                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                                    )

                                    .authenticationEntryPoint(new JwtAuthEntryPoint())
                            ;

                        }
                )  ;

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow specific origins (can be multiple)
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // For development
        // configuration.setAllowedOrigins(Arrays.asList(URL_CORS)); // For production
        
        // Allow all HTTP methods including PATCH
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
        ));
        
        // Allow all necessary headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type", 
            "Authorization", 
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        // Expose headers that client can access
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter granted = new JwtGrantedAuthoritiesConverter();
        granted.setAuthorityPrefix("");
        JwtAuthenticationConverter converter =  new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(granted);
        return converter;
    }
}