"use client";

import { RankBadges } from "@/components/art/rank-badge";
import { TeamLogo } from "@/components/art/team-logo";
import { AnimatedNumber } from "@/components/game/animated-number";
import { MapPoolPanel } from "@/components/game/map-pool-panel";
import { StatBar } from "@/components/game/stat-bar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/data/archetypes";
import { getArchetypeById } from "@/lib/data/archetypes";
import { getNextFameLevel } from "@/lib/game/progression";
import { getOgRank } from "@/lib/game/ranks";
import { adrOf, hsPercentOf, kastOf, totalClutches } from "@/lib/game/simulator";
import { cn } from "@/lib/utils";
import type { PlayerState } from "@/lib/types/game";

type PlayerCardProps = {
  player: PlayerState;
  className?: string;
};

function money(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value}`;
}

export function PlayerCard({ player, className }: PlayerCardProps) {
  const archetype = player.archetypeId
    ? getArchetypeById(player.archetypeId)
    : null;
  const nextFame = getNextFameLevel(player.fame);
  const og = getOgRank(player.premierRating);
  const clutches = totalClutches(player.career.clutches);
  const kd =
    player.career.deaths > 0
      ? player.career.kills / player.career.deaths
      : player.career.kills;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col gap-2 overflow-hidden rounded-xl border border-border/70 bg-card/80 p-3",
        className,
      )}
    >
      {/* identity */}
      <header className="flex items-center gap-2">
        <TeamLogo team={player.team} size={40} animate key={player.team.id} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-base font-black uppercase leading-none tracking-tight">
              {player.nickname}
            </h2>
            <Badge variant="outline" className="h-4 px-1 text-[9px] font-bold">
              {ROLE_LABELS[player.role]}
            </Badge>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">
            {player.team.name} · Tier {player.team.tier} · {player.nationality}
          </p>
          <p className="truncate text-[9px] text-muted-foreground">
            Peak Premier {player.peakPremierRating.toLocaleString("es-AR")} ·{" "}
            {og.label}
          </p>
        </div>
        <RankBadges premierRating={player.premierRating} size="sm" />
      </header>

      <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/50 px-2 py-1">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Rating 2.1
          </p>
          <AnimatedNumber
            value={player.rating}
            decimals={2}
            className={cn(
              "text-lg font-black leading-none",
              player.rating >= 1.1
                ? "text-primary"
                : player.rating < 0.95
                  ? "text-destructive"
                  : "",
            )}
          />
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Premier CS
          </p>
          <AnimatedNumber
            value={player.premierRating}
            grouped
            className="text-lg font-black leading-none text-primary"
          />
        </div>
      </div>

      {player.benched && (
        <div className="rounded-md border border-destructive/50 bg-destructive/15 px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-destructive">
          En el banco · sin minutos
        </div>
      )}

      {/* headline scoreboard */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "K/D", value: kd, decimals: 2 },
          { label: "ADR", value: adrOf(player.career), decimals: 0 },
          { label: "KAST", value: kastOf(player.career), decimals: 0, suffix: "%" },
          { label: "HS", value: hsPercentOf(player.career), decimals: 0, suffix: "%" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border/60 bg-background/50 px-1.5 py-1 text-center"
          >
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <AnimatedNumber
              value={stat.value}
              decimals={stat.decimals}
              suffix={stat.suffix}
              className="text-sm font-bold"
            />
          </div>
        ))}
      </div>

      {/* attributes */}
      <div className="min-h-0 space-y-0.5 overflow-hidden">
        <StatBar label="Aim" value={player.aim} />
        <StatBar label="Reflejos" value={player.reflexes} />
        <StatBar label="Game sense" value={player.gameSense} />
        <StatBar label="Utility" value={player.utility} />
        <StatBar label="Clutch" value={player.clutch} />
        <StatBar label="Movement" value={player.movement} />
      </div>

      {/* fame */}
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Fama
          </span>
          <span className="text-[11px] font-bold text-primary">
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
          <p className="mt-0.5 text-[9px] text-muted-foreground">
            {nextFame.min - player.fame} pts para {nextFame.label}
          </p>
        )}
      </div>

      {/* career counters */}
      <div className="grid grid-cols-3 gap-1.5 text-center">
        {[
          { label: "Rounds", value: player.career.roundsPlayed, grouped: true },
          { label: "Kills", value: player.career.kills, grouped: true },
          { label: "Clutches", value: clutches },
          { label: "Aces", value: player.aces },
          { label: "Trofeos", value: player.trophies },
          { label: "Majors", value: player.majors },
        ].map((stat) => (
          <div key={stat.label}>
            <AnimatedNumber
              value={stat.value}
              grouped={stat.grouped}
              className="text-sm font-bold"
            />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* money + maps + meta */}
      <div className="mt-auto space-y-1.5">
        <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/50 px-2 py-1.5">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Sueldo
            </p>
            <p className="text-xs font-bold text-primary">
              {money(player.salaryMonthly)}
              <span className="text-[10px] font-normal text-muted-foreground">
                /mes
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              Ganado
            </p>
            <p className="text-xs font-bold">{money(player.earnings)}</p>
          </div>
        </div>

        <MapPoolPanel mapStats={player.mapStats} compact />

        {archetype && (
          <p className="truncate text-[10px] text-muted-foreground">
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
                className="animate-fade-up rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
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
