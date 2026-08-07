"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type CsCrosshairProps = {
  className?: string;
  /** Overall reticle size in px (gap + arm length scale with it). */
  size?: number;
  /** Reticle color. Defaults to classic CS cyan/blue. */
  color?: string;
};

/**
 * Classic Counter-Strike crosshair: four bars, open center, no dot.
 */
export function CsCrosshair({
  className,
  size = 64,
  color = "#5EB1FF",
}: CsCrosshairProps) {
  const arm = Math.max(8, Math.round(size * 0.22));
  const thickness = Math.max(2, Math.round(size * 0.04));
  const gap = Math.max(4, Math.round(size * 0.12));

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* top */}
        <div
          className="absolute left-1/2"
          style={{
            width: thickness,
            height: arm,
            top: `calc(50% - ${gap / 2}px - ${arm}px)`,
            transform: "translateX(-50%)",
            backgroundColor: color,
            boxShadow: `0 0 4px ${color}88`,
          }}
        />
        {/* bottom */}
        <div
          className="absolute left-1/2"
          style={{
            width: thickness,
            height: arm,
            top: `calc(50% + ${gap / 2}px)`,
            transform: "translateX(-50%)",
            backgroundColor: color,
            boxShadow: `0 0 4px ${color}88`,
          }}
        />
        {/* left */}
        <div
          className="absolute top-1/2"
          style={{
            width: arm,
            height: thickness,
            left: `calc(50% - ${gap / 2}px - ${arm}px)`,
            transform: "translateY(-50%)",
            backgroundColor: color,
            boxShadow: `0 0 4px ${color}88`,
          }}
        />
        {/* right */}
        <div
          className="absolute top-1/2"
          style={{
            width: arm,
            height: thickness,
            left: `calc(50% + ${gap / 2}px)`,
            transform: "translateY(-50%)",
            backgroundColor: color,
            boxShadow: `0 0 4px ${color}88`,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Cursor-following variant for hold / free-look minigames.
 * Position with `left`/`top` % on the wrapper; this draws the reticle itself.
 */
export function CsCrosshairReticle({
  className,
  size = 20,
  style,
}: {
  className?: string;
  size?: number;
  style?: CSSProperties;
}) {
  const arm = Math.max(5, Math.round(size * 0.38));
  const thickness = Math.max(2, Math.round(size * 0.12));
  const gap = Math.max(3, Math.round(size * 0.22));
  const color = "#5EB1FF";
  const box = arm * 2 + gap;

  return (
    <div
      className={cn("pointer-events-none absolute", className)}
      style={{
        width: box,
        height: box,
        transform: "translate(-50%, -50%)",
        ...style,
      }}
      aria-hidden
    >
      <div
        className="absolute left-1/2"
        style={{
          width: thickness,
          height: arm,
          top: 0,
          transform: "translateX(-50%)",
          backgroundColor: color,
          boxShadow: `0 0 3px ${color}99`,
        }}
      />
      <div
        className="absolute left-1/2"
        style={{
          width: thickness,
          height: arm,
          bottom: 0,
          transform: "translateX(-50%)",
          backgroundColor: color,
          boxShadow: `0 0 3px ${color}99`,
        }}
      />
      <div
        className="absolute top-1/2"
        style={{
          width: arm,
          height: thickness,
          left: 0,
          transform: "translateY(-50%)",
          backgroundColor: color,
          boxShadow: `0 0 3px ${color}99`,
        }}
      />
      <div
        className="absolute top-1/2"
        style={{
          width: arm,
          height: thickness,
          right: 0,
          transform: "translateY(-50%)",
          backgroundColor: color,
          boxShadow: `0 0 3px ${color}99`,
        }}
      />
    </div>
  );
}
