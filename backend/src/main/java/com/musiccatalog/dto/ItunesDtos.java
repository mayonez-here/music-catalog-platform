package com.musiccatalog.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ItunesDtos {

    /** Raw shape returned by https://itunes.apple.com/search */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ItunesSearchResponse(
            int resultCount,
            List<ItunesResult> results
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ItunesResult(
            @JsonProperty("collectionId") Long collectionId,
            @JsonProperty("trackId") Long trackId,
            @JsonProperty("artistId") Long artistId,
            @JsonProperty("artistName") String artistName,
            @JsonProperty("collectionName") String collectionName,
            @JsonProperty("trackName") String trackName,
            @JsonProperty("collectionPrice") Double collectionPrice,
            @JsonProperty("trackPrice") Double trackPrice,
            @JsonProperty("releaseDate") String releaseDate,
            @JsonProperty("trackCount") Integer trackCount,
            @JsonProperty("primaryGenreName") String primaryGenreName,
            @JsonProperty("artworkUrl100") String artworkUrl100,
            @JsonProperty("collectionViewUrl") String collectionViewUrl
    ) {}

    /** Normalized shape the frontend actually consumes, regardless of media type searched. */
    public record SearchResultItem(
            Long appleCatalogId,
            String title,
            String artistName,
            String genre,
            String releaseDate,
            Integer trackCount,
            String artworkUrl,
            Double price,
            String viewUrl
    ) {}
}
