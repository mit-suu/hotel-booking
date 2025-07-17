package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.BankAccount;
import net.blwsmartware.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, UUID> {
    Optional<BankAccount> findByUser(User user);
    Optional<BankAccount> findByUserId(UUID userId);
} 