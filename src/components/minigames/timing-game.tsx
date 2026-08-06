"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TimingGameProps = {
  /** "spray" needs three consecutive hits, "defuse" is a single precise stop. */
  mode: "spray" | "defuse";
  onComplete: (success: boolean) => void;
};

const CONFIG = {
  spray: {
    title: "Control de spray",
    hint: "Tres balas seguidas dentro de la zona. El patrón se acelera.",
    rounds: 3,
    zone: 17,
    speed: 1.5,
    accelerate: 0.45,
  },
  defuse: {
    title: "Defuse a contrarreloj",
    hint: "Soltá el cable exactamente en la zona verde. Una sola oportunidad.",
    rounds: 1,
    zone: 12,
    speed: 2.1,
    accelerate: 0,
  },
} as const;

export function TimingGame({ mode, onComplete }: TimingGameProps) {
  const config = CONFIG[mode];
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState(0);
  const [round, setRound] = useState(0);
  const [zoneStart, setZoneStart] = useState(42);
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
    setZoneStart(20 + Math.random() * 55);
    setRound(0);
    setStarted(true);
  };

  const stop = () => {
    if (!started) return;
    const hit = position >= zoneStart && position <= zoneStart + config.zone;
    setFeedback(hit ? "hit" : "miss");

    if (!hit) {
      running.current = false;
      window.setTimeout(() => onComplete(false), 700);
      return;
    }

    const nextRound = round + 1;
    if (nextRound >= config.rounds) {
      running.current = false;
      window.setTimeout(() => onComplete(true), 700);
      return;
    }

    setRound(nextRound);
    speed.current += config.accelerate;
    setZoneStart(15 + Math.random() * 62);
    window.setTimeout(() => setFeedback(null), 220);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{config.title}</span>
        {config.rounds > 1 && (
          <span className="tabular-nums">
            {round}/{config.rounds} balas
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4 rounded-lg border border-border/60 bg-card p-4">
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
            style={{ left: `${zoneStart}%`, width: `${config.zone}%` }}
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
            {mode === "defuse" ? "Cortar el cable" : "Disparar"}
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
