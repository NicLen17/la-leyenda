"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type StatBarProps = {
  label: string;
  value: number;
  /** Full name for tooltip when the label is abbreviated. */
  title?: string;
  className?: string;
};

type DeltaFlash = {
  id: number;
  amount: number;
};

export function StatBar({ label, value, title, className }: StatBarProps) {
  const previous = useRef(value);
  const [delta, setDelta] = useState<DeltaFlash | null>(null);
  /** Last change direction vs previous value; clears only on the next change. */
  const [trend, setTrend] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    const amount = Math.round(value) - Math.round(from);
    if (amount === 0) return;

    setTrend(amount > 0 ? "up" : "down");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const id = Date.now();
    setDelta({ id, amount });
    const timer = window.setTimeout(() => {
      setDelta((current) => (current?.id === id ? null : current));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <div
      className={cn(
        "relative flex h-5 items-center justify-between gap-2",
        className,
      )}
    >
      <span
        title={title}
        className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </span>
      <div className="relative flex shrink-0 items-center gap-0.5">
        <span className="text-xs font-bold tabular-nums">
          {Math.round(value)}
        </span>
        <span
          className={cn(
            "flex size-3.5 items-center justify-center",
            trend === "up" && "text-emerald-400",
            trend === "down" && "text-rose-400",
            !trend && "text-transparent",
          )}
          aria-hidden={!trend}
        >
          {trend === "up" ? (
            <ArrowUp className="size-3 stroke-[2.5]" />
          ) : trend === "down" ? (
            <ArrowDown className="size-3 stroke-[2.5]" />
          ) : (
            <ArrowUp className="size-3" />
          )}
        </span>
        {delta && (
          <span
            key={delta.id}
            aria-hidden
            className={cn(
              "animate-float-delta absolute -right-0.5 -top-3 text-[11px] font-black tabular-nums",
              delta.amount > 0 ? "text-emerald-400" : "text-rose-400",
            )}
          >
            {delta.amount > 0 ? `+${delta.amount}` : delta.amount}
          </span>
        )}
      </div>
    </div>
  );
}
