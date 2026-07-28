package com.musiccatalog.service;

import com.musiccatalog.dto.AnalyticsDtos.*;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import com.musiccatalog.repository.LibraryItemRepository;
import com.musiccatalog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final LibraryItemRepository libraryItemRepository;
    private final UserRepository userRepository;

    public AnalyticsResponse getAnalytics(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.musiccatalog.exception.ResourceNotFoundException("User not found"));

        List<LibraryItem> items = libraryItemRepository.findByUser(user);

        long total = items.size();

        double avgRating = items.stream()
                .filter(i -> i.getUserRating() != null)
                .mapToInt(LibraryItem::getUserRating)
                .average()
                .orElse(0.0);

        double avgPrice = items.stream()
                .filter(i -> i.getPrice() != null)
                .mapToDouble(LibraryItem::getPrice)
                .average()
                .orElse(0.0);

        List<GenreCount> genreDistribution = items.stream()
                .map(i -> i.getGenre() == null || i.getGenre().isBlank() ? "Unknown" : i.getGenre())
                .collect(Collectors.groupingBy(g -> g, Collectors.counting()))
                .entrySet().stream()
                .map(e -> new GenreCount(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(GenreCount::count).reversed())
                .toList();

        Map<Integer, Long> yearMap = new TreeMap<>();
        for (LibraryItem i : items) {
            if (i.getReleaseDate() != null) {
                int year = i.getReleaseDate().getYear();
                yearMap.merge(year, 1L, Long::sum);
            }
        }
        List<YearCount> releasesByYear = yearMap.entrySet().stream()
                .map(e -> new YearCount(e.getKey(), e.getValue()))
                .toList();

        List<TrackCountBucket> trackCountHistogram = buildTrackCountHistogram(items);

        List<ArtistCount> topArtists = items.stream()
                .collect(Collectors.groupingBy(LibraryItem::getArtistName, Collectors.counting()))
                .entrySet().stream()
                .map(e -> new ArtistCount(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(ArtistCount::count).reversed())
                .limit(10)
                .toList();

        List<RatingBreakdown> ratingBreakdown = List.of(1, 2, 3, 4, 5).stream()
                .map(r -> new RatingBreakdown(r, items.stream()
                        .filter(i -> r.equals(i.getUserRating()))
                        .count()))
                .toList();

        return new AnalyticsResponse(
                total, round(avgRating), round(avgPrice),
                genreDistribution, releasesByYear, trackCountHistogram, topArtists, ratingBreakdown
        );
    }

    private List<TrackCountBucket> buildTrackCountHistogram(List<LibraryItem> items) {
        // Buckets chosen to reflect typical album lengths: EP-ish to double-album-ish
        String[] labels = {"1-5", "6-10", "11-15", "16-20", "21+"};
        long[] counts = new long[5];

        for (LibraryItem i : items) {
            Integer tc = i.getTrackCount();
            if (tc == null) continue;
            int bucket = tc <= 5 ? 0 : tc <= 10 ? 1 : tc <= 15 ? 2 : tc <= 20 ? 3 : 4;
            counts[bucket]++;
        }

        return java.util.stream.IntStream.range(0, labels.length)
                .mapToObj(idx -> new TrackCountBucket(labels[idx], counts[idx]))
                .toList();
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
