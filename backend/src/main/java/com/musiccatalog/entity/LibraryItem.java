package com.musiccatalog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Represents an Album saved by a user into their personal library.
 * Entity focus for this assignment: ALBUMS (see README for rationale).
 */
@Entity
@Table(name = "library_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "apple_catalog_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "apple_catalog_id", nullable = false)
    private Long appleCatalogId;

    @Column(nullable = false)
    private String title;

    @Column(name = "artist_name", nullable = false)
    private String artistName;

    @Column
    private String genre;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "track_count")
    private Integer trackCount;

    @Column(name = "artwork_url", length = 500)
    private String artworkUrl;

    @Column(name = "price")
    private Double price;

    @Column(name = "user_rating")
    private Integer userRating;

    @Column(name = "user_notes", length = 2000)
    private String userNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
