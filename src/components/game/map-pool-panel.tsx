"use client";

import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ACTIVE_DUTY } from "@/lib/data/maps";
import {
  mapAvgAdr,
  mapAvgRating,
  mapWinRate,
} from "@/lib/game/ranks";
import { cn } from "@/lib/utils";
import type { MapCareerStat } from "@/lib/types/game";

type MapPoolPanelProps = {
  mapStats: MapCareerStat[];
  /** Compact strip for the player card (opens full dialog). */
  compact?: boolean;
  className?: string;
};

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

/** Light SVG spider chart across the Active Duty pool (win%). */
function MapRadar({
  values,
  labels,
  size = 148,
}: {
  values: number[];
  labels: string[];
  size?: number;
}) {
  const n = values.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const start = -Math.PI / 2;

  const rings = [0.25, 0.5, 0.75, 1];
  const polygon = values
    .map((value, index) => {
      const angle = start + (index * 2 * Math.PI) / n;
      const point = polarPoint(cx, cy, maxR * Math.min(1, value / 100), angle);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="mx-auto"
      role="img"
      aria-label="Radar de winrate por mapa"
    >
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, index) => {
            const angle = start + (index * 2 * Math.PI) / n;
            const point = polarPoint(cx, cy, maxR * ring, angle);
            return `${point.x},${point.y}`;
          }).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth="1"
        />
      ))}
      {labels.map((label, index) => {
        const angle = start + (index * 2 * Math.PI) / n;
        const tip = polarPoint(cx, cy, maxR, angle);
        const text = polarPoint(cx, cy, maxR + 12, angle);
        return (
          <g key={label}>
            <line
              x1={cx}
              y1={cy}
              x2={tip.x}
              y2={tip.y}
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="1"
            />
            <text
              x={text.x}
              y={text.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="7"
              fontWeight="700"
              fill="currentColor"
              fillOpacity="0.7"
            >
              {label.slice(0, 3).toUpperCase()}
            </text>
          </g>
        );
      })}
      <polygon
        points={polygon}
        fill="var(--primary)"
        fillOpacity="0.28"
        stroke="var(--primary)"
        strokeWidth="1.5"
      />
      {values.map((value, index) => {
        const angle = start + (index * 2 * Math.PI) / n;
        const point = polarPoint(cx, cy, maxR * Math.min(1, value / 100), angle);
        return (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="2.2"
            fill="var(--primary)"
          />
        );
      })}
    </svg>
  );
}

function buildBoard(mapStats: MapCareerStat[]) {
  const byId = new Map(mapStats.map((entry) => [entry.mapId, entry]));
  return ACTIVE_DUTY.map((map) => {
    const stat = byId.get(map.id) ?? {
      mapId: map.id,
      mapName: map.name,
      played: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      ratingSum: 0,
      adrSum: 0,
    };
    return {
      ...stat,
      mapName: map.name,
      winRate: mapWinRate(stat),
      avgRating: mapAvgRating(stat),
      avgAdr: mapAvgAdr(stat),
    };
  });
}

export function MapPoolPanel({
  mapStats,
  compact = false,
  className,
}: MapPoolPanelProps) {
  const [open, setOpen] = useState(false);
  const board = useMemo(() => buildBoard(mapStats), [mapStats]);
  const sorted = useMemo(
    () =>
      [...board].sort((a, b) => {
        if (b.played !== a.played) return b.played - a.played;
        return b.winRate - a.winRate;
      }),
    [board],
  );
  const playedAny = board.some((entry) => entry.played > 0);

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex w-full items-center justify-between rounded-md border border-border/60 bg-background/50 px-2 py-1.5 text-left transition hover:border-primary/50",
            className,
          )}
        >
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              Map pool
            </p>
            <p className="text-[11px] font-bold">
              {playedAny
                ? `${board.reduce((s, m) => s + m.wins, 0)}W / ${board.reduce((s, m) => s + m.played, 0)} mapas`
                : "Sin mapas aún"}
            </p>
          </div>
          <span className="text-[10px] font-bold text-primary">Ver →</span>
        </button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Mapas · Active Duty</DialogTitle>
            </DialogHeader>
            <MapPoolContent board={board} sorted={sorted} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <section className={cn("space-y-2", className)}>
      <MapPoolContent board={board} sorted={sorted} />
    </section>
  );
}

function MapPoolContent({
  board,
  sorted,
}: {
  board: ReturnType<typeof buildBoard>;
  sorted: ReturnType<typeof buildBoard>;
}) {
  return (
    <div className="space-y-2">
      <MapRadar
        values={board.map((entry) => (entry.played > 0 ? entry.winRate : 0))}
        labels={board.map((entry) => entry.mapName)}
      />
      <div className="space-y-1">
        {sorted.map((entry) => (
          <div
            key={entry.mapId}
            className="flex items-center gap-2 rounded-md border border-border/50 bg-card/40 px-2 py-1"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[12px] font-bold">{entry.mapName}</p>
                <p className="shrink-0 text-[11px] font-bold tabular-nums text-primary">
                  {entry.played > 0 ? `${entry.winRate}%` : "—"}
                </p>
              </div>
              <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{
                    width: `${entry.played > 0 ? entry.winRate : 0}%`,
                  }}
                />
              </div>
              <p className="mt-0.5 text-[9px] tabular-nums text-muted-foreground">
                {entry.wins}/{entry.played} · rating{" "}
                {entry.played > 0 ? entry.avgRating.toFixed(2) : "—"} · ADR{" "}
                {entry.played > 0 ? entry.avgAdr : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
