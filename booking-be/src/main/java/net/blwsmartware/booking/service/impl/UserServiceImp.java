package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.constant.PredefinedRole;
import net.blwsmartware.booking.dto.request.*;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.UserResponse;
import net.blwsmartware.booking.entity.Role;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.mapper.UserMapper;
import net.blwsmartware.booking.repository.RoleRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.EmailService;
import net.blwsmartware.booking.service.UserService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImp implements UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    EmailService emailService;

    public static String generateRandomString(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder result = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(characters.length());
            result.append(characters.charAt(index));
        }

        return result.toString();
    }

    @Override
    public UserResponse createUser(UserRequest request) {

        if(userRepository.findByEmail(request.getEmail()).isPresent() ) {
           throw  new AppRuntimeException(ErrorResponse.EMAIL_EXISTED);
        }
        else if (userRepository.findByUsername(request.getUsername()).isPresent() ) {
            throw  new AppRuntimeException(ErrorResponse.USERNAME_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Role roleUserDefault = roleRepository.findByName(PredefinedRole.USER_ROLE)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROLE_NOT_EXISTED) );

        Set<Role> roleSet = Set.of(roleUserDefault);
        user.setRoles(roleSet);

        String code = generateRandomString(6);
        user.setCode(code);
        user.setEmailVerified(false);
        user.setCodeExpr(new Date(System.currentTimeMillis() + ( 5 * 60 * 1000 ) ));

        user = userRepository.save(user);

        if(user.getId()!=null ) {

            emailService.sendEmail(
                    EmailRequest.builder()
                            .to(user.getEmail())
                            .content("Your verification code:"+code +" and expiration in 5 minutes ")
                            .subject("Verification Code")
                            .build());
        }

        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse confirmEmail(ConfirmEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.EMAIL_EXISTED) );
        if (user.getCodeExpr() != null) {

            Instant exp = user.getCodeExpr().toInstant();
            if (exp.isBefore(Instant.now() )) {
                throw new AppRuntimeException(ErrorResponse.CODE_EXPIRED);
            }
            if( !user.getCode().equals(request.getCode().toUpperCase())) {
                throw new AppRuntimeException(ErrorResponse.CODE_INVALID);
            }

            user.setCode(null);
            user.setEmailVerified(true);
            user.setCodeExpr(null);
            userRepository.save(user) ;
        }
        else throw new AppRuntimeException(ErrorResponse.CODE_NOT_FOUND);

        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse resendCodeMail(ResendEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.EMAIL_EXISTED) );

        String code = generateRandomString(6);
        user.setCode(code);
        user.setEmailVerified(false);
        user.setCodeExpr(new Date(System.currentTimeMillis() + ( 5 * 60 * 1000 ) ));

        user = userRepository.save(user);

        if(user.getId()!=null ) {

            emailService.sendEmail(
                    EmailRequest.builder()
                            .to(user.getEmail())
                            .content("Your verification code:"+code +" and expiration in 5 minutes ")
                            .subject("Verification Code")
                            .build());
        }

        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse newPass(NewPassRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.EMAIL_EXISTED) );
        if (user.getCodeExpr() != null ) {

            Instant exp = user.getCodeExpr().toInstant();
            if (exp.isBefore(Instant.now() )) {
                throw new AppRuntimeException(ErrorResponse.CODE_EXPIRED);
            }
            if( !user.getCode().equals(request.getCode().toUpperCase())) {
                throw new AppRuntimeException(ErrorResponse.CODE_INVALID);
            }


            user.setCode(null);
            user.setEmailVerified(true);
            user.setCodeExpr(null);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user) ;

        }
        else throw new AppRuntimeException(ErrorResponse.CODE_NOT_FOUND);

        return userMapper.toUserResponse(user);
    }

    @Override
    public DataResponse<UserResponse> getAll(Integer pageNumber, Integer pageSize, String sortBy) {

        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).ascending());
        Page<User> pageOfUsers = userRepository.findAll(pageable);
        List<User> userList = pageOfUsers.getContent();
        List<UserResponse>  userResponses = userList.stream().map(userMapper::toUserResponse).toList();
        return DataResponseUtils.convertPageInfo(pageOfUsers,userResponses);
    }

    @Override
    @IsAdmin
    public DataResponse<UserResponse> getHostUsers(Integer pageNumber, Integer pageSize, String sortBy) {
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).ascending());
        
        // Find role HOST
        Role hostRole = roleRepository.findByName(PredefinedRole.HOST_ROLE)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROLE_NOT_EXISTED));
        
        // Find users with HOST role
        Page<User> pageOfUsers = userRepository.findByRolesContaining(hostRole, pageable);
        List<User> userList = pageOfUsers.getContent();
        List<UserResponse> userResponses = userList.stream().map(userMapper::toUserResponse).toList();
        
        return DataResponseUtils.convertPageInfo(pageOfUsers, userResponses);
    }

    @Override
    public UserResponse getUserByID(UUID id) {
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND))
        );
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        return userMapper.toUserResponse(userRepository.findByEmail(email)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND))
        );
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        return userMapper.toUserResponse(userRepository.findByUsername(username)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND))
        );
    }

    @Override
    public UserResponse updateUser(UUID id, UserUpdate request) {
        User old = userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));

        userMapper.updateUser(request,old);
        
        return userMapper.toUserResponse(userRepository.save(old));
    }

    @Override
    public UserResponse updateProfile(UUID id, ProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));

        userMapper.updateProfile(request, user);
        
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updatePassword(UUID id, PasswordUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppRuntimeException(ErrorResponse.PASSWORD_INCORRECT);
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @IsAdmin
    public UserResponse adminUpdatePassword(UUID id, AdminPasswordUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));

        // Admin can update password without current password verification
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @IsAdmin
    public UserResponse updateRoleOfUser(UUID id, RoleOfUpdate request) {
        User old = userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        var roles = roleRepository.findAllById(request.getRoleIds());
        old.setRoles(new HashSet<>(roles));
        return userMapper.toUserResponse(userRepository.save(old));
    }

    @Override
    @IsAdmin
    public UserResponse toggleEmailVerification(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        user.setEmailVerified(!user.isEmailVerified());
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse requestHost(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        // Check if user already has HOST role
        boolean hasHostRole = user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(PredefinedRole.HOST_ROLE));
        
        if (hasHostRole) {
            throw new AppRuntimeException(ErrorResponse.USER_ALREADY_HOST);
        }
        
        user.setHostRequested(true);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    @IsAdmin
    public UserResponse approveHostRequest(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        // Check if user has requested host role
        if (!user.isHostRequested()) {
            throw new AppRuntimeException(ErrorResponse.HOST_REQUEST_NOT_FOUND);
        }
        
        // Add HOST role to user
        Role hostRole = roleRepository.findByName(PredefinedRole.HOST_ROLE)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.ROLE_NOT_EXISTED));
        
        Set<Role> userRoles = new HashSet<>(user.getRoles());
        userRoles.add(hostRole);
        user.setRoles(userRoles);
        
        // Reset host request flag
        user.setHostRequested(false);
        
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(UUID id) {
        userRepository.deleteById(id);
    }

    @Override
    @IsAdmin
    public Long getTotalUsersCount() {
        return userRepository.count();
    }
}
