"use client";

import { Check, Crosshair, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ShotResult = "hit" | "miss";

type ShotResultPipsProps = {
  /** Ordered outcomes so far; null = pending slot. */
  results: Array<ShotResult | null>;
  className?: string;
};

/** Compact hit/miss track for aim-style minigames. */
export function ShotResultPips({ results, className }: ShotResultPipsProps) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="status"
      aria-label={`${results.filter((r) => r === "hit").length} aciertos, ${results.filter((r) => r === "miss").length} fallos`}
    >
      {results.map((result, index) => (
        <span
          key={index}
          className={cn(
            "inline-flex size-6 items-center justify-center rounded border",
            result === "hit" &&
              "border-primary/60 bg-primary/20 text-primary",
            result === "miss" &&
              "border-destructive/60 bg-destructive/20 text-destructive",
            result === null &&
              "border-border/60 bg-background/40 text-muted-foreground/50",
          )}
        >
          {result === "hit" ? (
            <Check className="size-3.5" strokeWidth={2.75} aria-hidden />
          ) : result === "miss" ? (
            <X className="size-3.5" strokeWidth={2.75} aria-hidden />
          ) : (
            <Crosshair className="size-3 opacity-40" aria-hidden />
          )}
        </span>
      ))}
    </div>
  );
}

type ShotResultFlashProps = {
  result: ShotResult;
  className?: string;
};

/** Large centered icon flash for reaction / peek outcomes. */
export function ShotResultFlash({ result, className }: ShotResultFlashProps) {
  const hit = result === "hit";
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 flex items-center justify-center animate-fade-up",
        className,
      )}
      role="status"
      aria-label={hit ? "Acierto" : "Fallo"}
    >
      <span
        className={cn(
          "inline-flex size-16 items-center justify-center rounded-full border-2 shadow-lg",
          hit
            ? "border-primary bg-primary/25 text-primary"
            : "border-destructive bg-destructive/25 text-destructive",
        )}
      >
        {hit ? (
          <Check className="size-9" strokeWidth={2.5} aria-hidden />
        ) : (
          <X className="size-9" strokeWidth={2.5} aria-hidden />
        )}
      </span>
    </div>
  );
}
