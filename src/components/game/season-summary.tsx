"use client";

import {
  Crosshair,
  DollarSign,
  Gauge,
  Layers,
  Star,
  Swords,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { RankBadges } from "@/components/art/rank-badge";
import { AnimatedNumber } from "@/components/game/animated-number";
import { Button } from "@/components/ui/button";
import { getOgRank } from "@/lib/game/ranks";
import { cn } from "@/lib/utils";
import type {
  HighlightKind,
  SeasonSummary as SeasonSummaryType,
  SeriesResult,
} from "@/lib/types/game";

type SeasonSummaryProps = {
  summary: SeasonSummaryType;
  series: SeriesResult | null;
  premierRating?: number;
  yearsLeft?: number;
  onContinue: () => void;
  onRetire?: () => void;
  className?: string;
};

type SummaryStat = {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  decimals?: number;
  prefix?: string;
  grouped?: boolean;
};

const HIGHLIGHT_EMOJI: Record<HighlightKind, string> = {
  win: "🏆",
  clutch: "🔥",
  fail: "💥",
  transfer: "📝",
  case: "📦",
  training: "🎯",
  neutral: "⚡",
  bench: "🪑",
  graffiti: "🎨",
  locker: "👕",
  career: "💼",
  personal: "❤️",
  match: "🔫",
  team: "👥",
  meta: "✨",
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

  const primaryStats: SummaryStat[] = [
    {
      label: "Rating",
      value: summary.rating,
      decimals: 2,
      icon: Gauge,
      accent: "text-sky-400 bg-sky-500/15 border-sky-500/35",
    },
    {
      label: "ADR",
      value: summary.adr,
      icon: Target,
      accent: "text-orange-400 bg-orange-500/15 border-orange-500/35",
    },
    {
      label: "Kills",
      value: summary.kills,
      icon: Crosshair,
      accent: "text-rose-400 bg-rose-500/15 border-rose-500/35",
    },
    {
      label: "Rounds",
      value: summary.roundsPlayed,
      icon: Layers,
      accent: "text-cyan-400 bg-cyan-500/15 border-cyan-500/35",
    },
  ];

  const secondaryStats: SummaryStat[] = [
    {
      label: "Aces",
      value: summary.aces,
      icon: Star,
      accent: "text-amber-400 bg-amber-500/15 border-amber-500/35",
    },
    {
      label: "Clutches",
      value: summary.clutchesWon,
      icon: Swords,
      accent: "text-violet-400 bg-violet-500/15 border-violet-500/35",
    },
    {
      label: "Premio",
      value: summary.prizeMoney,
      prefix: "$",
      grouped: true,
      icon: DollarSign,
      accent: "text-emerald-400 bg-emerald-500/15 border-emerald-500/35",
    },
  ];

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
          "relative shrink-0 overflow-hidden px-3 py-3.5 sm:px-5 sm:py-5",
          champion
            ? "bg-gradient-to-br from-primary/25 via-amber-500/10 to-transparent"
            : summary.benched
              ? "bg-gradient-to-br from-destructive/20 via-transparent to-transparent"
              : "bg-gradient-to-br from-border/40 via-transparent to-transparent",
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs sm:tracking-[0.28em]">
          {summary.year} · Split {splitLabel} · {summary.age} años ·{" "}
          {summary.teamName}
          {yearsLeft !== undefined && (
            <span className="ml-2 text-primary/80">
              · {yearsLeft} año{yearsLeft === 1 ? "" : "s"} para el retiro
            </span>
          )}
        </p>
        <div className="mt-2 flex items-end justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-black uppercase leading-none tracking-tight sm:text-2xl md:text-3xl">
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
          {primaryStats.map((stat) => (
            <SummaryStatCell key={stat.label} stat={stat} size="lg" />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {secondaryStats.map((stat) => (
            <SummaryStatCell key={stat.label} stat={stat} size="md" />
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
            <ul className="space-y-2">
              {summary.highlights.slice(-6).map((highlight, index) => (
                <li
                  key={index}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className="animate-fade-up flex items-start gap-2.5"
                >
                  <span
                    className="mt-0.5 w-6 shrink-0 text-center text-base leading-none"
                    aria-hidden
                  >
                    {HIGHLIGHT_EMOJI[highlight.kind] ?? HIGHLIGHT_EMOJI.neutral}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {highlight.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm italic text-muted-foreground">{summary.rivalNote}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border/50 p-3 sm:flex-row sm:p-4">
        {onRetire && summary.age >= 27 && (
          <Button
            variant="outline"
            onClick={onRetire}
            className="h-11 w-full touch-manipulation sm:h-9 sm:w-auto"
            size="lg"
          >
            Retirarse
          </Button>
        )}
        <Button
          onClick={onContinue}
          className="h-11 w-full flex-1 touch-manipulation sm:h-9"
          size="lg"
        >
          Siguiente split
        </Button>
      </div>
    </section>
  );
}

function SummaryStatCell({
  stat,
  size,
}: {
  stat: SummaryStat;
  size: "lg" | "md";
}) {
  const Icon = stat.icon;
  return (
    <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-3 text-center">
      <div
        className={cn(
          "mx-auto mb-1.5 flex size-7 items-center justify-center rounded-md border",
          stat.accent,
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </div>
      <AnimatedNumber
        value={stat.value}
        decimals={stat.decimals ?? 0}
        prefix={stat.prefix}
        grouped={stat.grouped}
        className={cn(
          "font-black tabular-nums",
          size === "lg" ? "text-3xl" : "text-2xl",
        )}
      />
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {stat.label}
      </p>
    </div>
  );
}
