package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CityStatsResponse {
    String cityName;
    Long hotelCount;
} 