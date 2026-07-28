package com.musiccatalog.service;

import com.musiccatalog.dto.LibraryItemDtos.CreateLibraryItemRequest;
import com.musiccatalog.dto.LibraryItemDtos.LibraryItemResponse;
import com.musiccatalog.dto.LibraryItemDtos.UpdateLibraryItemRequest;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import com.musiccatalog.exception.DuplicateResourceException;
import com.musiccatalog.exception.ResourceNotFoundException;
import com.musiccatalog.repository.LibraryItemRepository;
import com.musiccatalog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final LibraryItemRepository libraryItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public LibraryItemResponse addToLibrary(String username, CreateLibraryItemRequest request) {
        User user = getUser(username);

        if (libraryItemRepository.existsByUserAndAppleCatalogId(user, request.appleCatalogId())) {
            throw new DuplicateResourceException("This album is already in your library");
        }

        LibraryItem item = LibraryItem.builder()
                .user(user)
                .appleCatalogId(request.appleCatalogId())
                .title(request.title())
                .artistName(request.artistName())
                .genre(request.genre())
                .releaseDate(request.releaseDate())
                .trackCount(request.trackCount())
                .artworkUrl(request.artworkUrl())
                .price(request.price())
                .userRating(request.userRating())
                .userNotes(request.userNotes())
                .build();

        return toResponse(libraryItemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public Page<LibraryItemResponse> getLibrary(String username, Pageable pageable) {
        User user = getUser(username);
        return libraryItemRepository.findByUser(user, pageable).map(this::toResponse);
    }

    @Transactional
    public LibraryItemResponse update(String username, Long id, UpdateLibraryItemRequest request) {
        User user = getUser(username);
        LibraryItem item = libraryItemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Library item " + id + " not found"));

        if (request.userRating() != null) {
            item.setUserRating(request.userRating());
        }
        if (request.userNotes() != null) {
            item.setUserNotes(request.userNotes());
        }

        return toResponse(libraryItemRepository.save(item));
    }

    @Transactional
    public void delete(String username, Long id) {
        User user = getUser(username);
        LibraryItem item = libraryItemRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Library item " + id + " not found"));
        libraryItemRepository.delete(item);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private LibraryItemResponse toResponse(LibraryItem item) {
        return new LibraryItemResponse(
                item.getId(),
                item.getAppleCatalogId(),
                item.getTitle(),
                item.getArtistName(),
                item.getGenre(),
                item.getReleaseDate(),
                item.getTrackCount(),
                item.getArtworkUrl(),
                item.getPrice(),
                item.getUserRating(),
                item.getUserNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    /** Utility other services (e.g. analytics) can reuse to parse iTunes-style date strings safely. */
    public static LocalDate parseItunesDate(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            return LocalDate.parse(raw.substring(0, 10), DateTimeFormatter.ISO_DATE);
        } catch (Exception e) {
            return null;
        }
    }
}
