"use client";

import { useEffect, useState, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Search as SearchIcon, Disc3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import AlbumCard from "@/components/AlbumCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { api, extractErrorMessage } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { SearchResultItem, LibraryItemResponse } from "@/lib/types";

export default function SearchPage() {
  useRequireAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);

  // Track which catalog IDs are already in the library so "Save" reflects it immediately.
  useEffect(() => {
    api
      .get<{ content: LibraryItemResponse[] }>("/api/library", { params: { size: 200 } })
      .then(({ data }) => setSavedIds(new Set(data.content.map((i) => i.appleCatalogId))))
      .catch(() => {});
  }, []);

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const { data } = await api.get<SearchResultItem[]>("/api/search", {
        params: { query: term, type: "album", limit: 24 },
      });
      setResults(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Search failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useDebouncedCallback(runSearch, 450);

  function handleChange(value: string) {
    setQuery(value);
    debouncedSearch(value);
  }

  async function handleSave(item: SearchResultItem) {
    setSavingId(item.appleCatalogId);
    try {
      await api.post("/api/library", {
        appleCatalogId: item.appleCatalogId,
        title: item.title,
        artistName: item.artistName,
        genre: item.genre,
        releaseDate: item.releaseDate ? item.releaseDate.slice(0, 10) : null,
        trackCount: item.trackCount,
        artworkUrl: item.artworkUrl,
        price: item.price,
      });
      setSavedIds((prev) => new Set(prev).add(item.appleCatalogId));
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't save that album."));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Search the catalog</h1>
          <p className="text-sm text-muted">Pull albums straight from the iTunes Store and add the ones you love.</p>
        </div>

        <div className="relative mb-8">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Try “Coldplay”, “Taylor Swift”, “Kendrick Lamar”…"
            className="w-full rounded-full bg-surface border border-border pl-12 pr-4 py-3.5 text-sm text-ink placeholder:text-muted outline-none focus:border-violet/50 transition-colors"
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-pink mb-4">{error}</p>}

        {loading && <LoadingSpinner label="Searching the catalog" />}

        {!loading && hasSearched && results.length === 0 && !error && (
          <EmptyState
            icon={<Disc3 size={32} />}
            title="No albums found"
            description="Try a different artist or album name."
          />
        )}

        {!loading && !hasSearched && (
          <EmptyState
            icon={<Disc3 size={32} />}
            title="Start typing to search"
            description="Every result comes straight from the iTunes Search API — no login required to browse, just to save."
          />
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((item) => (
              <AlbumCard
                key={item.appleCatalogId}
                item={item}
                saved={savedIds.has(item.appleCatalogId)}
                saving={savingId === item.appleCatalogId}
                onSave={() => handleSave(item)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
