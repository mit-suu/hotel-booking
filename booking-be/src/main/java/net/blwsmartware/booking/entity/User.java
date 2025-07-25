package net.blwsmartware.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Size(min = 8,message = "PASSWORD_MUST_8_DIGITS")
    String password;

    @NotNull(message = "NAME_NOT_NULL")
    String name;

    @Email(message = "EMAIL_INVALID")
    @Column(unique = true)
    String email;

    @Column(unique = true)
    @NotNull(message = "USERNAME_NOT_NULL")
    String username;

    String tel,address;

    LocalDate dob;

    // OAuth2 related fields
    @Column(name = "google_id")
    String googleId;

    @Column(name = "avatar_url")
    String avatarUrl;

    @Column(name = "provider")
    @Builder.Default
    String provider = "local"; // local, google

    @Builder.Default
    boolean isActive=true;

    @Builder.Default
    boolean emailVerified=false;

    @Builder.Default
    boolean hostRequested=false;

    @Column(name = "wallet_balance", precision = 12, scale = 2)
    @Builder.Default
    BigDecimal walletBalance = BigDecimal.ZERO;

    String code;

    Date codeExpr;

    @CreationTimestamp
    Instant createAt;

    @UpdateTimestamp
    Instant updateAt;

    @ManyToOne
    @JoinColumn(name = "role_id")
    Role role;

    public boolean hasPermission(String roleName) {
        if (this.role == null) return false;
        return this.role.getName().equals(roleName);
    }

    public boolean isAdmin() {
        return hasPermission("ADMIN");
    }

    public boolean isHost() {
        return hasPermission("HOST") || hasPermission("ADMIN");
    }

    public boolean isUser() {
        return hasPermission("USER") || hasPermission("HOST") || hasPermission("ADMIN");
    }

    public boolean hasRole(String roleName) {
        return hasPermission(roleName);
    }
}
