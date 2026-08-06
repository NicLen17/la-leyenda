"use client";

import { RankBadges } from "@/components/art/rank-badge";
import { AnimatedNumber } from "@/components/game/animated-number";
import { Button } from "@/components/ui/button";
import { getOgRank } from "@/lib/game/ranks";
import { cn } from "@/lib/utils";
import type { SeasonSummary as SeasonSummaryType, SeriesResult } from "@/lib/types/game";

type SeasonSummaryProps = {
  summary: SeasonSummaryType;
  series: SeriesResult | null;
  premierRating?: number;
  onContinue: () => void;
  className?: string;
};

export function SeasonSummary({
  summary,
  series,
  premierRating,
  onContinue,
  className,
}: SeasonSummaryProps) {
  const champion = summary.placement === "CAMPEÓN";
  const og = premierRating !== undefined ? getOgRank(premierRating) : null;

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col gap-2.5 overflow-hidden rounded-xl border border-border/70 bg-card/60 p-4",
        className,
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {summary.year} · Split {((summary.split - 1) % 2) + 1} · {summary.age} años
          </p>
          <h2 className="text-xl font-black uppercase leading-tight tracking-tight">
            {summary.tournamentName}
          </h2>
          <p
            className={cn(
              "animate-fade-up text-2xl font-black uppercase tracking-tight",
              champion
                ? "text-primary"
                : summary.benched
                  ? "text-destructive"
                  : "text-foreground",
            )}
          >
            {summary.placement}
          </p>
          {premierRating !== undefined && og && (
            <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
              Premier{" "}
              <span className="text-primary">
                {premierRating.toLocaleString("es-AR")}
              </span>{" "}
              · {og.label}
            </p>
          )}
        </div>
        {premierRating !== undefined && (
          <RankBadges premierRating={premierRating} size="sm" />
        )}
      </header>

      {/* scoreboard */}
      <div className="grid shrink-0 grid-cols-4 gap-1.5">
        {[
          { label: "Rating", value: summary.rating, decimals: 2 },
          { label: "ADR", value: summary.adr },
          { label: "Kills", value: summary.kills },
          { label: "Rounds", value: summary.roundsPlayed },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border/60 bg-background/50 px-2 py-1.5 text-center"
          >
            <AnimatedNumber
              value={stat.value}
              decimals={stat.decimals ?? 0}
              className="text-base font-black"
            />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-1.5">
        {[
          { label: "Aces", value: summary.aces },
          { label: "Clutches", value: summary.clutchesWon },
          { label: "Premio", value: summary.prizeMoney, prefix: "$", grouped: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border/60 bg-background/50 px-2 py-1.5 text-center"
          >
            <AnimatedNumber
              value={stat.value}
              prefix={stat.prefix}
              grouped={stat.grouped}
              className="text-sm font-bold"
            />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* map by map */}
      {series && series.maps.length > 0 && (
        <div className="shrink-0 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Mapas jugados
          </p>
          <div className="flex flex-wrap gap-1">
            {series.maps.slice(0, 8).map((map, index) => (
              <span
                key={`${map.mapId}-${index}`}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "animate-fade-up rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  map.won
                    ? "bg-primary/15 text-primary"
                    : "bg-destructive/15 text-destructive",
                )}
              >
                {map.mapName} {map.roundsWon}-{map.roundsLost}
                {map.overtime && " OT"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* highlights */}
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {summary.highlights.slice(-5).map((highlight, index) => (
          <p
            key={index}
            style={{ animationDelay: `${index * 70}ms` }}
            className="animate-fade-up border-l-2 border-primary/50 pl-2 text-[11px] leading-snug text-muted-foreground"
          >
            {highlight}
          </p>
        ))}
      </div>

      <div className="shrink-0 space-y-2">
        <p className="text-[10px] italic text-muted-foreground">
          {summary.rivalNote}
        </p>
        <Button onClick={onContinue} className="w-full" size="sm">
          Siguiente split
        </Button>
      </div>
    </section>
  );
}
