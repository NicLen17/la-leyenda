"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ShotResultPips,
  type ShotResult,
} from "@/components/minigames/shot-result";
import { Button } from "@/components/ui/button";
import {
  playBombDefused,
  playBombPlanted,
  playGunshot,
  playReady,
  playSoftFail,
} from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";

type RetakeGameProps = {
  targets?: number;
  seconds?: number;
  onComplete: (success: boolean) => void;
};

type Spot = {
  id: number;
  x: number;
  y: number;
  cleared: boolean;
};

function makeSpots(count: number): Spot[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: 12 + Math.random() * 76,
    y: 14 + Math.random() * 64,
    cleared: false,
  }));
}

/** Clear site angles in order before the bomb timer runs out — click only. */
export function RetakeGame({
  targets = 4,
  seconds = 7.5,
  onComplete,
}: RetakeGameProps) {
  const [started, setStarted] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [nextId, setNextId] = useState(0);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [results, setResults] = useState<Array<ShotResult | null>>([]);
  const [ended, setEnded] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    if (!started || finished.current) return;
    const startedAt = Date.now();
    const tick = window.setInterval(() => {
      const left = seconds - (Date.now() - startedAt) / 1000;
      setTimeLeft(Math.max(0, left));
      if (left <= 0 && !finished.current) {
        finished.current = true;
        setEnded(true);
        window.clearInterval(tick);
        window.setTimeout(() => onComplete(false), 250);
      }
    }, 40);
    return () => window.clearInterval(tick);
  }, [onComplete, seconds, started]);

  const begin = () => {
    setSpots(makeSpots(targets));
    setNextId(0);
    setTimeLeft(seconds);
    setResults(Array.from({ length: targets }, () => null));
    finished.current = false;
    setEnded(false);
    setStarted(true);
    playReady();
    playBombPlanted();
  };

  const markHit = useCallback(
    (id: number) => {
      if (finished.current) return;

      setResults((current) => {
        const next = [...current];
        if (id < next.length) next[id] = "hit";
        return next;
      });
      setSpots((current) =>
        current.map((spot) =>
          spot.id === id ? { ...spot, cleared: true } : spot,
        ),
      );

      const following = id + 1;
      if (following >= targets) {
        finished.current = true;
        setEnded(true);
        playBombDefused();
        window.setTimeout(() => onComplete(true), 280);
        return;
      }
      setNextId(following);
    },
    [onComplete, targets],
  );

  const markMiss = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setEnded(true);
    playSoftFail({ volume: 0.4 });
    setResults((current) => {
      const next = [...current];
      if (nextId < next.length) next[nextId] = "miss";
      return next;
    });
    window.setTimeout(() => onComplete(false), 350);
  }, [nextId, onComplete]);

  const clearTap = (id: number) => {
    if (finished.current || ended) return;

    if (id !== nextId) {
      markMiss();
      return;
    }

    playGunshot();
    markHit(id);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Retake clear</span>
        <div className="flex items-center gap-2">
          {started && <ShotResultPips results={results} />}
          {started && (
            <span className="tabular-nums text-destructive">
              {timeLeft.toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      <p className="rounded-md border border-border/50 bg-card/50 px-3 py-1.5 text-center text-xs text-muted-foreground">
        Limpiá los{" "}
        <span className="font-semibold text-foreground">{targets}</span> ángulos
        en orden (1 → {targets}). Click en el correcto; timer o ángulo mal =
        termina.
      </p>

      {!started ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-card p-4">
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Clear del site a contrarreloj. Tocá los ángulos en orden.
          </p>
          <Button size="lg" onClick={begin}>
            Empezar retake
          </Button>
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-border/60 bg-[#0c121a]">
          {spots.map((spot) => (
            <button
              key={spot.id}
              type="button"
              disabled={spot.cleared || ended}
              onClick={() => clearTap(spot.id)}
              className={cn(
                "absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border text-sm font-black transition",
                spot.cleared
                  ? "border-primary/40 bg-primary/20 text-primary opacity-40"
                  : spot.id === nextId
                    ? "animate-pulse border-amber-400 bg-amber-400/25 text-amber-100"
                    : "border-border/50 bg-card/40 text-muted-foreground opacity-70 hover:border-destructive/50",
              )}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              {spot.id + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
