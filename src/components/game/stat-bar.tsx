import { cn } from "@/lib/utils";

type StatBarProps = {
  label: string;
  value: number;
  max?: number;
  accent?: string;
  className?: string;
};

export function StatBar({
  label,
  value,
  max = 99,
  accent,
  className,
}: StatBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="w-[72px] shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/70">
        <div
          className="animate-bar-grow h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: accent ?? "var(--primary)",
          }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-xs font-bold tabular-nums">
        {Math.round(value)}
      </span>
    </div>
  );
}
