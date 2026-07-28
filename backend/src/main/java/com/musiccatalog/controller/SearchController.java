package com.musiccatalog.controller;

import com.musiccatalog.dto.ItunesDtos.SearchResultItem;
import com.musiccatalog.service.ItunesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ItunesService itunesService;

    @GetMapping
    public ResponseEntity<List<SearchResultItem>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "album") String type,
            @RequestParam(defaultValue = "25") int limit
    ) {
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("query must not be empty");
        }
        return ResponseEntity.ok(itunesService.search(query, type, limit));
    }
}
