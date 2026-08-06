"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HoldGameProps = {
  /** Seconds the crosshair must stay inside the zone. */
  holdSeconds?: number;
  zoneSize?: number;
  onComplete: (success: boolean) => void;
};

/**
 * Crosshair hold: keep the reticle inside a drifting angle until the bar fills.
 */
export function HoldGame({
  holdSeconds = 2.4,
  zoneSize = 18,
  onComplete,
}: HoldGameProps) {
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const [zone, setZone] = useState({ x: 42, y: 40 });
  const [inside, setInside] = useState(false);
  const finished = useRef(false);
  const insideRef = useRef(false);

  useEffect(() => {
    if (!started || finished.current) return;
    const drift = window.setInterval(() => {
      setZone((current) => ({
        x: Math.min(78, Math.max(8, current.x + (Math.random() - 0.5) * 6)),
        y: Math.min(72, Math.max(8, current.y + (Math.random() - 0.5) * 5)),
      }));
    }, 420);
    return () => window.clearInterval(drift);
  }, [started]);

  useEffect(() => {
    if (!started || finished.current) return;
    const tick = window.setInterval(() => {
      setProgress((current) => {
        const next = insideRef.current
          ? current + 100 / (holdSeconds * 20)
          : Math.max(0, current - 35 / (holdSeconds * 20));
        if (next >= 100 && !finished.current) {
          finished.current = true;
          window.setTimeout(() => onComplete(true), 280);
          return 100;
        }
        return next;
      });
    }, 50);
    return () => window.clearInterval(tick);
  }, [holdSeconds, onComplete, started]);

  const move = (clientX: number, clientY: number, el: HTMLDivElement) => {
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setCursor({ x, y });
    const half = zoneSize / 2;
    const hit =
      x >= zone.x - half &&
      x <= zone.x + half &&
      y >= zone.y - half &&
      y <= zone.y + half;
    insideRef.current = hit;
    setInside(hit);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Hold de crosshair</span>
        <span className="tabular-nums">{Math.min(100, Math.round(progress))}%</span>
      </div>

      {!started ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-card p-4">
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Mantené la mira dentro del ángulo. Si salís, la barra baja.
          </p>
          <Button size="lg" onClick={() => setStarted(true)}>
            Empezar hold
          </Button>
        </div>
      ) : (
        <div
          className="relative min-h-0 flex-1 cursor-none overflow-hidden rounded-lg border border-border/60 bg-[#0a1018]"
          onPointerMove={(event) => move(event.clientX, event.clientY, event.currentTarget)}
          onPointerLeave={() => {
            insideRef.current = false;
            setInside(false);
          }}
        >
          <div
            className={cn(
              "absolute rounded-full border-2 transition-colors",
              inside ? "border-primary bg-primary/20" : "border-amber-400/70 bg-amber-400/10",
            )}
            style={{
              width: `${zoneSize}%`,
              height: `${zoneSize * 1.1}%`,
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
          >
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white" />
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white" />
            <div className="absolute inset-[7px] rounded-full border border-white/80" />
          </div>
          <div className="absolute inset-x-3 bottom-3 h-2 overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
