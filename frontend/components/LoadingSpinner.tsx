export default function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <div className="flex items-end gap-1 h-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-signature-gradient animate-pulse_bar"
            style={{ height: "100%", animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <span className="text-sm font-mono">{label}</span>
    </div>
  );
}
