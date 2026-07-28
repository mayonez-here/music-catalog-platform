"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Star, DollarSign, Disc3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import InsightsPanel from "@/components/InsightsPanel";
import GenreDonutChart from "@/components/charts/GenreDonutChart";
import ReleasesLineChart from "@/components/charts/ReleasesLineChart";
import TrackCountHistogram from "@/components/charts/TrackCountHistogram";
import TopArtistsBar from "@/components/charts/TopArtistsBar";
import RatingBarChart from "@/components/charts/RatingBarChart";
import { api, extractErrorMessage } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { AnalyticsResponse, InsightResponse } from "@/lib/types";

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex items-center gap-4">
      <div className="p-2.5 rounded-xl bg-signature-gradient-soft border border-white/10 text-violet">{icon}</div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-display text-xl font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  useRequireAuth();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [analyticsRes, insightRes] = await Promise.all([
          api.get<AnalyticsResponse>("/api/analytics"),
          api.get<InsightResponse>("/api/insights"),
        ]);
        setAnalytics(analyticsRes.data);
        setInsight(insightRes.data);
      } catch (err) {
        setError(extractErrorMessage(err, "Couldn't load analytics."));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Analytics</h1>
          <p className="text-sm text-muted">A data-driven look at what you&apos;re actually listening to.</p>
        </div>

        {error && <p className="text-sm text-pink mb-4">{error}</p>}
        {loading && <LoadingSpinner label="Crunching your library" />}

        {!loading && analytics && analytics.totalAlbums === 0 && (
          <EmptyState
            icon={<BarChart3 size={32} />}
            title="Nothing to analyze yet"
            description="Save a few albums to your library and your charts will appear here."
            action={
              <Link href="/search" className="mt-2 rounded-full bg-signature-gradient text-white text-sm font-medium px-4 py-2">
                Go to search
              </Link>
            }
          />
        )}

        {!loading && analytics && analytics.totalAlbums > 0 && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile icon={<Disc3 size={18} />} label="Albums saved" value={String(analytics.totalAlbums)} />
              <StatTile icon={<Star size={18} />} label="Average rating" value={analytics.averageRating > 0 ? `${analytics.averageRating.toFixed(1)} / 5` : "—"} />
              <StatTile icon={<DollarSign size={18} />} label="Average price" value={analytics.averagePrice > 0 ? `$${analytics.averagePrice.toFixed(2)}` : "—"} />
              <StatTile icon={<BarChart3 size={18} />} label="Genres" value={String(analytics.genreDistribution.length)} />
            </div>

            {insight && <InsightsPanel insight={insight} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GenreDonutChart data={analytics.genreDistribution} />
              <ReleasesLineChart data={analytics.releasesByYear} />
              <TrackCountHistogram data={analytics.trackCountHistogram} />
              <TopArtistsBar data={analytics.topArtists} />
              <RatingBarChart data={analytics.ratingBreakdown} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
