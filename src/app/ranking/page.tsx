"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS } from "@/lib/data/archetypes";
import { getLocalDailyLeaderboard, type StoredCareer } from "@/lib/game/storage";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchDailyRankings, type RankingRow } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types/game";

function localToRows(careers: StoredCareer[]): RankingRow[] {
  return careers.map((career, index) => ({
    id: `local-${index}`,
    score: career.score,
    nickname: career.nickname,
    role: career.role,
    final_rating: career.finalRating,
    trophies: career.trophies,
    majors: career.majors,
    legend_comparison: career.legendComparison,
  }));
}

export default function RankingPage() {
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "local">("local");

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isSupabaseConfigured()) {
        const remote = await fetchDailyRankings();
        if (remote.length > 0) {
          setRows(remote);
          setSource("supabase");
          setLoading(false);
          return;
        }
      }
      setRows(localToRows(getLocalDailyLeaderboard()));
      setSource("local");
      setLoading(false);
    }
    void load();
  }, []);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3 p-4">
      <header className="shrink-0">
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Ranking del día
        </h1>
        <p className="text-xs text-muted-foreground">
          Todos juegan la misma carrera. Fuente:{" "}
          {source === "supabase" ? "Supabase" : "local (este navegador)"}
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-14 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Empty className="flex-1 border border-border/50">
          <EmptyHeader>
            <EmptyTitle>No hay carreras todavía</EmptyTitle>
            <EmptyDescription>
              Jugá la del día y tu score aparece acá.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {rows.map((row, index) => (
            <article
              key={row.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border bg-card/40 p-2.5",
                index === 0 ? "border-primary/60" : "border-border/60",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "w-8 shrink-0 text-center font-mono text-lg font-black",
                    index === 0 ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  #{index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{row.nickname}</p>
                  <p className="truncate text-[11px] tabular-nums text-muted-foreground">
                    {ROLE_LABELS[row.role as Role] ?? row.role} · Rating{" "}
                    {row.final_rating.toFixed(2)} · {row.trophies} trofeos ·{" "}
                    {row.majors} majors
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="shrink-0 font-mono">
                {row.score} pts
              </Badge>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
