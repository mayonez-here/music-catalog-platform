package com.musiccatalog.controller;

import com.musiccatalog.dto.AnalyticsDtos.AnalyticsResponse;
import com.musiccatalog.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics(Authentication auth) {
        return ResponseEntity.ok(analyticsService.getAnalytics(auth.getName()));
    }
}
