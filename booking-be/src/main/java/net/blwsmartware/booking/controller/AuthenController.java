package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.*;
import net.blwsmartware.booking.dto.response.AuthenResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.UserResponse;
import net.blwsmartware.booking.dto.response.VerifyResponse;
import net.blwsmartware.booking.service.AuthenticationService;
import net.blwsmartware.booking.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenController {

    UserService userService;
    AuthenticationService authenService;

    @PostMapping("/verify")
    public ResponseEntity<MessageResponse<VerifyResponse>>  verify(@RequestBody @Valid VerifyRequest verifyRequest) {

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<VerifyResponse>builder()
                        .result(authenService.verify(verifyRequest))
                        .build()
                );


    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse<UserResponse>> register(@RequestBody @Valid UserRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(MessageResponse.<UserResponse>builder()
                        .result(userService.createUser(request))
                        .build()
                );
    }

    @PostMapping("/confirm-email")
    public ResponseEntity<MessageResponse<UserResponse>> confirmMail(@RequestBody @Valid ConfirmEmailRequest request) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                        .result(userService.confirmEmail(request))
                        .build()
                );
    }
    @PostMapping("/resend-code")
    public ResponseEntity<MessageResponse<UserResponse>> resendCode(@RequestBody @Valid ResendEmailRequest request) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                        .result(userService.resendCodeMail(request))
                        .message("Please check your email (Inbox/Spam)")
                        .build()
                );
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse<UserResponse>> forgot(@RequestBody @Valid ResendEmailRequest request) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                        .result(userService.resendCodeMail(request))
                        .message("Please check your email (Inbox/Spam)")
                        .build()
                );
    }
    @PostMapping("/new-password")
    public ResponseEntity<MessageResponse<UserResponse>> newPass(@RequestBody @Valid NewPassRequest request) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<UserResponse>builder()
                        .result(userService.newPass(request))
                        .build()
                );
    }

    @PostMapping("/login")
    public ResponseEntity<MessageResponse<AuthenResponse>> authen(@RequestBody AuthenRequest authen) {
                return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<AuthenResponse>
                                builder()
                        .result(authenService.authentication(authen))
                        .build()
                );

    }

    @PostMapping("/refresh")
    public ResponseEntity<MessageResponse<AuthenResponse>> refresh(@RequestBody RefreshRequest request){
         return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<AuthenResponse>builder()
                        .result(authenService.refreshToken(request))
                        .build()
                );
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse<?>> logout(@RequestBody LogoutRequest request) {
        authenService.logout(request);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.builder()
                        .message("Logout success")
                        .build()
                );
    }
}
