"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FlickGameProps = {
  /** Targets the player must hit to pass. */
  required?: number;
  totalTargets?: number;
  msPerTarget?: number;
  onComplete: (success: boolean) => void;
};

type Target = { id: number; x: number; y: number; size: number };

function makeTarget(id: number, difficulty: number): Target {
  const size = Math.max(30, 62 - difficulty * 5);
  return {
    id,
    x: 6 + Math.random() * 82,
    y: 8 + Math.random() * 76,
    size,
  };
}

export function FlickGame({
  required = 4,
  totalTargets = 6,
  msPerTarget = 900,
  onComplete,
}: FlickGameProps) {
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [index, setIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [missFlash, setMissFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState(msPerTarget);
  const finished = useRef(false);

  const advance = useCallback(
    (didHit: boolean) => {
      setHits((current) => {
        const nextHits = current + (didHit ? 1 : 0);
        const nextIndex = index + 1;

        if (nextIndex >= totalTargets) {
          if (!finished.current) {
            finished.current = true;
            window.setTimeout(() => onComplete(nextHits >= required), 420);
          }
          setTarget(null);
        } else {
          setTarget(makeTarget(nextIndex, nextIndex));
          setTimeLeft(msPerTarget);
        }
        setIndex(nextIndex);
        return nextHits;
      });
    },
    [index, msPerTarget, onComplete, required, totalTargets],
  );

  useEffect(() => {
    if (!started || !target || finished.current) return;
    const startedAt = Date.now();
    const tick = window.setInterval(() => {
      const remaining = msPerTarget - (Date.now() - startedAt);
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        window.clearInterval(tick);
        setMissFlash(true);
        window.setTimeout(() => setMissFlash(false), 140);
        advance(false);
      }
    }, 40);
    return () => window.clearInterval(tick);
  }, [advance, msPerTarget, started, target]);

  const begin = () => {
    setStarted(true);
    setTarget(makeTarget(0, 0));
    setTimeLeft(msPerTarget);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Aim / Flick</span>
        <span className="tabular-nums">
          {hits}/{required} · objetivo {Math.min(index + 1, totalTargets)}/{totalTargets}
        </span>
      </div>

      <div
        className={cn(
          "relative flex-1 overflow-hidden rounded-lg border border-border/60 bg-[#10161d]",
          missFlash && "border-destructive/70",
        )}
        style={{
          backgroundImage:
            "linear-gradient(0deg,rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        onClick={() => {
          if (started && target) {
            setMissFlash(true);
            window.setTimeout(() => setMissFlash(false), 140);
            advance(false);
          }
        }}
      >
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              Seis objetivos, menos de un segundo cada uno. Necesitás {required}{" "}
              impactos para ganar el duelo.
            </p>
            <Button size="sm" onClick={begin}>
              Empezar
            </Button>
          </div>
        )}

        {target && (
          <button
            type="button"
            aria-label="Objetivo"
            className="absolute rounded-full border-2 border-primary bg-primary/20 transition-transform duration-100 hover:scale-105 active:scale-95"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: target.size,
              height: target.size,
              transform: "translate(-50%, -50%)",
            }}
            onClick={(event) => {
              event.stopPropagation();
              advance(true);
            }}
          >
            <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </button>
        )}

        {started && target && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-border">
            <div
              className="h-full bg-primary transition-[width] duration-75 ease-linear"
              style={{ width: `${(timeLeft / msPerTarget) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
