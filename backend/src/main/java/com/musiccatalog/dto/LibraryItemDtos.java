package com.musiccatalog.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;

public class LibraryItemDtos {

    public record CreateLibraryItemRequest(
            @NotNull Long appleCatalogId,
            @NotBlank String title,
            @NotBlank String artistName,
            String genre,
            LocalDate releaseDate,
            Integer trackCount,
            String artworkUrl,
            Double price,
            @Min(1) @Max(5) Integer userRating,
            @Size(max = 2000) String userNotes
    ) {}

    public record UpdateLibraryItemRequest(
            @Min(1) @Max(5) Integer userRating,
            @Size(max = 2000) String userNotes
    ) {}

    public record LibraryItemResponse(
            Long id,
            Long appleCatalogId,
            String title,
            String artistName,
            String genre,
            LocalDate releaseDate,
            Integer trackCount,
            String artworkUrl,
            Double price,
            Integer userRating,
            String userNotes,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
