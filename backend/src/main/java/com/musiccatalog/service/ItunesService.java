package com.musiccatalog.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccatalog.dto.ItunesDtos.ItunesResult;
import com.musiccatalog.dto.ItunesDtos.ItunesSearchResponse;
import com.musiccatalog.dto.ItunesDtos.SearchResultItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

/**
 * Thin proxy over the public iTunes Search API (https://itunes.apple.com/search).
 * No API key is required. Rate limit noted in Apple's docs is ~20 requests/min,
 * so results are kept lean via the `limit` param and callers are encouraged to debounce.
 *
 * Note: iTunes serves its JSON with `Content-Type: text/javascript` (a leftover from its
 * JSONP-era API), which Spring's WebClient refuses to auto-decode as JSON. We fetch the
 * raw body as a String and parse it ourselves with Jackson to sidestep that content-type
 * mismatch entirely, rather than fighting WebClient's codec configuration.
 */
@Service
@RequiredArgsConstructor
public class ItunesService {

    private final WebClient itunesWebClient;
    private final ObjectMapper objectMapper;

    public List<SearchResultItem> search(String term, String entity, int limit) {
        String safeEntity = (entity == null || entity.isBlank()) ? "album" : entity;
        int safeLimit = Math.max(1, Math.min(limit, 50));

        String rawJson = itunesWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        // Pass the raw term - UriComponentsBuilder already URL-encodes
                        // query param values, so pre-encoding here would double-encode
                        // (e.g. spaces in "taylor swift" become broken sequences).
                        .queryParam("term", term)
                        .queryParam("entity", safeEntity)
                        .queryParam("limit", safeLimit)
                        .queryParam("country", "US")
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (rawJson == null || rawJson.isBlank()) {
            return List.of();
        }

        ItunesSearchResponse response;
        try {
            response = objectMapper.readValue(rawJson, ItunesSearchResponse.class);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse iTunes Search API response", e);
        }

        if (response.results() == null) {
            return List.of();
        }

        return response.results().stream()
                .map(this::normalize)
                .toList();
    }

    private SearchResultItem normalize(ItunesResult r) {
        Long catalogId = r.collectionId() != null ? r.collectionId() : r.trackId();
        String title = r.collectionName() != null ? r.collectionName() : r.trackName();
        Double price = r.collectionPrice() != null ? r.collectionPrice() : r.trackPrice();

        return new SearchResultItem(
                catalogId,
                title,
                r.artistName(),
                r.primaryGenreName(),
                r.releaseDate(),
                r.trackCount(),
                r.artworkUrl100(),
                price,
                r.collectionViewUrl()
        );
    }
}

