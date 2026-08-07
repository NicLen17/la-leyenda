"use client";

import {
  Award,
  Crosshair,
  DollarSign,
  Gauge,
  Layers,
  Medal,
  Share2,
  Star,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { HomeHeroArt } from "@/components/art/home-hero-art";
import { PremierCsPlate, RankBadges } from "@/components/art/rank-badge";
import { TeamLogo } from "@/components/art/team-logo";
import { AnimatedNumber } from "@/components/game/animated-number";
import { MapPoolPanel } from "@/components/game/map-pool-panel";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/data/archetypes";
import { TEAMS } from "@/lib/data/teams";
import { getPremierBand } from "@/lib/game/ranks";
import { cn } from "@/lib/utils";
import type { CareerResult, Team } from "@/lib/types/game";

type RetirementCardProps = {
  result: CareerResult;
  onPlayAgain: () => void;
  className?: string;
};

type StatCell = {
  label: string;
  value: number;
  icon: LucideIcon;
  chip: string;
  valueClass?: string;
  decimals?: number;
  prefix?: string;
  grouped?: boolean;
  suffix?: string;
};

function teamByName(name: string): Team | undefined {
  return TEAMS.find((team) => team.name === name);
}

export function RetirementCard({
  result,
  onPlayAgain,
  className,
}: RetirementCardProps) {
  const [copied, setCopied] = useState(false);

  const lastTeam = useMemo(() => {
    const name = result.teamsPlayed[result.teamsPlayed.length - 1];
    return name ? teamByName(name) : undefined;
  }, [result.teamsPlayed]);

  const teamTrail = useMemo(
    () =>
      result.teamsPlayed
        .map((name) => teamByName(name))
        .filter((team): team is Team => Boolean(team)),
    [result.teamsPlayed],
  );

  const primary = lastTeam?.colors.primary ?? "#f97316";
  const secondary = lastTeam?.colors.secondary ?? "#0a0a0a";
  const premierBand = getPremierBand(result.premierRating);

  const headlineStats: StatCell[] = [
    {
      label: "Rating final",
      value: result.finalRating,
      decimals: 2,
      icon: Gauge,
      chip: "border-sky-500/40 bg-sky-500/15 text-sky-300",
      valueClass: "text-sky-300",
    },
    {
      label: "Peak",
      value: result.peakRating,
      decimals: 2,
      icon: Star,
      chip: "border-amber-500/40 bg-amber-500/15 text-amber-300",
      valueClass: "text-amber-300",
    },
    {
      label: "K/D",
      value: result.kd,
      decimals: 2,
      icon: Crosshair,
      chip: "border-rose-500/40 bg-rose-500/15 text-rose-300",
      valueClass: "text-rose-300",
    },
    {
      label: "ADR",
      value: result.adr,
      icon: Target,
      chip: "border-orange-500/40 bg-orange-500/15 text-orange-300",
      valueClass: "text-orange-300",
    },
  ];

  const careerKpis: StatCell[] = [
    {
      label: "Majors",
      value: result.majors,
      icon: Award,
      chip: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
      valueClass: "text-emerald-300",
    },
    {
      label: "Trofeos",
      value: result.trophies,
      icon: Trophy,
      chip: "border-yellow-500/40 bg-yellow-500/15 text-yellow-300",
      valueClass: "text-yellow-300",
    },
    {
      label: "Aces",
      value: result.aces,
      icon: Star,
      chip: "border-amber-500/40 bg-amber-500/15 text-amber-300",
      valueClass: "text-amber-300",
    },
    {
      label: "Clutches",
      value: result.clutchesWon,
      icon: Swords,
      chip: "border-violet-500/40 bg-violet-500/15 text-violet-300",
      valueClass: "text-violet-300",
    },
  ];

  const share = async () => {
    const lines = [
      `LA LEYENDA · ${result.nickname} (${ROLE_LABELS[result.role]})`,
      `Rating ${result.finalRating.toFixed(2)} · K/D ${result.kd.toFixed(2)} · ADR ${result.adr}`,
      `Premier ${result.premierRating} (peak ${result.peakPremierRating}) · ${result.ogLabel}`,
      `${result.majors} Major(s) · ${result.trophies} trofeos · ${result.aces} aces · ${result.clutchesWon} clutches`,
      `Ganancias: $${result.earnings.toLocaleString("es-AR")}`,
      `Comparación: ${result.legendName}`,
      `Score: ${result.score}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      toast.success("Carrera copiada al portapapeles");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <section
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70",
        className,
      )}
      style={{
        borderColor: `${primary}55`,
        boxShadow: `inset 0 1px 0 ${primary}28, 0 0 0 1px ${primary}12`,
      }}
    >
      {/* Home hero operatives + atmosphere */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.55]">
        <HomeHeroArt />
      </div>

      {/* Readability scrims + team tint (sidebar-style gradient) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${secondary}f0 0%, ${secondary}aa 22%, rgba(0,0,0,0.72) 48%, rgba(0,0,0,0.88) 100%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${primary}33 0%, transparent 55%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:40px_40px]"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
        {/* Identity — mirrors player sidebar header */}
        <header className="animate-card-in flex shrink-0 items-center gap-3">
          {lastTeam ? (
            <TeamLogo team={lastTeam} size={56} animate />
          ) : (
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-lg font-black text-primary"
              aria-hidden
            >
              ★
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
              Fin de la carrera · {result.yearsPlayed} años en el circuito
            </p>
            <h2 className="truncate text-3xl font-black uppercase leading-none tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] sm:text-4xl">
              {result.nickname}
            </h2>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {ROLE_LABELS[result.role]}
              </span>
              {" · "}
              {result.nationality}
              {" · "}
              <span className="font-bold text-primary">{result.fameLevel}</span>
            </p>
            <p className="mt-0.5 text-[11px] font-bold" style={{ color: primary }}>
              Premier {result.premierRating.toLocaleString("es-AR")}
              {" · peak "}
              {result.peakPremierRating.toLocaleString("es-AR")}
              {" · "}
              {result.ogLabel}
            </p>
          </div>
          <RankBadges premierRating={result.premierRating} size="md" />
        </header>

        {/* Rating + Premier band — same dual plate as sidebar */}
        <div className="animate-card-in flex shrink-0 items-center justify-between rounded-lg border border-border/60 bg-background/55 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [animation-delay:60ms]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Rating final
            </p>
            <AnimatedNumber
              value={result.finalRating}
              decimals={2}
              className={cn(
                "text-2xl font-black leading-none",
                result.finalRating >= 1.1
                  ? "text-primary"
                  : result.finalRating < 0.95
                    ? "text-destructive"
                    : "",
              )}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Premier CS
            </p>
            <PremierCsPlate rating={result.premierRating}>
              <span style={{ color: premierBand.color }}>
                <AnimatedNumber
                  value={result.premierRating}
                  grouped
                  className="text-xl font-black italic tabular-nums leading-none tracking-tight"
                />
              </span>
            </PremierCsPlate>
          </div>
        </div>

        {/* Headline scoreboard */}
        <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
          {headlineStats.map((stat, index) => (
            <KpiCell
              key={stat.label}
              stat={stat}
              delayMs={80 + index * 40}
            />
          ))}
        </div>

        {/* Career KPI chips — identical language to sidebar counters */}
        <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
          {careerKpis.map((stat, index) => (
            <KpiCell
              key={stat.label}
              stat={stat}
              delayMs={200 + index * 40}
              dense
            />
          ))}
        </div>

        {/* Meta row: kills / money / HLTV */}
        <div className="grid shrink-0 grid-cols-3 gap-1.5">
          <div
            className="animate-card-in rounded-md border border-border/60 bg-background/55 px-2 py-2 text-center [animation-delay:360ms]"
          >
            <div className="mx-auto mb-1 flex size-6 items-center justify-center rounded-md border border-cyan-500/40 bg-cyan-500/15 text-cyan-300">
              <Layers className="size-3" aria-hidden />
            </div>
            <AnimatedNumber
              value={result.totalKills}
              grouped
              className="text-base font-bold text-cyan-300"
            />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Kills · {result.roundsPlayed.toLocaleString("es-AR")} rds
            </p>
          </div>
          <div className="animate-card-in rounded-md border border-border/60 bg-background/55 px-2 py-2 text-center [animation-delay:400ms]">
            <div className="mx-auto mb-1 flex size-6 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/15 text-emerald-300">
              <DollarSign className="size-3" aria-hidden />
            </div>
            <AnimatedNumber
              value={result.earnings}
              grouped
              prefix="$"
              className="text-base font-bold text-primary"
            />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Ganancias
            </p>
          </div>
          <div className="animate-card-in rounded-md border border-border/60 bg-background/55 px-2 py-2 text-center [animation-delay:440ms]">
            <div className="mx-auto mb-1 flex size-6 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary">
              <Medal className="size-3" aria-hidden />
            </div>
            <p className="text-base font-bold text-primary">
              {result.hltvTop20 ? `#${result.hltvTop20}` : "—"}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              HLTV Top 20
            </p>
          </div>
        </div>

        {/* Legend comparison */}
        <div
          className="animate-card-in relative overflow-hidden rounded-lg border border-primary/45 bg-primary/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] [animation-delay:480ms]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-primary/20 blur-2xl"
          />
          <p className="relative text-[10px] font-bold uppercase tracking-widest text-primary">
            Te comparan con {result.legendName}
          </p>
          <p className="relative mt-1 text-sm leading-snug text-foreground/95">
            {result.legendComparison}
          </p>
        </div>

        {/* Team trail */}
        <div className="animate-card-in space-y-1.5 rounded-md border border-border/60 bg-background/50 px-3 py-2.5 [animation-delay:520ms]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Equipos
          </p>
          {teamTrail.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {teamTrail.map((team, index) => (
                <span key={`${team.id}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <span className="text-[10px] font-bold text-primary">→</span>
                  )}
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5"
                    style={{
                      borderColor: `${team.colors.primary}55`,
                      backgroundColor: `${team.colors.primary}14`,
                    }}
                  >
                    <TeamLogo team={team} size={18} bare />
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: team.colors.primary }}
                    >
                      {team.shortName}
                    </span>
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-foreground/90">
              {result.teamsPlayed.join(" → ")}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Graffitis:</span>{" "}
            {result.graffitiCount}
            {result.bestSkin && (
              <>
                {" · "}
                <span className="font-semibold text-foreground">Mejor skin:</span>{" "}
                {result.bestSkin}
              </>
            )}
          </p>
        </div>

        {result.mapStats.length > 0 && (
          <div className="animate-card-in [animation-delay:560ms]">
            <MapPoolPanel mapStats={result.mapStats} compact />
          </div>
        )}

        {/* Career score — hero number */}
        <div
          className="animate-card-in relative overflow-hidden rounded-lg border border-primary/40 bg-gradient-to-br from-primary/20 via-background/60 to-background/40 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] [animation-delay:600ms]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
            Score de carrera
          </p>
          <AnimatedNumber
            value={result.score}
            durationMs={1400}
            className="text-4xl font-black tabular-nums text-primary drop-shadow-[0_0_28px_rgba(249,115,22,0.35)] sm:text-5xl"
          />
        </div>

        {/* Actions */}
        <div className="animate-card-in flex shrink-0 gap-2 [animation-delay:640ms]">
          <Button
            onClick={share}
            variant="secondary"
            className="flex-1 gap-1.5 border border-border/60 bg-background/55"
            size="sm"
          >
            <Share2 className="size-3.5" aria-hidden />
            {copied ? "Copiado" : "Compartir"}
          </Button>
          <Link
            href="/ranking"
            className="inline-flex flex-1 items-center justify-center rounded-md border border-border/60 bg-background/40 px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            Ranking
          </Link>
          <Button onClick={onPlayAgain} className="flex-1 font-bold" size="sm">
            Otra carrera
          </Button>
        </div>
      </div>
    </section>
  );
}

function KpiCell({
  stat,
  delayMs,
  dense = false,
}: {
  stat: StatCell;
  delayMs: number;
  dense?: boolean;
}) {
  const Icon = stat.icon;
  return (
    <div
      className="animate-card-in rounded-md border border-border/60 bg-background/55 px-1.5 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className={cn(
          "mx-auto mb-1 flex items-center justify-center rounded-md border",
          dense ? "size-6" : "size-7",
          stat.chip,
        )}
      >
        <Icon className={dense ? "size-3" : "size-3.5"} aria-hidden />
      </div>
      <AnimatedNumber
        value={stat.value}
        decimals={stat.decimals ?? 0}
        prefix={stat.prefix}
        suffix={stat.suffix}
        grouped={stat.grouped}
        className={cn(
          "font-bold tabular-nums",
          dense ? "text-base" : "text-lg",
          stat.valueClass,
        )}
      />
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {stat.label}
      </p>
    </div>
  );
}
