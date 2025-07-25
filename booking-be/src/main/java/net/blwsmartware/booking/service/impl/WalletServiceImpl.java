package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.BankAccountRequest;
import net.blwsmartware.booking.dto.request.WithdrawalRequest;
import net.blwsmartware.booking.dto.response.WalletResponse;
import net.blwsmartware.booking.dto.response.WalletTransactionResponse;
import net.blwsmartware.booking.entity.BankAccount;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.entity.WalletTransaction;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.enums.TransactionStatus;
import net.blwsmartware.booking.enums.TransactionType;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.mapper.BankAccountMapper;
import net.blwsmartware.booking.mapper.WalletTransactionMapper;
import net.blwsmartware.booking.repository.BankAccountRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.repository.WalletTransactionRepository;
import net.blwsmartware.booking.service.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WalletServiceImpl implements WalletService {

    UserRepository userRepository;
    BankAccountRepository bankAccountRepository;
    WalletTransactionRepository walletTransactionRepository;
    BankAccountMapper bankAccountMapper;
    WalletTransactionMapper walletTransactionMapper;

    // ===== PRIVATE AUTHENTICATION METHODS =====
    
    private User getCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
    }
    
    private User getCurrentUserRequired() {
        return getCurrentUser();
    }
    
    private UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }
    
    private User getCurrentAdmin() {
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findById(UUID.fromString(adminId))
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        // Verify admin role
        if (!admin.isAdmin()) {
            throw new AppRuntimeException(ErrorResponse.UNAUTHORIZED);
        }
        
        return admin;
    }

    // ===== PUBLIC METHODS =====

    @Override
    public WalletResponse getWalletInfo() {
        User user = getCurrentUserRequired();
        
        // Initialize wallet balance if null
        if (user.getWalletBalance() == null) {
            user.setWalletBalance(BigDecimal.ZERO);
            userRepository.save(user);
        }
        
        BankAccount bankAccount = bankAccountRepository.findByUserId(user.getId()).orElse(null);
        
        return WalletResponse.builder()
                .balance(user.getWalletBalance())
                .bankAccount(bankAccount != null ? bankAccountMapper.toResponse(bankAccount) : null)
                .build();
    }

    @Override
    @Transactional
    public WalletResponse saveBankAccount(BankAccountRequest request) {
        User user = getCurrentUserRequired();
        
        BankAccount bankAccount = bankAccountRepository.findByUserId(user.getId())
                .orElse(BankAccount.builder()
                        .user(user)
                        .build());
        
        bankAccount.setBankName(request.getBankName());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setAccountName(request.getAccountName());
        
        bankAccountRepository.save(bankAccount);
        
        return getWalletInfo();
    }

    @Override
    @Transactional  
    public WalletTransactionResponse requestWithdrawal(WithdrawalRequest request) {
        User user = getCurrentUserRequired();
        
        // Initialize wallet balance if null
        if (user.getWalletBalance() == null) {
            user.setWalletBalance(BigDecimal.ZERO);
            userRepository.save(user);
        }
        
        // Check sufficient balance
        if (user.getWalletBalance().compareTo(request.getAmount()) < 0) {
            throw new AppRuntimeException(ErrorResponse.WALLET_INSUFFICIENT_BALANCE);
        }
        
        // Check bank account exists
        BankAccount bankAccount = bankAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.WALLET_BANK_ACCOUNT_REQUIRED));
        
        // Create withdrawal transaction
        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(TransactionType.WITHDRAWAL)
                .amount(request.getAmount())
                .description("Withdrawal request: " + request.getNote())
                .status(TransactionStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        
        walletTransactionRepository.save(transaction);
        
        log.info("Withdrawal request created: userId={}, amount={}, transactionId={}", 
                user.getId(), request.getAmount(), transaction.getId());
        
        return walletTransactionMapper.toResponse(transaction);
    }

    @Override
    public Page<WalletTransactionResponse> getTransactionHistory(int pageNumber, int pageSize) {
        User user = getCurrentUserRequired();
        
        log.info("Getting transaction history for user: userId={}, pageNumber={}, pageSize={}", 
                user.getId(), pageNumber, pageSize);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
        Page<WalletTransaction> transactions = walletTransactionRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        
        log.info("Found {} transactions for user {}", transactions.getTotalElements(), user.getId());
        
        Page<WalletTransactionResponse> result = transactions.map(walletTransactionMapper::toResponse);
        
        log.info("Mapped transaction responses: {}", result.getContent().size());
        
        return result;
    }

    // ===== INTERNAL METHODS =====

    @Override
    @Transactional
    public void addRefund(UUID userId, BigDecimal amount, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.USER_NOT_FOUND));
        
        // Initialize wallet balance if null
        if (user.getWalletBalance() == null) {
            user.setWalletBalance(BigDecimal.ZERO);
        }
        
        // Add refund to wallet
        user.setWalletBalance(user.getWalletBalance().add(amount));
        userRepository.save(user);
        
        // Create refund transaction record
        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(TransactionType.REFUND)
                .amount(amount)
                .description(description)
                .status(TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();
        
        walletTransactionRepository.save(transaction);
        
        log.info("Refund added to wallet: userId={}, amount={}, description={}", userId, amount, description);
    }

    @Override
    @Transactional
    public void addRefundForCurrentUser(BigDecimal amount, String description) {
        User user = getCurrentUserRequired();
        
        // Initialize wallet balance if null
        if (user.getWalletBalance() == null) {
            user.setWalletBalance(BigDecimal.ZERO);
        }
        
        // Add refund to wallet
        user.setWalletBalance(user.getWalletBalance().add(amount));
        userRepository.save(user);
        
        // Create refund transaction record
        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .transactionType(TransactionType.REFUND)
                .amount(amount)
                .description(description)
                .status(TransactionStatus.COMPLETED)
                .createdAt(LocalDateTime.now())
                .build();
        
        walletTransactionRepository.save(transaction);
        
        log.info("Refund added to wallet for current user: userId={}, amount={}, description={}", 
                user.getId(), amount, description);
    }

    // ===== ADMIN METHODS =====

    @Override
    public Page<WalletTransactionResponse> getPendingWithdrawalRequests(int pageNumber, int pageSize) {
        // Verify admin access
        getCurrentAdmin();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").ascending());
        Page<WalletTransaction> transactions = walletTransactionRepository
                .findByStatusAndTransactionType(TransactionStatus.PENDING, TransactionType.WITHDRAWAL, pageable);
        
        return transactions.map(walletTransactionMapper::toResponse);
    }

    @Override
    public Page<WalletTransactionResponse> getAllWithdrawalRequests(String status, int pageNumber, int pageSize) {
        // Verify admin access
        getCurrentAdmin();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
        Page<WalletTransaction> transactions;
        
        if (status != null && !status.isEmpty()) {
            TransactionStatus transactionStatus = TransactionStatus.valueOf(status.toUpperCase());
            transactions = walletTransactionRepository
                    .findByStatusAndTransactionType(transactionStatus, TransactionType.WITHDRAWAL, pageable);
        } else {
            transactions = walletTransactionRepository
                    .findByTransactionTypeOrderByCreatedAtDesc(TransactionType.WITHDRAWAL, pageable);
        }
        
        return transactions.map(walletTransactionMapper::toResponse);
    }

    @Override
    public Page<WalletTransactionResponse> getAllRefundTransactions(int pageNumber, int pageSize) {
        // Verify admin access
        getCurrentAdmin();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
        Page<WalletTransaction> transactions = walletTransactionRepository
                .findByTransactionTypeOrderByCreatedAtDesc(TransactionType.REFUND, pageable);
        
        return transactions.map(walletTransactionMapper::toResponse);
    }

    @Override
    @Transactional
    public WalletTransactionResponse processWithdrawal(UUID transactionId, boolean approved, String note) {
        User admin = getCurrentAdmin();
        
        WalletTransaction transaction = walletTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.WALLET_TRANSACTION_NOT_FOUND));
        
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new AppRuntimeException(ErrorResponse.WALLET_TRANSACTION_ALREADY_PROCESSED);
        }
        
        User user = transaction.getUser();
        
        if (approved) {
            // Initialize wallet balance if null
            if (user.getWalletBalance() == null) {
                user.setWalletBalance(BigDecimal.ZERO);
            }
            
            // Check user still has sufficient balance
            if (user.getWalletBalance().compareTo(transaction.getAmount()) < 0) {
                throw new AppRuntimeException(ErrorResponse.WALLET_USER_INSUFFICIENT_BALANCE);
            }
            
            // Deduct from user wallet
            user.setWalletBalance(user.getWalletBalance().subtract(transaction.getAmount()));
            userRepository.save(user);
            
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setDescription(transaction.getDescription() + " - Approved by admin: " + note);
            
            log.info("Withdrawal approved: transactionId={}, userId={}, amount={}, adminId={}", 
                    transactionId, user.getId(), transaction.getAmount(), admin.getId());
        } else {
            transaction.setStatus(TransactionStatus.FAILED);
            transaction.setDescription(transaction.getDescription() + " - Rejected by admin: " + note);
            
            log.info("Withdrawal rejected: transactionId={}, userId={}, amount={}, adminId={}", 
                    transactionId, user.getId(), transaction.getAmount(), admin.getId());
        }
        
        transaction.setProcessedAt(LocalDateTime.now());
        walletTransactionRepository.save(transaction);
        
        return walletTransactionMapper.toResponse(transaction);
    }
} 