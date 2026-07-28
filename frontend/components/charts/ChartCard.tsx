import { ReactNode } from "react";

export default function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-4">
      <div>
        <h3 className="font-display font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}
