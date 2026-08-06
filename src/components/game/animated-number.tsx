"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
  /** Formats with thousands separators, used for money and kill counts. */
  grouped?: boolean;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts from the previous value up to the new one, scoreboard style.
 * The tween writes straight to the DOM node so the animation never triggers a
 * React re-render.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 700,
  className,
  grouped = false,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);

  const format = (input: number): string => {
    const rounded = Number(input.toFixed(decimals));
    const body = grouped
      ? rounded.toLocaleString("es-AR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : rounded.toFixed(decimals);
    return `${prefix}${body}${suffix}`;
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const from = previous.current;
    previous.current = value;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (from === value || reduceMotion) {
      node.textContent = format(value);
      return;
    }

    node.classList.add("animate-stat-pop");
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      node.textContent = format(from + (value - from) * easeOutCubic(progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        node.classList.remove("animate-stat-pop");
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      node.classList.remove("animate-stat-pop");
    };
    // `format` is derived from the formatting props listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, prefix, suffix, grouped, durationMs]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {format(value)}
    </span>
  );
}
