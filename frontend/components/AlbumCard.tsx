"use client";

import { motion } from "framer-motion";
import { Plus, Check, ExternalLink } from "lucide-react";
import VinylArt from "./VinylArt";
import { SearchResultItem } from "@/lib/types";

export default function AlbumCard({
  item,
  saved,
  saving,
  onSave,
}: {
  item: SearchResultItem;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-border bg-surface p-4 flex flex-col gap-3 hover:border-white/20 transition-colors"
    >
      <VinylArt src={item.artworkUrl} alt={item.title} />

      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-ink truncate" title={item.title}>
          {item.title}
        </h3>
        <p className="text-sm text-muted truncate">{item.artistName}</p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted font-mono">
          {item.genre && <span className="px-2 py-0.5 rounded-full bg-elevated border border-border">{item.genre}</span>}
          {item.releaseDate && <span>{item.releaseDate.slice(0, 4)}</span>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-mono text-muted">
          {item.price != null ? `$${item.price.toFixed(2)}` : "—"}
        </span>
        <div className="flex items-center gap-1.5">
          {item.viewUrl && (
            <a
              href={item.viewUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-muted hover:text-ink hover:bg-elevated transition-colors"
              aria-label={`Open ${item.title} on the iTunes Store`}
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button
            onClick={onSave}
            disabled={saved || saving}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-all ${
              saved
                ? "bg-elevated text-cyan border border-cyan/30"
                : "bg-signature-gradient text-white hover:opacity-90 disabled:opacity-60"
            }`}
          >
            {saved ? <Check size={14} /> : <Plus size={14} />}
            {saved ? "Saved" : saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
