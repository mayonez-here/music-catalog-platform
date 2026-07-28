"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Library as LibraryIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LibraryCard from "@/components/LibraryCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { api, extractErrorMessage } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { LibraryItemResponse } from "@/lib/types";

export default function LibraryPage() {
  useRequireAuth();
  const [items, setItems] = useState<LibraryItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ content: LibraryItemResponse[] }>("/api/library", {
        params: { size: 200 },
      });
      setItems(data.content);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't load your library."));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: number, rating: number | null, notes: string | null) {
    const prev = items;
    setItems((cur) =>
      cur.map((i) =>
        i.id === id
          ? { ...i, userRating: rating ?? i.userRating, userNotes: notes ?? i.userNotes }
          : i
      )
    );
    try {
      await api.put(`/api/library/${id}`, {
        userRating: rating ?? undefined,
        userNotes: notes ?? undefined,
      });
    } catch (err) {
      setItems(prev);
      setError(extractErrorMessage(err, "Couldn't save your change."));
    }
  }

  async function handleDelete(id: number) {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== id));
    try {
      await api.delete(`/api/library/${id}`);
    } catch (err) {
      setItems(prev);
      setError(extractErrorMessage(err, "Couldn't remove that album."));
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink mb-1">Your library</h1>
            <p className="text-sm text-muted">
              {loading ? "Loading…" : `${items.length} album${items.length === 1 ? "" : "s"} saved`}
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-pink mb-4">{error}</p>}

        {loading && <LoadingSpinner label="Loading your library" />}

        {!loading && items.length === 0 && (
          <EmptyState
            icon={<LibraryIcon size={32} />}
            title="Your library is empty"
            description="Search the catalog and save a few albums to start building it."
            action={
              <Link
                href="/search"
                className="mt-2 rounded-full bg-signature-gradient text-white text-sm font-medium px-4 py-2"
              >
                Go to search
              </Link>
            }
          />
        )}

        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {items.map((item) => (
                <LibraryCard key={item.id} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
