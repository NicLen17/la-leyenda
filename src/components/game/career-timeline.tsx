"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SeasonSummary } from "@/lib/types/game";

type CareerTimelineProps = {
  log: SeasonSummary[];
};

export function CareerTimeline({ log }: CareerTimelineProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-9 gap-1.5 border border-border/70 px-3 text-xs font-bold"
        onClick={() => setOpen(true)}
      >
        Ver carrera
      </Button>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Timeline de carrera</DialogTitle>
        </DialogHeader>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no cerraste ningún split.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {log.map((season) => (
              <div
                key={`${season.year}-${season.split}`}
                className="rounded-lg border border-border/50 bg-card/40 p-2.5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-bold">
                    {season.year} · S{((season.split - 1) % 2) + 1} ·{" "}
                    {season.teamName}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] font-bold",
                      season.placement === "CAMPEÓN"
                        ? "text-primary"
                        : season.benched
                          ? "text-destructive"
                          : "text-muted-foreground",
                    )}
                  >
                    {season.placement}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {season.tournamentName}
                </p>
                <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
                  Rating {season.rating.toFixed(2)} · ADR {season.adr} ·{" "}
                  {season.kills}/{season.deaths} · {season.roundsPlayed} rounds ·{" "}
                  {season.aces} aces · {season.clutchesWon} clutches
                </p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
