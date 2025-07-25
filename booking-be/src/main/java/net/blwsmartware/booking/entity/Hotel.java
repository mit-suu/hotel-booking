package net.blwsmartware.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "hotels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(nullable = false)
    String address;

    String city;
    String country;

    @Column(name = "location")
    String location;
    
    String phone;
    String email;
    String website;

    @Column(name = "star_rating")
    Integer starRating;

    @Column(name = "check_in_time")
    String checkInTime;

    @Column(name = "check_out_time")
    String checkOutTime;

    @Column(name = "image_url")
    String imageUrl;

    @Column(name = "is_active")
    boolean isActive = false;

    @Column(name = "is_featured")
    boolean isFeatured = false;

    @Column(name = "price_per_night", precision = 10, scale = 2)
    BigDecimal pricePerNight;

    @Column(columnDefinition = "TEXT")
    String amenities;

    @Column(name = "cancellation_policy", columnDefinition = "TEXT")
    String cancellationPolicy;

    @Column(name = "pet_policy", columnDefinition = "TEXT")
    String petPolicy;

    @Column(name = "commission_rate", precision = 5, scale = 2)
    @Builder.Default
    BigDecimal commissionRate = new BigDecimal("15.00");

    @Column(name = "total_revenue", precision = 15, scale = 2)
    @Builder.Default
    BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "commission_earned", precision = 15, scale = 2)
    @Builder.Default
    BigDecimal commissionEarned = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    User owner; // HOST

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<RoomType> roomTypes;

    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<Review> reviews;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "created_by")
    UUID createdBy;

    @Column(name = "updated_by")
    UUID updatedBy;
}