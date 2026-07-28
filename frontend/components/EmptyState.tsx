import { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-24 px-6 rounded-2xl border border-dashed border-border">
      {icon && <div className="text-muted opacity-70">{icon}</div>}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-muted max-w-sm">{description}</p>
      {action}
    </div>
  );
}
