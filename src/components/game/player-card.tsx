"use client";

import {
  Award,
  Crosshair,
  Layers,
  Star,
  Swords,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PremierCsPlate, RankBadges } from "@/components/art/rank-badge";
import { TeamLogo } from "@/components/art/team-logo";
import { AnimatedNumber } from "@/components/game/animated-number";
import { MapPoolPanel } from "@/components/game/map-pool-panel";
import { StatBar } from "@/components/game/stat-bar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/data/archetypes";
import { getArchetypeById } from "@/lib/data/archetypes";
import {
  RETIREMENT_AGE,
  careerProgress,
  careerYearsLeft,
} from "@/lib/game/constants";
import { getNextFameLevel } from "@/lib/game/progression";
import { getOgRank, getPremierBand } from "@/lib/game/ranks";
import { adrOf, hsPercentOf, kastOf, totalClutches } from "@/lib/game/simulator";
import { getTeamBalance } from "@/lib/game/team-context";
import { cn } from "@/lib/utils";
import type { PlayerState } from "@/lib/types/game";

type CareerKpi = {
  label: string;
  value: number;
  grouped?: boolean;
  icon: LucideIcon;
  /** Tailwind tokens for icon chip + value tint */
  chip: string;
  valueClass: string;
};

type PlayerCardProps = {
  player: PlayerState;
  onOpenCases?: () => void;
  className?: string;
};

