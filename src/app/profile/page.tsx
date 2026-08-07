"use client";

import { useMemo } from "react";

import { AnimatedNumber } from "@/components/game/animated-number";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ROLE_LABELS } from "@/lib/data/archetypes";
import { useLocalCareers } from "@/lib/hooks/use-local-careers";

export default function ProfilePage() {
  const careers = useLocalCareers();

  const stats = useMemo(
    () => ({
      total: careers.length,
      bestScore: careers.reduce((max, career) => Math.max(max, career.score), 0),
      bestRating: careers.reduce(
        (max, career) => Math.max(max, career.finalRating),
        0,
      ),
      majors: careers.reduce((sum, career) => sum + career.majors, 0),
      aces: careers.reduce((sum, career) => sum + career.aces, 0),
      earnings: careers.reduce((sum, career) => sum + career.earnings, 0),
    }),
    [careers],
  );

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3 sm:p-4">
      <header className="shrink-0">
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Tu vitrina
        </h1>
        <p className="text-xs text-muted-foreground">
          Carreras guardadas en este navegador.
        </p>
      </header>

      <div className="grid shrink-0 grid-cols-3 gap-2 sm:grid-cols-6">
        {[
          { label: "Carreras", value: stats.total },
          { label: "Best score", value: stats.bestScore },
          { label: "Best rating", value: stats.bestRating, decimals: 2 },
          { label: "Majors", value: stats.majors },
          { label: "Aces", value: stats.aces },
          { label: "Ganado", value: stats.earnings, prefix: "$", grouped: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border/60 bg-card/40 p-2 text-center"
          >
            <AnimatedNumber
              value={stat.value}
              decimals={stat.decimals ?? 0}
              prefix={stat.prefix}
              grouped={stat.grouped}
              className="text-base font-black"
            />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {careers.length === 0 ? (
        <Empty className="flex-1 border border-border/50">
          <EmptyHeader>
            <EmptyTitle>Sin carreras guardadas</EmptyTitle>
            <EmptyDescription>
              Terminá una carrera para llenar tu vitrina.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {careers.map((career) => (
            <article
              key={`${career.savedAt}-${career.nickname}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-bold">{career.nickname}</p>
                  <Badge variant="outline" className="h-4 px-1 text-[9px]">
                    {ROLE_LABELS[career.role]}
                  </Badge>
                  {career.isDaily && (
                    <Badge className="h-4 px-1 text-[9px]">Daily</Badge>
                  )}
                </div>
                <p className="text-[11px] tabular-nums text-muted-foreground">
                  Rating {career.finalRating.toFixed(2)} · K/D{" "}
                  {career.kd.toFixed(2)} · {career.majors} majors ·{" "}
                  {career.trophies} trofeos · {career.aces} aces
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  Comparado con {career.legendName}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 font-mono">
                {career.score} pts
              </Badge>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
