package com.musiccatalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.musiccatalog.dto.InsightDtos.InsightResponse;
import com.musiccatalog.dto.InsightDtos.Recommendation;
import com.musiccatalog.entity.LibraryItem;
import com.musiccatalog.entity.User;
import com.musiccatalog.repository.LibraryItemRepository;
import com.musiccatalog.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Feature: Trend Summary + genre-based Recommendations.
 *
 * The stats (dominant genre, era, rating pattern, price sensitivity) are always computed
 * deterministically from the user's own library so the feature never depends on an
 * external call to function. If ANTHROPIC_API_KEY is configured, those same stats are
 * handed to Claude to phrase a short natural-language narrative; otherwise a clear
 * template-based summary is used. Either way the underlying analysis is identical -
 * only the prose generation differs. This keeps the feature demo-able with zero setup
 * while leaving a clean seam to plug in a real LLM in production.
 */
@Slf4j
@Service
public class InsightService {

    private final LibraryItemRepository libraryItemRepository;
    private final UserRepository userRepository;
    private final WebClient anthropicWebClient;
    private final String anthropicApiKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public InsightService(
            LibraryItemRepository libraryItemRepository,
            UserRepository userRepository,
            @Value("${app.anthropic.api-key:}") String anthropicApiKey
    ) {
        this.libraryItemRepository = libraryItemRepository;
        this.userRepository = userRepository;
        this.anthropicApiKey = anthropicApiKey;
        this.anthropicWebClient = WebClient.builder()
                .baseUrl("https://api.anthropic.com")
                .build();
    }

    public InsightResponse getInsights(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new com.musiccatalog.exception.ResourceNotFoundException("User not found"));

        List<LibraryItem> items = libraryItemRepository.findByUser(user);

        if (items.isEmpty()) {
            return new InsightResponse(
                    "Your library is empty. Save a few albums to unlock trend insights and recommendations.",
                    List.of(),
                    List.of(),
                    "heuristic"
            );
        }

        Map<String, Long> genreCounts = items.stream()
                .map(i -> Optional.ofNullable(i.getGenre()).filter(g -> !g.isBlank()).orElse("Unknown"))
                .collect(Collectors.groupingBy(g -> g, Collectors.counting()));

        String topGenre = genreCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");

        double avgYear = items.stream()
                .filter(i -> i.getReleaseDate() != null)
                .mapToInt(i -> i.getReleaseDate().getYear())
                .average()
                .orElse(0);

        double avgRating = items.stream()
                .filter(i -> i.getUserRating() != null)
                .mapToInt(LibraryItem::getUserRating)
                .average()
                .orElse(0);

        long ratedCount = items.stream().filter(i -> i.getUserRating() != null).count();

        double avgPrice = items.stream()
                .filter(i -> i.getPrice() != null)
                .mapToDouble(LibraryItem::getPrice)
                .average()
                .orElse(0);

        List<String> observations = buildObservations(items, genreCounts, topGenre, avgYear, avgRating, ratedCount);
        List<Recommendation> recommendations = buildRecommendations(genreCounts, topGenre);

        String heuristicSummary = buildHeuristicSummary(items.size(), topGenre, avgYear, avgRating, ratedCount, avgPrice);

        if (anthropicApiKey != null && !anthropicApiKey.isBlank()) {
            try {
                String llmSummary = generateLlmSummary(items.size(), topGenre, avgYear, avgRating, ratedCount, observations);
                if (llmSummary != null && !llmSummary.isBlank()) {
                    return new InsightResponse(llmSummary, observations, recommendations, "llm");
                }
            } catch (Exception e) {
                log.warn("LLM insight generation failed, falling back to heuristic summary: {}", e.getMessage());
            }
        }

