"use client";

import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ACTIVE_DUTY, getMapById } from "@/lib/data/maps";
import {
  mapAvgAdr,
  mapAvgRating,
  mapWinRate,
} from "@/lib/game/ranks";
import { cn } from "@/lib/utils";
import type { MapCareerStat } from "@/lib/types/game";

type MapPoolPanelProps = {
  mapStats: MapCareerStat[];
  /** Compact strip that opens the full dialog (e.g. retirement). */
  compact?: boolean;
  /** Denser layout for the always-visible player sidebar. */
  sidebar?: boolean;
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

/** Only maps the player has already played — keeps the sidebar list compact. */
function playedBoard(board: ReturnType<typeof buildBoard>) {
  return board.filter((entry) => entry.played > 0);
}

export function MapPoolPanel({
  mapStats,
  compact = false,
  sidebar = false,
  className,
}: MapPoolPanelProps) {
  const [open, setOpen] = useState(false);
  const board = useMemo(() => buildBoard(mapStats), [mapStats]);
  const activeBoard = useMemo(() => playedBoard(board), [board]);
  const sorted = useMemo(
    () =>
      [...activeBoard].sort((a, b) => {
        if (b.played !== a.played) return b.played - a.played;
        return b.winRate - a.winRate;
      }),
    [activeBoard],
  );
  const playedAny = activeBoard.length > 0;

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
                ? `${activeBoard.reduce((s, m) => s + m.wins, 0)}W / ${activeBoard.reduce((s, m) => s + m.played, 0)} mapas`
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
            <MapPoolContent board={activeBoard} sorted={sorted} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-md border border-border/60 bg-background/50",
        sidebar ? "overflow-hidden" : "space-y-2 p-2",
        className,
      )}
    >
      {sidebar && (
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-2.5 py-1.5">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Mapas · Actividad
          </p>
          <p className="text-[10px] font-bold tabular-nums text-primary">
            {playedAny
              ? `${activeBoard.reduce((s, m) => s + m.wins, 0)}W / ${activeBoard.reduce((s, m) => s + m.played, 0)}`
              : "—"}
          </p>
        </div>
      )}
      <div
        className={cn(
          "min-h-0 flex-1",
          sidebar && (playedAny ? "overflow-y-auto p-2" : "p-2"),
        )}
      >
        <MapPoolContent board={activeBoard} sorted={sorted} dense={sidebar} />
      </div>
    </section>
  );
}

function MapPoolContent({
  board,
  sorted,
  dense = false,
}: {
  board: ReturnType<typeof buildBoard>;
  sorted: ReturnType<typeof buildBoard>;
  dense?: boolean;
}) {
  if (board.length === 0) {
    return (
      <p
        className={cn(
          "text-center text-muted-foreground",
          dense ? "py-4 text-[11px]" : "py-6 text-sm",
        )}
      >
        Todavía no jugaste ningún mapa.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", dense && "space-y-1.5")}>
      {board.length >= 3 && (
        <MapRadar
          values={board.map((entry) => entry.winRate)}
          labels={board.map((entry) => entry.mapName)}
          size={dense ? 118 : 148}
        />
      )}
      <div className={cn("space-y-1", dense && "space-y-0.5")}>
        {sorted.map((entry) => {
          const preview = getMapById(entry.mapId)?.imagePath;
          return (
            <div
              key={entry.mapId}
              className={cn(
                "flex items-center gap-2 rounded-md border border-border/50 bg-card/40",
                dense ? "px-1.5 py-1" : "px-2 py-1",
              )}
            >
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt=""
                  className={cn(
                    "shrink-0 rounded object-cover",
                    dense ? "size-7" : "size-9",
                  )}
                  draggable={false}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      "truncate font-bold",
                      dense ? "text-[11px]" : "text-[12px]",
                    )}
                  >
                    {entry.mapName}
                  </p>
                  <p className="shrink-0 text-[11px] font-bold tabular-nums text-primary">
                    {entry.winRate}%
                  </p>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-border/60">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${entry.winRate}%` }}
                  />
                </div>
                <p className="mt-0.5 text-[9px] tabular-nums text-muted-foreground">
                  {entry.wins}/{entry.played} · rating {entry.avgRating.toFixed(2)}{" "}
                  · ADR {entry.avgAdr}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
