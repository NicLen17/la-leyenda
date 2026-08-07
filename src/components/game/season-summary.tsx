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
  yearsLeft?: number;
  onContinue: () => void;
  onRetire?: () => void;
  className?: string;
};

export function SeasonSummary({
  summary,
  series,
  premierRating,
  yearsLeft,
  onContinue,
  onRetire,
  className,
}: SeasonSummaryProps) {
  const champion = summary.placement === "CAMPEÓN";
  const og = premierRating !== undefined ? getOgRank(premierRating) : null;
  const splitLabel = ((summary.split - 1) % 2) + 1;

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60",
        className,
      )}
    >
      {/* Hero result banner */}
      <header
        className={cn(
          "relative shrink-0 overflow-hidden px-5 py-5",
          champion
            ? "bg-gradient-to-br from-primary/25 via-amber-500/10 to-transparent"
            : summary.benched
              ? "bg-gradient-to-br from-destructive/20 via-transparent to-transparent"
              : "bg-gradient-to-br from-border/40 via-transparent to-transparent",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {summary.year} · Split {splitLabel} · {summary.age} años ·{" "}
          {summary.teamName}
          {yearsLeft !== undefined && (
            <span className="ml-2 text-primary/80">
              · {yearsLeft} año{yearsLeft === 1 ? "" : "s"} para el retiro
            </span>
          )}
        </p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-black uppercase leading-none tracking-tight md:text-3xl">
              {summary.tournamentName}
            </h2>
            <p
              className={cn(
                "mt-1 animate-fade-up text-4xl font-black uppercase tracking-tight md:text-5xl",
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
              <p className="mt-2 text-sm font-bold text-muted-foreground">
                Premier{" "}
                <span className="text-primary">
                  {premierRating.toLocaleString("es-AR")}
                </span>{" "}
                · {og.label}
              </p>
            )}
          </div>
          {premierRating !== undefined && (
            <RankBadges premierRating={premierRating} size="md" />
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        {/* Big scoreboard */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Rating", value: summary.rating, decimals: 2 },
            { label: "ADR", value: summary.adr },
            { label: "Kills", value: summary.kills },
            { label: "Rounds", value: summary.roundsPlayed },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/60 bg-background/50 px-3 py-3 text-center"
            >
              <AnimatedNumber
                value={stat.value}
                decimals={stat.decimals ?? 0}
                className="text-3xl font-black tabular-nums"
              />
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Aces", value: summary.aces },
            { label: "Clutches", value: summary.clutchesWon },
            {
              label: "Premio",
              value: summary.prizeMoney,
              prefix: "$",
              grouped: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border/60 bg-background/50 px-3 py-3 text-center"
            >
              <AnimatedNumber
                value={stat.value}
                prefix={stat.prefix}
                grouped={stat.grouped}
                className="text-2xl font-black tabular-nums"
              />
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {series && series.maps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Mapas jugados
            </p>
            <div className="flex flex-wrap gap-2">
              {series.maps.slice(0, 8).map((map, index) => (
                <span
                  key={`${map.mapId}-${index}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    "animate-fade-up rounded-md px-2.5 py-1.5 text-sm font-bold tabular-nums",
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

        {summary.highlights.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Momentos del split
            </p>
            <div className="space-y-2">
              {summary.highlights.slice(-6).map((highlight, index) => (
                <p
                  key={index}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className="animate-fade-up border-l-2 border-primary/60 pl-3 text-sm leading-relaxed text-foreground/90"
                >
                  {highlight}
                </p>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm italic text-muted-foreground">{summary.rivalNote}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border/50 p-4 sm:flex-row">
        {onRetire && summary.age >= 27 && (
          <Button
            variant="outline"
            onClick={onRetire}
            className="sm:w-auto"
            size="lg"
          >
            Retirarse
          </Button>
        )}
        <Button onClick={onContinue} className="flex-1" size="lg">
          Siguiente split
        </Button>
      </div>
    </section>
  );
}
