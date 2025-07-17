package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.VNPayTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VNPayTransactionRepository extends JpaRepository<VNPayTransaction, UUID> {
    
    Optional<VNPayTransaction> findByVnpTxnRef(String vnpTxnRef);
    
    Optional<VNPayTransaction> findByVnpTransactionNo(String vnpTransactionNo);
    
    Optional<VNPayTransaction> findByBookingId(UUID bookingId);
    
    void deleteByBookingId(UUID bookingId);
} 