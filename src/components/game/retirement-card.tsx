"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { RankBadges } from "@/components/art/rank-badge";
import { AnimatedNumber } from "@/components/game/animated-number";
import { MapPoolPanel } from "@/components/game/map-pool-panel";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/data/archetypes";
import { cn } from "@/lib/utils";
import type { CareerResult } from "@/lib/types/game";

type RetirementCardProps = {
  result: CareerResult;
  onPlayAgain: () => void;
  className?: string;
};

export function RetirementCard({
  result,
  onPlayAgain,
  className,
}: RetirementCardProps) {
  const [copied, setCopied] = useState(false);

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
        "flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-xl border border-border/70 bg-card/60 p-5",
        className,
      )}
    >
      <header className="flex shrink-0 items-center justify-center gap-3 text-center">
        <RankBadges premierRating={result.premierRating} size="md" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Fin de la carrera · {result.yearsPlayed} años en el circuito
          </p>
          <h2 className="text-3xl font-black uppercase leading-none tracking-tight">
            {result.nickname}
          </h2>
          <p className="text-xs text-muted-foreground">
            {ROLE_LABELS[result.role]} · {result.nationality} ·{" "}
            {result.fameLevel}
          </p>
          <p className="text-[11px] font-bold text-primary">
            Premier {result.premierRating.toLocaleString("es-AR")} · peak{" "}
            {result.peakPremierRating.toLocaleString("es-AR")} · {result.ogLabel}
          </p>
        </div>
      </header>

      <div className="grid shrink-0 grid-cols-4 gap-1.5">
        {[
          { label: "Rating final", value: result.finalRating, decimals: 2 },
          { label: "Peak", value: result.peakRating, decimals: 2 },
          { label: "K/D", value: result.kd, decimals: 2 },
          { label: "ADR", value: result.adr },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border/60 bg-background/50 px-2 py-1.5 text-center"
          >
            <AnimatedNumber
              value={stat.value}
              decimals={stat.decimals ?? 0}
              className="text-lg font-black"
            />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-1.5">
        {[
          { label: "Majors", value: result.majors },
          { label: "Trofeos", value: result.trophies },
          { label: "Aces", value: result.aces },
          { label: "Clutches", value: result.clutchesWon },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border/60 bg-background/50 px-2 py-1.5 text-center"
          >
            <AnimatedNumber value={stat.value} className="text-base font-bold" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-1.5 text-center">
        <div className="rounded-md border border-border/60 bg-background/50 px-2 py-1.5">
          <AnimatedNumber
            value={result.totalKills}
            grouped
            className="text-base font-bold"
          />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Kills · {result.roundsPlayed.toLocaleString("es-AR")} rounds
          </p>
        </div>
        <div className="rounded-md border border-border/60 bg-background/50 px-2 py-1.5">
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
        <div className="rounded-md border border-border/60 bg-background/50 px-2 py-1.5">
          <p className="text-base font-bold">
            {result.hltvTop20 ? `#${result.hltvTop20}` : "—"}
          </p>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            HLTV Top 20
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        <div className="animate-card-in rounded-lg border border-primary/40 bg-primary/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Te comparan con {result.legendName}
          </p>
          <p className="text-sm leading-snug">{result.legendComparison}</p>
        </div>

        <div className="text-[11px] text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Equipos:</span>{" "}
            {result.teamsPlayed.join(" → ")}
          </p>
          <p>
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
          <MapPoolPanel mapStats={result.mapStats} compact />
        )}
      </div>

      <div className="shrink-0 space-y-2">
        <div className="rounded-lg border border-border/60 bg-background/50 py-2 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Score de carrera
          </p>
          <AnimatedNumber
            value={result.score}
            durationMs={1400}
            className="text-3xl font-black text-primary"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={share} variant="secondary" className="flex-1" size="sm">
            {copied ? "Copiado" : "Compartir"}
          </Button>
          <Link
            href="/ranking"
            className="inline-flex flex-1 items-center justify-center rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Ranking
          </Link>
          <Button onClick={onPlayAgain} className="flex-1" size="sm">
            Otra carrera
          </Button>
        </div>
      </div>
    </section>
  );
}
