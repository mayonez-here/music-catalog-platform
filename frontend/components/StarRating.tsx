"use client";

import { Star } from "lucide-react";

export default function StarRating({
  value,
  onChange,
  readOnly = false,
}: {
  value: number | null;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value != null && star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star)}
            className={`transition-transform ${readOnly ? "cursor-default" : "hover:scale-110"}`}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={16}
              className={filled ? "fill-gold text-gold" : "text-border"}
            />
          </button>
        );
      })}
    </div>
  );
}
