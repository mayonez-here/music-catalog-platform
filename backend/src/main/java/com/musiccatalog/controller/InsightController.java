package com.musiccatalog.controller;

import com.musiccatalog.dto.InsightDtos.InsightResponse;
import com.musiccatalog.service.InsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightController {

    private final InsightService insightService;

    @GetMapping
    public ResponseEntity<InsightResponse> getInsights(Authentication auth) {
        return ResponseEntity.ok(insightService.getInsights(auth.getName()));
    }
}
