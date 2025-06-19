package net.blwsmartware.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "room_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(nullable = false)
    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "max_occupancy", nullable = false)
    Integer maxOccupancy;

    @Column(name = "bed_type")
    String bedType;

    @Column(name = "room_size")
    Double roomSize;

    @Column(name = "price_per_night")
    BigDecimal pricePerNight;

    @Column(name = "total_rooms")
    Integer totalRooms;

    @Column(name = "available_rooms")
    Integer availableRooms;

    @Column(name = "image_url")
    String imageUrl;

    @Column(columnDefinition = "TEXT")
    String amenities;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    Hotel hotel;

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