package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.BankAccountRequest;
import net.blwsmartware.booking.dto.request.WithdrawalRequest;
import net.blwsmartware.booking.dto.response.WalletResponse;
import net.blwsmartware.booking.dto.response.WalletTransactionResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.UUID;

public interface WalletService {
    
    /**
     * Lấy thông tin ví của user
     */
    WalletResponse getWalletInfo();
    
    /**
     * Lưu/cập nhật thông tin tài khoản ngân hàng
     */
    WalletResponse saveBankAccount(BankAccountRequest request);
    
    /**
     * Yêu cầu rút tiền
     */
    WalletTransactionResponse requestWithdrawal(WithdrawalRequest request);
    
    /**
     * Lấy lịch sử giao dịch
     */
    Page<WalletTransactionResponse> getTransactionHistory(int pageNumber, int pageSize);
    
    /**
     * Thêm tiền vào ví (khi hoàn tiền booking)
     */
    void addRefund(UUID userId, BigDecimal amount, String description);
    
    /**
     * Thêm tiền vào ví cho current user (for testing)
     */
    void addRefundForCurrentUser(BigDecimal amount, String description);
    
    /**
     * Xử lý yêu cầu rút tiền (Admin)
     */
    WalletTransactionResponse processWithdrawal(UUID transactionId, boolean approved, String note);
    
    /**
     * Admin method to get all refund transactions across all users
     */
    Page<WalletTransactionResponse> getAllRefundTransactions(int pageNumber, int pageSize);
    
    /**
     * Admin method to get all pending withdrawal requests
     */
    Page<WalletTransactionResponse> getPendingWithdrawalRequests(int pageNumber, int pageSize);
    
    /**
     * Admin method to get all withdrawal requests (all statuses)
     */
    Page<WalletTransactionResponse> getAllWithdrawalRequests(String status, int pageNumber, int pageSize);
} 