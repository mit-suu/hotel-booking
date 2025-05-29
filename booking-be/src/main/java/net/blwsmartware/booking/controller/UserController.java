package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.AdminPasswordUpdateRequest;
import net.blwsmartware.booking.dto.request.PasswordUpdateRequest;
import net.blwsmartware.booking.dto.request.ProfileUpdateRequest;
import net.blwsmartware.booking.dto.request.RoleOfUpdate;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.request.UserRequest;
import net.blwsmartware.booking.dto.request.UserUpdate;
import net.blwsmartware.booking.dto.response.UserResponse;
import net.blwsmartware.booking.service.UserService;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;

    @PostMapping
    public ResponseEntity<MessageResponse<UserResponse>> createUser(@RequestBody @Valid  UserRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.createUser(request))
                    .build()
                );
    }

    @GetMapping
    public ResponseEntity<MessageResponse<DataResponse<UserResponse>>> getAllPageable(
            @RequestParam(value = "pageNumber",defaultValue = PagePrepare.PAGE_NUMBER,required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(value = "sortBy",defaultValue = PagePrepare.SORT_BY, required = false) String sortBy) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<UserResponse>>builder()
                    .result(userService.getAll(pageNumber,pageSize,sortBy))
                    .build()
                );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse<UserResponse>> getUser(@PathVariable UUID id){

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.getUserByID(id))
                    .build()
                );
    }

    @GetMapping("/me")
    public ResponseEntity<MessageResponse<UserResponse>> me(){
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.getUserByID(UUID.fromString(authentication.getName())))
                    .build()
                );
    }

    @PutMapping("/profile")
    public ResponseEntity<MessageResponse<UserResponse>> updateMyProfile(@RequestBody @Valid ProfileUpdateRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = UUID.fromString(authentication.getName());
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.updateProfile(userId, request))
                    .build()
                );
    }

    @PutMapping("/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<UserResponse>> updateUser(@RequestBody @Valid  UserUpdate user, @PathVariable UUID id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.updateUser(id,user))
                    .build()
                );
    }

    @PutMapping("/me/password")
    public ResponseEntity<MessageResponse<UserResponse>> updateMyPassword(@RequestBody @Valid PasswordUpdateRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = UUID.fromString(authentication.getName());
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.updatePassword(userId, request))
                    .build()
                );
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse<UserResponse>> updateMyPasswordAlternative(@RequestBody @Valid PasswordUpdateRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = UUID.fromString(authentication.getName());
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.updatePassword(userId, request))
                    .build()
                );
    }

    @PutMapping("/{id}/password")
    @IsAdmin
    public ResponseEntity<MessageResponse<UserResponse>> updatePassword(@RequestBody @Valid PasswordUpdateRequest request, @PathVariable UUID id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.updatePassword(id, request))
                    .build()
                );
    }

    @PutMapping("/admin/{id}/password")
    @IsAdmin
    public ResponseEntity<MessageResponse<UserResponse>> adminUpdatePassword(@RequestBody @Valid AdminPasswordUpdateRequest request, @PathVariable UUID id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                    .result(userService.adminUpdatePassword(id, request))
                    .build()
                );
    }
    
    @PutMapping("/role/{id}")
    public ResponseEntity<MessageResponse<UserResponse>> updateRoleOfUser(@RequestBody RoleOfUpdate roles, @PathVariable UUID id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                        .result(userService.updateRoleOfUser(id,roles))
                        .build()
                );
    }

    @PutMapping("/email-verification/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<UserResponse>> toggleEmailVerification(@PathVariable UUID id) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                        .result(userService.toggleEmailVerification(id))
                        .build()
                );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();

    }

}
