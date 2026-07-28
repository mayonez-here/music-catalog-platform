package com.musiccatalog.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDtos {

    public record GenreCount(String genre, long count) {}

    public record YearCount(int year, long count) {}

    public record TrackCountBucket(String bucketLabel, long count) {}

    public record ArtistCount(String artist, long count) {}

    public record RatingBreakdown(int rating, long count) {}

    public record AnalyticsResponse(
            long totalAlbums,
            double averageRating,
            double averagePrice,
            List<GenreCount> genreDistribution,      // Pie / Donut chart
            List<YearCount> releasesByYear,          // Line chart
            List<TrackCountBucket> trackCountHistogram, // Histogram
            List<ArtistCount> topArtists,             // Horizontal bar chart
            List<RatingBreakdown> ratingBreakdown      // Bar chart
    ) {}
}
