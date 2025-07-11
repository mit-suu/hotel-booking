package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.BankAccountRequest;
import net.blwsmartware.booking.dto.request.WithdrawalRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.WalletResponse;
import net.blwsmartware.booking.dto.response.WalletTransactionResponse;
import net.blwsmartware.booking.service.WalletService;
import net.blwsmartware.booking.util.DataResponseUtils;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WalletController {

    WalletService walletService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<WalletResponse>> getWalletInfo() {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<WalletResponse>builder()
                    .message("Wallet information retrieved successfully")
                    .result(walletService.getWalletInfo())
                    .build()
                );
    }

    @PostMapping("/bank-account")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<WalletResponse>> saveBankAccount(@RequestBody @Valid BankAccountRequest request) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<WalletResponse>builder()
                    .message("Bank account information saved successfully")
                    .result(walletService.saveBankAccount(request))
                    .build()
                );
    }

    @PostMapping("/withdrawal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<WalletTransactionResponse>> requestWithdrawal(@RequestBody @Valid WithdrawalRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(MessageResponse.<WalletTransactionResponse>builder()
                    .message("Withdrawal request submitted successfully")
                    .result(walletService.requestWithdrawal(request))
                    .build()
                );
    }

    @GetMapping("/transactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<DataResponse<WalletTransactionResponse>>> getTransactionHistory(
            @RequestParam(value = "pageNumber", defaultValue = PagePrepare.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(value = "pageSize", defaultValue = PagePrepare.PAGE_SIZE, required = false) Integer pageSize) {
        
        log.info("GET /wallet/transactions called with pageNumber={}, pageSize={}", pageNumber, pageSize);
        
        Page<WalletTransactionResponse> transactions = walletService.getTransactionHistory(pageNumber, pageSize);
        
        log.info("Service returned {} transactions, totalElements={}", 
                transactions.getContent().size(), transactions.getTotalElements());
        
        DataResponse<WalletTransactionResponse> dataResponse = DataResponseUtils.convertPageInfo(transactions, transactions.getContent());
        
        log.info("DataResponse created with {} items", dataResponse.getContent().size());
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(MessageResponse.<DataResponse<WalletTransactionResponse>>builder()
                    .message("Transaction history retrieved successfully")
                    .result(dataResponse)
                    .build()
                );
    }

    @PostMapping("/test-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<String>> createTestData() {
        log.info("Creating test transaction data");
        
        try {
            // Create a test refund transaction
            walletService.addRefundForCurrentUser(
                new java.math.BigDecimal("100000"), 
                "Test refund transaction for debugging"
            );
            
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(MessageResponse.<String>builder()
                        .message("Test transaction data created successfully")
                        .result("Test refund transaction created")
                        .build()
                    );
        } catch (Exception e) {
            log.error("Error creating test data", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MessageResponse.<String>builder()
                        .message("Error creating test data: " + e.getMessage())
                        .result(null)
                        .build()
                    );
        }
    }
} 