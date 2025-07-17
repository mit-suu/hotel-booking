package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.entity.WalletTransaction;
import net.blwsmartware.booking.enums.TransactionStatus;
import net.blwsmartware.booking.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {
    
    Page<WalletTransaction> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    List<WalletTransaction> findByUserAndStatusOrderByCreatedAtDesc(User user, TransactionStatus status);
    
    @Query("SELECT SUM(wt.amount) FROM WalletTransaction wt WHERE wt.user = :user AND wt.status = :status AND wt.transactionType = :type")
    BigDecimal sumAmountByUserAndStatusAndType(@Param("user") User user, 
                                               @Param("status") TransactionStatus status, 
                                               @Param("type") TransactionType type);
    
    List<WalletTransaction> findByStatusAndTransactionType(TransactionStatus status, TransactionType type);
    
    Page<WalletTransaction> findByStatusAndTransactionType(TransactionStatus status, TransactionType type, Pageable pageable);

    Page<WalletTransaction> findByTransactionTypeOrderByCreatedAtDesc(TransactionType transactionType, Pageable pageable);
} 