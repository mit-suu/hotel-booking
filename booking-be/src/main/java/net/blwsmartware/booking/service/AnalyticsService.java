package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.response.AdminAnalyticsResponse;

import java.time.LocalDate;

public interface AnalyticsService {
    AdminAnalyticsResponse getAdminAnalytics(LocalDate startDate, LocalDate endDate);
} 