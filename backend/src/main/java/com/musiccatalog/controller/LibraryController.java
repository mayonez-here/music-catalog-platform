package com.musiccatalog.controller;

import com.musiccatalog.dto.LibraryItemDtos.CreateLibraryItemRequest;
import com.musiccatalog.dto.LibraryItemDtos.LibraryItemResponse;
import com.musiccatalog.dto.LibraryItemDtos.UpdateLibraryItemRequest;
import com.musiccatalog.service.LibraryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping
    public ResponseEntity<Page<LibraryItemResponse>> getLibrary(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(libraryService.getLibrary(auth.getName(), pageable));
    }

    @PostMapping
    public ResponseEntity<LibraryItemResponse> add(
            Authentication auth,
            @Valid @RequestBody CreateLibraryItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(libraryService.addToLibrary(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibraryItemResponse> update(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody UpdateLibraryItemRequest request
    ) {
        return ResponseEntity.ok(libraryService.update(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication auth, @PathVariable Long id) {
        libraryService.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
