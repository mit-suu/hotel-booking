package net.blwsmartware.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenuePageResponse {
    private RevenueStatsResponse stats;
    private List<HotelRevenueResponse> hotels;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
} 