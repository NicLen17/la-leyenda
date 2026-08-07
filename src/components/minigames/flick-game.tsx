"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ShotResultPips,
  type ShotResult,
} from "@/components/minigames/shot-result";
import { Button } from "@/components/ui/button";
import { playGunshot, playReady, playSound } from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";

type FlickGameProps = {
  /** Targets the player must hit to pass. */
  required?: number;
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
  msPerTarget = 900,
  onComplete,
}: FlickGameProps) {
  const [started, setStarted] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Array<ShotResult | null>>(() =>
    Array.from({ length: required }, () => null),
  );
  const [missFlash, setMissFlash] = useState(false);
  const [timeLeft, setTimeLeft] = useState(msPerTarget);
  const finished = useRef(false);
  const hitsRef = useRef(0);

  const advance = useCallback(
    (didHit: boolean) => {
      if (finished.current) return;

      setResults((current) => {
        const next = [...current];
        const slot = next.findIndex((entry) => entry === null);
        if (slot >= 0) next[slot] = didHit ? "hit" : "miss";
        return next;
      });

      if (!didHit) {
        finished.current = true;
        setMissFlash(true);
        setTarget(null);
        window.setTimeout(() => onComplete(false), 420);
        return;
      }

      const nextHits = hitsRef.current + 1;
      hitsRef.current = nextHits;
      const nextIndex = index + 1;

      if (nextHits >= required) {
        finished.current = true;
        setTarget(null);
        window.setTimeout(() => onComplete(true), 420);
      } else {
        setTarget(makeTarget(nextIndex, nextIndex));
        setTimeLeft(msPerTarget);
      }
      setIndex(nextIndex);
    },
    [index, msPerTarget, onComplete, required],
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
    playReady();
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Aim / Flick</span>
        <ShotResultPips results={results} />
      </div>

      <p className="rounded-md border border-border/50 bg-card/50 px-3 py-1.5 text-center text-xs text-muted-foreground">
        Necesitás{" "}
        <span className="font-semibold text-foreground">{required}</span>{" "}
        impactos seguidos · un fallo y termina.
      </p>

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
            playSound("helmet", { volume: 0.28 });
            setMissFlash(true);
            window.setTimeout(() => setMissFlash(false), 140);
            advance(false);
          }
        }}
      >
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <p className="max-w-xs text-sm text-muted-foreground">
              {required} objetivos, menos de un segundo cada uno. Un miss y
              perdés.
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
              playGunshot();
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
