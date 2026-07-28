"use client";

/**
 * Album artwork with a subtle, tasteful zoom on hover.
 */
export default function VinylArt({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/10 shadow-lg bg-elevated group/art">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src.replace("100x100", "500x500")}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/art:scale-110"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-muted text-xs">No artwork</div>
      )}
    </div>
  );
}

