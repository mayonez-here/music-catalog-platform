"use client";

import { Sparkles, Lightbulb } from "lucide-react";
import { InsightResponse } from "@/lib/types";

export default function InsightsPanel({ insight }: { insight: InsightResponse }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-signature-gradient-soft blur-3xl" aria-hidden />

      <div className="relative flex items-start gap-3 mb-4">
        <div className="p-2 rounded-xl bg-signature-gradient-soft border border-white/10">
          <Sparkles size={18} className="text-violet" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-ink">AI trend summary</h3>
          <p className="text-xs text-muted font-mono">
            {insight.generatedBy === "llm" ? "narrated by claude" : "generated from your library stats"}
          </p>
        </div>
      </div>

      <p className="relative text-sm text-ink leading-relaxed mb-5">{insight.trendSummary}</p>

      {insight.observations.length > 0 && (
        <ul className="relative flex flex-col gap-2 mb-5">
          {insight.observations.map((obs, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-signature-gradient shrink-0" />
              {obs}
            </li>
          ))}
        </ul>
      )}

      {insight.recommendations.length > 0 && (
        <div className="relative border-t border-border pt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Lightbulb size={14} className="text-gold" />
            <h4 className="text-sm font-medium text-ink">Try something new</h4>
          </div>
          <div className="flex flex-col gap-2">
            {insight.recommendations.map((rec, i) => (
              <div key={i} className="text-sm text-muted rounded-lg bg-elevated border border-border px-3 py-2">
                <span className="text-ink font-medium">{rec.genre}</span> — {rec.reason}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
