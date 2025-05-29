package net.blwsmartware.booking.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.AdminDashboardResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.service.UserService;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminController {
    
    UserService userService;
    
    @GetMapping("/stats/users")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminDashboardResponse.UserStats>> getUserStats() {
        log.info("Getting user statistics");
        
        Long totalUsers = userService.getTotalUsersCount();
        
        AdminDashboardResponse.UserStats stats = AdminDashboardResponse.UserStats.builder()
                .totalUsers(totalUsers)
                .build();
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<AdminDashboardResponse.UserStats>builder()
                        .result(stats)
                        .build());
    }
} 