function money(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value}`;
}

export function PlayerCard({
  player,
  onOpenCases,
  className,
}: PlayerCardProps) {
  const archetype = player.archetypeId
    ? getArchetypeById(player.archetypeId)
    : null;
  const nextFame = getNextFameLevel(player.fame);
  const og = getOgRank(player.premierRating);
  const premierBand = getPremierBand(player.premierRating);
  const clutches = totalClutches(player.career.clutches);
  const kd =
    player.career.deaths > 0
      ? player.career.kills / player.career.deaths
      : player.career.kills;
  const yearsLeft = careerYearsLeft(player.age);
  const progress = careerProgress(player.age);
  const seasonYear = player.year;
  const orgBalance = getTeamBalance(player.team);

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col gap-2 overflow-y-auto overflow-x-hidden rounded-xl border bg-card/80 p-3",
        className,
      )}
      style={{
        borderColor: `${player.team.colors.primary}55`,
        background: `linear-gradient(180deg, ${player.team.colors.secondary}ee 0%, ${player.team.colors.secondary}66 28%, transparent 52%)`,
        boxShadow: `inset 0 1px 0 ${player.team.colors.primary}28`,
      }}
    >
      {/* identity */}
      <header className="flex shrink-0 items-center gap-2">
        <TeamLogo team={player.team} size={48} animate key={player.team.id} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-lg font-black uppercase leading-none tracking-tight">
              {player.nickname}
            </h2>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold">
              {ROLE_LABELS[player.role]}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            <span style={{ color: player.team.colors.primary }}>
              {player.team.name}
            </span>{" "}
            · Tier {player.team.tier} · {player.nationality}
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            Peak Premier {player.peakPremierRating.toLocaleString("es-AR")} ·{" "}
            {og.label}
            {" · "}
            <span title="Presión de la org: afecta minijuegos, riesgos y brackets">
              {orgBalance.label}
            </span>
          </p>
        </div>
        <RankBadges premierRating={player.premierRating} size="sm" />
      </header>

      <div className="flex shrink-0 items-center justify-between rounded-md border border-border/60 bg-background/50 px-2.5 py-1.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Rating 2.1
          </p>
          <AnimatedNumber
            value={player.rating}
            decimals={2}
            className={cn(
              "text-xl font-black leading-none",
              player.rating >= 1.1
                ? "text-primary"
                : player.rating < 0.95
                  ? "text-destructive"
                  : "",
            )}
          />
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Premier CS
          </p>
          <PremierCsPlate rating={player.premierRating}>
            <span style={{ color: premierBand.color }}>
              <AnimatedNumber
                value={player.premierRating}
                grouped
                className="text-lg font-black italic tabular-nums leading-none tracking-tight"
              />
            </span>
          </PremierCsPlate>
        </div>
      </div>

      {player.benched && (
        <div className="rounded-md border border-destructive/50 bg-destructive/15 px-2 py-1 text-center text-[11px] font-bold uppercase tracking-wider text-destructive">
          En el banco · sin minutos
        </div>
      )}

      {/* season + career end meter */}
      <div className="shrink-0 rounded-md border border-border/60 bg-background/50 px-2.5 py-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Temporada {seasonYear}
          </p>
          <p className="text-[10px] font-bold tabular-nums text-primary">
            Retiro a los {RETIREMENT_AGE}
          </p>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-primary transition-[width] duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {player.age} años ·{" "}
          {yearsLeft === 0
            ? "Última temporada"
            : `${yearsLeft} año${yearsLeft === 1 ? "" : "s"} de carrera`}
        </p>
      </div>

      {/* cases inventory */}
      <button
        type="button"
        disabled={!onOpenCases || player.casesAvailable <= 0}
        onClick={onOpenCases}
        className={cn(
          "flex w-full shrink-0 touch-manipulation items-center gap-2.5 rounded-md border px-2.5 py-2.5 text-left transition-colors sm:py-2",
          player.casesAvailable > 0
            ? "border-amber-500/50 bg-amber-500/10 hover:border-amber-400/80 hover:bg-amber-500/15"
            : "border-border/60 bg-background/40 opacity-70",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/ui/cs2-case.webp"
          alt=""
          className={cn(
            "size-10 shrink-0 object-contain drop-shadow-md",
            player.casesAvailable > 0 && "animate-case-pulse",
          )}
          draggable={false}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Cajas
          </p>
          <p
            className={cn(
              "text-sm font-black tabular-nums",
              player.casesAvailable > 0 && "animate-case-pulse text-amber-300",
            )}
          >
            {player.casesAvailable} disponible
            {player.casesAvailable === 1 ? "" : "s"}
          </p>
        </div>
        {player.casesAvailable > 0 && (
          <span className="animate-case-pulse shrink-0 rounded border border-amber-400/50 bg-amber-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Abrir
          </span>
        )}
      </button>

      {/* headline scoreboard */}
      <div className="grid shrink-0 grid-cols-4 gap-1.5">
        {[
          { label: "K/D", value: kd, decimals: 2 },
          { label: "ADR", value: adrOf(player.career), decimals: 0 },
          { label: "KAST", value: kastOf(player.career), decimals: 0, suffix: "%" },
          { label: "HS", value: hsPercentOf(player.career), decimals: 0, suffix: "%" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border/60 bg-background/50 px-1.5 py-1.5 text-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <AnimatedNumber
              value={stat.value}
              decimals={stat.decimals}
              suffix={stat.suffix}
              className="text-base font-bold"
            />
          </div>
        ))}
      </div>

      {/* attributes — label + value + trend (no bars; keeps rows even) */}
      <div className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-1 rounded-md border border-border/60 bg-background/50 px-2.5 py-2">
        <StatBar label="Aim" value={player.aim} />
        <StatBar label="Reflejos" value={player.reflexes} />
        <StatBar label="Sense" title="Game sense" value={player.gameSense} />
        <StatBar label="Utility" value={player.utility} />
        <StatBar label="Clutch" value={player.clutch} />
        <StatBar label="Movement" value={player.movement} />
      </div>

      {/* fame */}
      <div className="shrink-0">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Fama
          </span>
          <span className="text-xs font-bold text-primary">
            {player.fameLevel}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-border/70">
          <div
            className="animate-bar-grow h-full rounded-full bg-gradient-to-r from-amber-500 to-primary transition-[width] duration-500"
            style={{ width: `${player.fame}%` }}
          />
        </div>
        {nextFame && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {nextFame.min - player.fame} pts para {nextFame.label}
          </p>
        )}
      </div>

      {/* career counters */}
      <div className="grid shrink-0 grid-cols-3 gap-1.5">
        {(
          [
            {
              label: "Rounds",
              value: player.career.roundsPlayed,
              grouped: true,
              icon: Layers,
              chip: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
              valueClass: "text-cyan-300",
            },
            {
              label: "Kills",
              value: player.career.kills,
              grouped: true,
              icon: Crosshair,
              chip: "border-rose-500/40 bg-rose-500/15 text-rose-300",
              valueClass: "text-rose-300",
            },
            {
              label: "Clutches",
              value: clutches,
              icon: Swords,
              chip: "border-violet-500/40 bg-violet-500/15 text-violet-300",
              valueClass: "text-violet-300",
            },
            {
              label: "Aces",
              value: player.aces,
              icon: Star,
              chip: "border-amber-500/40 bg-amber-500/15 text-amber-300",
              valueClass: "text-amber-300",
            },
            {
              label: "Trofeos",
              value: player.trophies,
              icon: Trophy,
              chip: "border-yellow-500/40 bg-yellow-500/15 text-yellow-300",
              valueClass: "text-yellow-300",
            },
            {
              label: "Majors",
              value: player.majors,
              icon: Award,
              chip: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
              valueClass: "text-emerald-300",
            },
          ] satisfies CareerKpi[]
        ).map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-md border border-border/60 bg-background/50 px-1.5 py-1.5 text-center"
            >
              <div
                className={cn(
                  "mx-auto mb-1 flex size-6 items-center justify-center rounded-md border",
                  stat.chip,
                )}
              >
                <Icon className="size-3" aria-hidden />
              </div>
              <AnimatedNumber
                value={stat.value}
                grouped={stat.grouped}
                className={cn("text-base font-bold", stat.valueClass)}
              />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* map pool — always visible, fills leftover sidebar space */}
      <MapPoolPanel
        mapStats={player.mapStats}
        sidebar
        className="min-h-0 flex-1"
      />

      {/* money + meta */}
      <div className="mt-auto shrink-0 space-y-1.5">
        <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/50 px-2.5 py-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Sueldo
            </p>
            <p className="text-sm font-bold text-primary">
              {money(player.salaryMonthly)}
              <span className="text-[11px] font-normal text-muted-foreground">
                /mes
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Ganado
            </p>
            <p className="text-sm font-bold">{money(player.earnings)}</p>
          </div>
        </div>

        {archetype && (
          <p className="truncate text-[11px] text-muted-foreground">
            <span className="font-bold text-foreground">{archetype.label}</span>{" "}
            · {player.hltvTop20 ? `HLTV #${player.hltvTop20}` : player.nationalTeamStatus}
          </p>
        )}

        {player.graffiti.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {player.graffiti.slice(-4).map((graffiti) => (
              <span
                key={graffiti.id}
                title={`${graffiti.name} — ${graffiti.reason}`}
                className="animate-fade-up rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  color: graffiti.color,
                  backgroundColor: `${graffiti.color}22`,
                  border: `1px solid ${graffiti.color}55`,
                }}
              >
                {graffiti.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