        return new InsightResponse(heuristicSummary, observations, recommendations, "heuristic");
    }

    private List<String> buildObservations(List<LibraryItem> items, Map<String, Long> genreCounts,
                                            String topGenre, double avgYear, double avgRating, long ratedCount) {
        List<String> obs = new ArrayList<>();

        long topGenreCount = genreCounts.getOrDefault(topGenre, 0L);
        double topGenreShare = (double) topGenreCount / items.size() * 100;
        obs.add(String.format("%s makes up %.0f%% of your library (%d of %d albums).",
                topGenre, topGenreShare, topGenreCount, items.size()));

        if (avgYear > 0) {
            String era = avgYear >= 2020 ? "current decade" : avgYear >= 2010 ? "2010s" : avgYear >= 2000 ? "2000s" : "earlier eras";
            obs.add(String.format("Your average release year is %.0f, leaning toward the %s.", avgYear, era));
        }

        if (ratedCount > 0) {
            obs.add(String.format("You've rated %d album(s) with an average of %.1f / 5.", ratedCount, avgRating));
        } else {
            obs.add("You haven't rated any albums yet - add ratings to sharpen future recommendations.");
        }

        if (genreCounts.size() >= 3) {
            obs.add(String.format("Your taste spans %d distinct genres, suggesting fairly eclectic listening.", genreCounts.size()));
        } else if (genreCounts.size() <= 1) {
            obs.add("Your library is tightly focused on a single genre so far.");
        }

        return obs;
    }

    private List<Recommendation> buildRecommendations(Map<String, Long> genreCounts, String topGenre) {
        // Adjacent-genre heuristic: a small hand-curated map of "if you like X, try Y" pairings.
        Map<String, List<String>> adjacents = Map.ofEntries(
                Map.entry("Alternative", List.of("Indie Rock", "Post-Punk")),
                Map.entry("Pop", List.of("Dance", "R&B/Soul")),
                Map.entry("Hip-Hop/Rap", List.of("R&B/Soul", "Alternative")),
                Map.entry("Rock", List.of("Alternative", "Metal")),
                Map.entry("Electronic", List.of("Dance", "Alternative")),
                Map.entry("R&B/Soul", List.of("Hip-Hop/Rap", "Jazz")),
                Map.entry("Jazz", List.of("Blues", "R&B/Soul")),
                Map.entry("Classical", List.of("Soundtrack", "Jazz")),
                Map.entry("Country", List.of("Folk", "Rock")),
                Map.entry("Metal", List.of("Rock", "Alternative"))
        );

        List<String> suggestions = adjacents.getOrDefault(topGenre, List.of("Alternative", "Pop"));

        return suggestions.stream()
                .filter(g -> !genreCounts.containsKey(g))
                .map(g -> new Recommendation(
                        "Listeners who favor " + topGenre + " often enjoy " + g + " - try searching for a few " + g + " albums.",
                        g))
                .toList();
    }

    private String buildHeuristicSummary(int total, String topGenre, double avgYear, double avgRating,
                                          long ratedCount, double avgPrice) {
        StringBuilder sb = new StringBuilder();
        sb.append("Your library of ").append(total).append(total == 1 ? " album" : " albums");
        sb.append(" leans heavily toward ").append(topGenre).append(".");
        if (avgYear > 0) {
            sb.append(String.format(" On average your picks were released around %.0f.", avgYear));
        }
        if (ratedCount > 0) {
            sb.append(String.format(" Albums you've rated average %.1f out of 5.", avgRating));
        }
        if (avgPrice > 0) {
            sb.append(String.format(" Typical album price in your library is $%.2f.", avgPrice));
        }
        return sb.toString();
    }

    /**
     * Optional enhancement: ask Claude (via the Anthropic Messages API) to turn the
     * already-computed stats into a short, natural summary. Only reachable when
     * ANTHROPIC_API_KEY is set - never required for the feature to work.
     */
    private String generateLlmSummary(int total, String topGenre, double avgYear, double avgRating,
                                       long ratedCount, List<String> observations) throws Exception {
        String prompt = "Write a friendly 2-sentence summary (no preamble) of a user's music library "
                + "based on these facts. Facts: total albums=" + total + ", top genre=" + topGenre
                + ", average release year=" + Math.round(avgYear) + ", average user rating=" + avgRating
                + " (from " + ratedCount + " rated albums). Observations: " + String.join(" ", observations);

        String requestBody = objectMapper.writeValueAsString(Map.of(
                "model", "claude-sonnet-5",
                "max_tokens", 200,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        ));

        String rawResponse = anthropicWebClient.post()
                .uri("/v1/messages")
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        JsonNode root = objectMapper.readTree(rawResponse);
        JsonNode contentArray = root.path("content");
        if (contentArray.isArray() && contentArray.size() > 0) {
            return contentArray.get(0).path("text").asText(null);
        }
        return null;
    }
}
