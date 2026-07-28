"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, NotebookPen } from "lucide-react";
import VinylArt from "./VinylArt";
import StarRating from "./StarRating";
import { LibraryItemResponse } from "@/lib/types";

export default function LibraryCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: LibraryItemResponse;
  onUpdate: (id: number, rating: number | null, notes: string | null) => void;
  onDelete: (id: number) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(item.userNotes ?? "");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3"
    >
      <VinylArt src={item.artworkUrl} alt={item.title} />

      <div className="min-w-0">
        <h3 className="font-display font-semibold text-ink truncate" title={item.title}>
          {item.title}
        </h3>
        <p className="text-sm text-muted truncate">{item.artistName}</p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted font-mono">
          {item.genre && <span className="px-2 py-0.5 rounded-full bg-elevated border border-border">{item.genre}</span>}
          {item.releaseDate && <span>{item.releaseDate.slice(0, 4)}</span>}
          {item.trackCount != null && <span>{item.trackCount} tracks</span>}
        </div>
      </div>

      <StarRating value={item.userRating} onChange={(r) => onUpdate(item.id, r, null)} />

      {notesOpen ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What do you think of this one?"
            rows={2}
            className="w-full text-sm rounded-lg bg-elevated border border-border px-3 py-2 text-ink placeholder:text-muted focus:border-violet/50 outline-none resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onUpdate(item.id, null, notes);
                setNotesOpen(false);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-signature-gradient text-white"
            >
              Save note
            </button>
            <button
              onClick={() => setNotesOpen(false)}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setNotesOpen(true)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors self-start"
        >
          <NotebookPen size={13} />
          {item.userNotes ? "Edit note" : "Add a note"}
        </button>
      )}
      {item.userNotes && !notesOpen && (
        <p className="text-xs text-muted italic line-clamp-2">&ldquo;{item.userNotes}&rdquo;</p>
      )}

      <button
        onClick={() => onDelete(item.id)}
        className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted hover:text-pink transition-colors mt-auto pt-2 border-t border-border"
      >
        <Trash2 size={13} />
        Remove from library
      </button>
    </motion.div>
  );
}
