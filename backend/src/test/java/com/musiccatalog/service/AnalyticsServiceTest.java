package com.musiccatalog.service;

import com.musiccatalog.dto.AnalyticsDtos.AnalyticsResponse;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import com.musiccatalog.repository.LibraryItemRepository;
import com.musiccatalog.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private LibraryItemRepository libraryItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    @Test
    void computesGenreDistributionAndAverages() {
        User user = User.builder().id(1L).username("sunny").build();
        when(userRepository.findByUsername("sunny")).thenReturn(Optional.of(user));

        LibraryItem a = LibraryItem.builder()
                .genre("Alternative").releaseDate(LocalDate.of(2020, 1, 1))
                .trackCount(10).userRating(5).price(9.99).artistName("Artist A").build();
        LibraryItem b = LibraryItem.builder()
                .genre("Alternative").releaseDate(LocalDate.of(2021, 1, 1))
                .trackCount(12).userRating(3).price(7.99).artistName("Artist B").build();
        LibraryItem c = LibraryItem.builder()
                .genre("Pop").releaseDate(LocalDate.of(2019, 1, 1))
                .trackCount(8).userRating(null).price(5.99).artistName("Artist A").build();

        when(libraryItemRepository.findByUser(user)).thenReturn(List.of(a, b, c));

        AnalyticsResponse response = analyticsService.getAnalytics("sunny");

        assertEquals(3, response.totalAlbums());
        assertEquals(4.0, response.averageRating());
        assertEquals(2, response.genreDistribution().size());
        assertEquals("Alternative", response.genreDistribution().get(0).genre());
        assertEquals(2, response.genreDistribution().get(0).count());
    }

    @Test
    void handlesEmptyLibraryGracefully() {
        User user = User.builder().id(2L).username("empty_user").build();
        when(userRepository.findByUsername("empty_user")).thenReturn(Optional.of(user));
        when(libraryItemRepository.findByUser(user)).thenReturn(List.of());

        AnalyticsResponse response = analyticsService.getAnalytics("empty_user");

        assertEquals(0, response.totalAlbums());
        assertEquals(0.0, response.averageRating());
        assertTrue(response.genreDistribution().isEmpty());
    }
}
