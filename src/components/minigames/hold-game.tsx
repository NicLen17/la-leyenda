"use client";

import { useEffect, useRef, useState } from "react";

import { CsCrosshairReticle } from "@/components/minigames/cs-crosshair";
import { Button } from "@/components/ui/button";
import { useCoarsePointer } from "@/lib/hooks/use-coarse-pointer";
import { playReady, playUtilitySuccess } from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";

type HoldGameProps = {
  /** Seconds the crosshair must stay inside the zone. */
  holdSeconds?: number;
  /** Zone width/height as % of the arena (smaller = harder). */
  zoneSize?: number;
  /** How fast the angle drifts, in arena % per second. */
  driftSpeed?: number;
  onComplete: (success: boolean) => void;
};

type Point = { x: number; y: number };

const ZONE_PAD = 8;
/** Lift the reticle above the finger so the zone stays visible on touch. */
const TOUCH_AIM_OFFSET_Y = 14;

function clampZone(value: number, size: number) {
  const half = size / 2;
  return Math.min(100 - ZONE_PAD - half, Math.max(ZONE_PAD + half, value));
}

function randomTarget(zoneSize: number): Point {
  return {
    x: clampZone(ZONE_PAD + Math.random() * (100 - ZONE_PAD * 2), zoneSize),
    y: clampZone(ZONE_PAD + Math.random() * (100 - ZONE_PAD * 2), zoneSize),
  };
}

/**
 * Crosshair hold: keep the reticle inside a smoothly drifting angle until
 * the bar fills. The zone seeks new waypoints continuously so it stays
 * readable and followable instead of jumping in discrete hops.
 */
export function HoldGame({
  holdSeconds = 2.6,
  zoneSize = 12,
  driftSpeed = 26,
  onComplete,
}: HoldGameProps) {
  const coarse = useCoarsePointer();
  const playZone = coarse ? Math.max(zoneSize, 14) : zoneSize;
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState<Point>({ x: 50, y: 50 });
  const [zone, setZone] = useState<Point>({ x: 50, y: 48 });
  const [inside, setInside] = useState(false);

  const finished = useRef(false);
  const insideRef = useRef(false);
  const cursorRef = useRef<Point>({ x: 50, y: 50 });
  const zoneRef = useRef<Point>({ x: 50, y: 48 });
  const targetRef = useRef<Point>(randomTarget(playZone));
  const progressRef = useRef(0);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const trackingRef = useRef(false);

  useEffect(() => {
    if (!started || finished.current) return;

    let raf = 0;
    let last = performance.now();
    let retargetAt = last + 700 + Math.random() * 900;

    const tick = (now: number) => {
      if (finished.current) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (now >= retargetAt) {
        targetRef.current = randomTarget(playZone);
        retargetAt = now + 650 + Math.random() * 1100;
      }

      const pos = zoneRef.current;
      const target = targetRef.current;
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.15) {
        // Ease toward the waypoint: faster when far, softer when close.
        const speed = driftSpeed * (0.55 + Math.min(1, dist / 28) * 0.7);
        const step = Math.min(dist, speed * dt);
        pos.x = clampZone(pos.x + (dx / dist) * step, playZone);
        pos.y = clampZone(pos.y + (dy / dist) * step, playZone);
        zoneRef.current = { x: pos.x, y: pos.y };
        setZone({ x: pos.x, y: pos.y });
      } else {
        targetRef.current = randomTarget(playZone);
      }

      const half = playZone / 2;
      const cur = cursorRef.current;
      const hit =
        cur.x >= pos.x - half &&
        cur.x <= pos.x + half &&
        cur.y >= pos.y - half &&
        cur.y <= pos.y + half;
      insideRef.current = hit;
      setInside(hit);

      const next = hit
        ? progressRef.current + (100 * dt) / holdSeconds
        : Math.max(0, progressRef.current - (48 * dt) / holdSeconds);
      progressRef.current = next;
      setProgress(next);

      if (next >= 100) {
        finished.current = true;
        progressRef.current = 100;
        setProgress(100);
        playUtilitySuccess({ volume: 0.92 });
        window.setTimeout(() => onComplete(true), 280);
        return;
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [driftSpeed, holdSeconds, onComplete, playZone, started]);

  const move = (clientX: number, clientY: number, isTouch: boolean) => {
    const el = arenaRef.current;
    if (!el || finished.current) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const offsetY = isTouch || coarse ? TOUCH_AIM_OFFSET_Y : 0;
    const next = {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(
        100,
        Math.max(0, ((clientY - rect.top) / rect.height) * 100 - offsetY),
      ),
    };
    cursorRef.current = next;
    setCursor(next);
  };

  const begin = () => {
    finished.current = false;
    progressRef.current = 0;
    const startZone = { x: 50, y: 48 };
    zoneRef.current = startZone;
    targetRef.current = randomTarget(playZone);
    cursorRef.current = { x: 50, y: 50 };
    insideRef.current = false;
    trackingRef.current = false;
    setZone(startZone);
    setCursor({ x: 50, y: 50 });
    setProgress(0);
    setInside(false);
    setStarted(true);
    playReady();
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 sm:gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-[12px]">
        <span>Hold de crosshair</span>
        <span className="tabular-nums">
          {Math.min(100, Math.round(progress))}%
        </span>
      </div>

      <p className="shrink-0 rounded-md border border-border/50 bg-card/50 px-3 py-1.5 text-center text-[11px] text-muted-foreground sm:text-xs">
        Seguí el ángulo con el{" "}
        {coarse ? "dedo" : "mouse"} unos{" "}
        <span className="font-semibold text-foreground">
          {holdSeconds.toFixed(1)} s
        </span>
        . Si salís, la barra baja.
        {coarse ? " La mira queda arriba del dedo." : null}
      </p>

      {!started ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-card p-4">
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            El ángulo se mueve suave: trackealo sin perderlo hasta llenar la
            barra.
          </p>
          <Button size="lg" onClick={begin}>
            Empezar hold
          </Button>
        </div>
      ) : (
        <div
          ref={arenaRef}
          className={cn(
            "relative min-h-[180px] flex-1 overflow-hidden rounded-lg border border-border/60 bg-[#0a1018] touch-none select-none",
            coarse ? "cursor-default" : "cursor-none",
          )}
          onPointerMove={(event) => {
            if (!trackingRef.current && event.pointerType === "mouse") {
              move(event.clientX, event.clientY, false);
              return;
            }
            if (!trackingRef.current) return;
            move(
              event.clientX,
              event.clientY,
              event.pointerType !== "mouse",
            );
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            trackingRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            move(
              event.clientX,
              event.clientY,
              event.pointerType !== "mouse",
            );
          }}
          onPointerUp={() => {
            trackingRef.current = false;
          }}
          onPointerCancel={() => {
            trackingRef.current = false;
          }}
        >
          <div
            className={cn(
              "absolute rounded-full border-2 will-change-transform",
              inside
                ? "border-sky-400 bg-sky-400/20"
                : "border-amber-400/70 bg-amber-400/10",
            )}
            style={{
              width: `${playZone}%`,
              height: `${playZone * 1.05}%`,
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <CsCrosshairReticle
            size={coarse ? 24 : 20}
            className="z-10"
            style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
          />
          <div className="absolute inset-x-3 bottom-3 h-2 overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full rounded-full bg-sky-400 transition-[width] duration-75"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
