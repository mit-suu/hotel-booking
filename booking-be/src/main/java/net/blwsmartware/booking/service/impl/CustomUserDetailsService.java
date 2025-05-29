package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.exception.IdentityRuntimeException;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.security.CustomUserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@RequiredArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@Service
public class CustomUserDetailsService implements UserDetailsService {

    UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)  {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IdentityRuntimeException(ErrorResponse.USER_NOT_FOUND));
        if(!user.isActive() ) {
            throw  new IdentityRuntimeException(ErrorResponse.USER_BLOCKED) ;
        }
        else if(!user.isEmailVerified()) {
            throw  new IdentityRuntimeException(ErrorResponse.USER_NOT_VERIFICATION) ;
        }
        return new CustomUserDetails(user);
    }
    public UserDetails loadUserByID(String id)  {

        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new IdentityRuntimeException(ErrorResponse.USER_NOT_FOUND));
        return new CustomUserDetails(user);
    }
}

