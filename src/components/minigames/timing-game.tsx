"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  playBombDefused,
  playBombPlanted,
  playReady,
  playSoftFail,
  playUtilitySuccess,
} from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";

type TimingGameProps = {
  mode: "defuse" | "plant";
  onComplete: (success: boolean) => void;
};

/** Shared pacing for all timing-bar minigames — keep them fair and consistent. */
const TIMING_BASE_SPEED = 0.28;
const TIMING_ACCEL = 0.06;

const CONFIG = {
  defuse: {
    title: "Defuse a contrarreloj",
    hint: "Cinco cables. Ritmo calmado: soltá en la zona verde. Se acelera poco a poco.",
    winRule: "Cortá los 5 cables en la zona. Un fallo y la bomba explota.",
    rounds: 5,
    zone: 28,
    speed: TIMING_BASE_SPEED,
    accelerate: TIMING_ACCEL,
    action: "Cortar el cable",
  },
  plant: {
    title: "Plant timing",
    hint: "Plantá en la ventana segura: ni muy temprano (te peekean) ni tarde.",
    winRule: "Plantá una sola vez dentro de la zona verde para ganar.",
    rounds: 1,
    zone: 26,
    speed: TIMING_BASE_SPEED,
    accelerate: 0,
    action: "Plantar",
  },
} as const;

export function TimingGame({ mode, onComplete }: TimingGameProps) {
  const config = CONFIG[mode];
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState(0);
  const [round, setRound] = useState(0);
  const [zoneStart, setZoneStart] = useState(42);
  const [zoneWidth, setZoneWidth] = useState<number>(config.zone);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);
  const direction = useRef(1);
  const speed = useRef(config.speed);
  const running = useRef(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    running.current = true;

    const loop = () => {
      if (!running.current) return;
      setPosition((current) => {
        let next = current + direction.current * speed.current;
        if (next >= 100) {
          next = 100;
          direction.current = -1;
        } else if (next <= 0) {
          next = 0;
          direction.current = 1;
        }
        return next;
      });
      frame.current = requestAnimationFrame(loop);
    };

    frame.current = requestAnimationFrame(loop);
    return () => {
      running.current = false;
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [started]);

  const begin = () => {
    speed.current = config.speed;
    setZoneWidth(config.zone);
    setZoneStart(20 + Math.random() * (70 - config.zone));
    setRound(0);
    setStarted(true);
    playReady();
    if (mode === "defuse") {
      playBombPlanted();
    }
  };

  const stop = () => {
    if (!started || feedback) return;
    const hit = position >= zoneStart && position <= zoneStart + zoneWidth;
    setFeedback(hit ? "hit" : "miss");

    if (hit) {
      playUtilitySuccess({ volume: 0.92 });
    } else {
      playSoftFail({ volume: 0.4 });
    }

    if (!hit) {
      running.current = false;
      window.setTimeout(() => onComplete(false), 700);
      return;
    }

    const nextRound = round + 1;
    if (nextRound >= config.rounds) {
      running.current = false;
      if (mode === "defuse") playBombDefused();
      if (mode === "plant") playBombPlanted();
      window.setTimeout(() => onComplete(true), 700);
      return;
    }

    setRound(nextRound);
    speed.current += config.accelerate;
    // Defuse: zone tightens only slightly — stay fair across all cables.
    const nextZone =
      mode === "defuse"
        ? Math.max(18, config.zone - nextRound * 1.5)
        : config.zone;
    setZoneWidth(nextZone);
    setZoneStart(15 + Math.random() * (70 - nextZone));
    window.setTimeout(() => setFeedback(null), 220);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{config.title}</span>
        {config.rounds > 1 && (
          <span className="tabular-nums">
            {round + (started ? 1 : 0)}/{config.rounds}{" "}
            {mode === "defuse" ? "cables" : "balas"}
          </span>
        )}
      </div>

      <p className="rounded-md border border-border/50 bg-card/50 px-3 py-1.5 text-center text-xs text-muted-foreground">
        {config.winRule}
      </p>

      <div className="relative flex flex-1 flex-col justify-center gap-4 rounded-lg border border-border/60 bg-card p-4">
        <p className="text-center text-xs text-muted-foreground">{config.hint}</p>

        <div className="relative h-11 overflow-hidden rounded-md border border-border bg-[#0d1219]">
          <div
            className={cn(
              "absolute inset-y-0 border-x-2 transition-colors",
              feedback === "hit"
                ? "border-primary bg-primary/45"
                : feedback === "miss"
                  ? "border-destructive bg-destructive/40"
                  : "border-primary/70 bg-primary/25",
            )}
            style={{ left: `${zoneStart}%`, width: `${zoneWidth}%` }}
          />
          <div
            className="absolute inset-y-0 w-[3px] bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ left: `${position}%` }}
          />
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              className="absolute inset-y-0 w-px bg-border/50"
              style={{ left: `${i * 10}%` }}
            />
          ))}
        </div>

        {started ? (
          <Button onClick={stop} className="w-full" size="lg">
            {config.action}
          </Button>
        ) : (
          <Button onClick={begin} className="w-full" size="lg" variant="secondary">
            Empezar
          </Button>
        )}
      </div>
    </div>
  );
}
