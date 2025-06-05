package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.*;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse createUser(UserRequest request);
    UserResponse confirmEmail(ConfirmEmailRequest request);
    UserResponse resendCodeMail(ResendEmailRequest request);
    UserResponse newPass(NewPassRequest request);
    DataResponse<UserResponse> getAll(Integer pageNumber, Integer pageSize, String sortBy);
    UserResponse getUserByID(UUID id);
    UserResponse getUserByEmail(String email);
    UserResponse getUserByUsername(String username);
    UserResponse updateUser(UUID id, UserUpdate request);
    UserResponse updateProfile(UUID id, ProfileUpdateRequest request);
    UserResponse updatePassword(UUID id, PasswordUpdateRequest request);
    UserResponse adminUpdatePassword(UUID id, AdminPasswordUpdateRequest request);
    UserResponse updateRoleOfUser(UUID id, RoleOfUpdate request);
    UserResponse toggleEmailVerification(UUID id);
    void deleteUser(UUID id);
    
    // Statistics
    Long getTotalUsersCount();
}
