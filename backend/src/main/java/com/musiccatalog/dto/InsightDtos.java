package com.musiccatalog.dto;

import java.util.List;

public class InsightDtos {

    public record Recommendation(
            String reason,
            String genre
    ) {}

    public record InsightResponse(
            String trendSummary,
            List<String> observations,
            List<Recommendation> recommendations,
            String generatedBy // "heuristic" or "llm"
    ) {}
}
