"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TimingGameProps = {
  /** Timing bar variants used by spray / utility / bomb actions. */
  mode: "spray" | "defuse" | "smoke" | "plant";
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
    action: "Disparar",
  },
  defuse: {
    title: "Defuse a contrarreloj",
    hint: "Cinco cables. Empieza lento y se acelera en cada etapa. Soltá en la zona verde.",
    rounds: 5,
    zone: 18,
    speed: 0.85,
    accelerate: 0.38,
    action: "Cortar el cable",
  },
  smoke: {
    title: "Lineup de smoke",
    hint: "Soltá la smoke en el pixel exacto del lineup. Dos intentos.",
    rounds: 2,
    zone: 11,
    speed: 1.85,
    accelerate: 0.25,
    action: "Tirar smoke",
  },
  plant: {
    title: "Plant timing",
    hint: "Plantá en la ventana segura: ni muy temprano (te peekean) ni tarde.",
    rounds: 1,
    zone: 14,
    speed: 2.0,
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
  };

  const stop = () => {
    if (!started) return;
    const hit = position >= zoneStart && position <= zoneStart + zoneWidth;
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
    // Defuse: zone tightens slightly each cable as speed ramps up.
    const nextZone =
      mode === "defuse"
        ? Math.max(11, config.zone - nextRound * 1.4)
        : config.zone;
    setZoneWidth(nextZone);
    setZoneStart(15 + Math.random() * (70 - nextZone));
    window.setTimeout(() => setFeedback(null), 220);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{config.title}</span>
        {config.rounds > 1 && (
          <span className="tabular-nums">
            {round + (started ? 1 : 0)}/{config.rounds}{" "}
            {mode === "defuse" ? "cables" : "balas"}
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
