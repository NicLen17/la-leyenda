"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ShotResultFlash } from "@/components/minigames/shot-result";
import { Button } from "@/components/ui/button";
import { playReady, playSoftFail, playSound } from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";

type AwpPeekGameProps = {
  /** Seconds to find and eliminate the enemy through the AWP scope. */
  seconds?: number;
  onComplete: (success: boolean) => void;
};

type EnemySide = "ct" | "t";

type EnemyPos = {
  x: number;
  y: number;
  w: number;
  h: number;
  side: EnemySide;
};

const ENEMY_IMAGES: Record<EnemySide, string> = {
  ct: "/ui/cst silueta.png",
  t: "/ui/tt silueta.png",
};

/** Scope hole radius as a fraction of the arena's shorter side. */
const SCOPE_RADIUS_FRAC = 0.34;

function pickEnemy(): EnemyPos {
  const side: EnemySide = Math.random() < 0.5 ? "ct" : "t";
  const h = 26 + Math.random() * 6;
  const w = h * 0.42;
  let x = 12 + Math.random() * 76;
  let y = 18 + Math.random() * 64;
  for (let i = 0; i < 8; i += 1) {
    const dist = Math.hypot(x - 50, y - 50);
    if (dist >= 28) break;
    x = 12 + Math.random() * 76;
    y = 18 + Math.random() * 64;
  }
  return { x, y, w, h, side };
}

/**
 * AWP angle hold: move the scope across the angle, find the enemy silhouette,
 * and click to eliminate them before the timer runs out.
 */
export function AwpPeekGame({ seconds = 5.5, onComplete }: AwpPeekGameProps) {
  const [started, setStarted] = useState(false);
  const [scope, setScope] = useState({ x: 50, y: 50 });
  const [enemy, setEnemy] = useState<EnemyPos | null>(null);
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [result, setResult] = useState<"hit" | "miss" | null>(null);
  const [arenaPx, setArenaPx] = useState({ w: 400, h: 300 });
  const finished = useRef(false);
  const enemyRef = useRef<EnemyPos | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const pressOrigin = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = arenaRef.current;
    if (!el || !started) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setArenaPx({ w: width, h: height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || finished.current) return;
    const startedAt = Date.now();
    const tick = window.setInterval(() => {
      const left = seconds - (Date.now() - startedAt) / 1000;
      setTimeLeft(Math.max(0, left));
      if (left <= 0 && !finished.current) {
        finished.current = true;
        window.clearInterval(tick);
        setResult("miss");
        playSoftFail({ volume: 0.5 });
        window.setTimeout(() => onComplete(false), 550);
      }
    }, 40);
    return () => window.clearInterval(tick);
  }, [onComplete, seconds, started]);

  const begin = () => {
    const next = pickEnemy();
    finished.current = false;
    enemyRef.current = next;
    setResult(null);
    setEnemy(next);
    setScope({ x: 50, y: 50 });
    setTimeLeft(seconds);
    setStarted(true);
    playReady();
  };

  const pointerToPct = (clientX: number, clientY: number) => {
    const el = arenaRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
    };
  };

  const moveScope = (clientX: number, clientY: number) => {
    if (!started || finished.current) return;
    const pct = pointerToPct(clientX, clientY);
    if (!pct) return;
    setScope(pct);
    return pct;
  };

  const isOnTarget = (aim: { x: number; y: number }, target: EnemyPos) => {
    const halfW = target.w * 0.48;
    const halfH = target.h * 0.48;
    return (
      Math.abs(aim.x - target.x) <= halfW &&
      Math.abs(aim.y - target.y) <= halfH
    );
  };

  const shootAt = (aim: { x: number; y: number }) => {
    if (!started || finished.current) return;
    const target = enemyRef.current;
    if (!target) return;

    if (isOnTarget(aim, target)) {
      finished.current = true;
      playSound("awp", { volume: 0.55 });
      window.setTimeout(() => playSound("headshot", { volume: 0.5 }), 90);
      setResult("hit");
      window.setTimeout(() => onComplete(true), 520);
      return;
    }

    playSound("awp", { volume: 0.35 });
  };

  const shortSide = Math.min(arenaPx.w, arenaPx.h);
  const scopeRadiusPx = shortSide * SCOPE_RADIUS_FRAC;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Hold AWP</span>
        {started && (
          <span
            className={cn(
              "tabular-nums",
              timeLeft <= 1.5 ? "text-destructive" : "text-foreground",
            )}
          >
            {timeLeft.toFixed(1)}s
          </span>
        )}
      </div>

      <p className="rounded-md border border-border/50 bg-card/50 px-3 py-1.5 text-center text-xs text-muted-foreground">
        Mové la mira por el ángulo, encontrá al enemigo y dispará. Tenés{" "}
        <span className="font-semibold text-foreground">
          {seconds.toFixed(1)}s
        </span>
        .
      </p>

      {!started ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-card p-4">
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Scope AWP: todo negro salvo el círculo. Escaneá el ángulo y
            clickeá cuando el crosshair esté sobre el rival.
          </p>
          <Button size="lg" onClick={begin}>
            Hold ángulo
          </Button>
        </div>
      ) : (
        <div
          ref={arenaRef}
          role="application"
          aria-label="Mira AWP — mové el puntero y clickeá para disparar"
          className="relative min-h-0 flex-1 cursor-none overflow-hidden rounded-lg border border-border/60 bg-[#121c28] touch-none select-none"
          onPointerMove={(event) => {
            moveScope(event.clientX, event.clientY);
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            const pct = moveScope(event.clientX, event.clientY);
            if (pct) pressOrigin.current = pct;
          }}
          onPointerUp={(event) => {
            if (finished.current || !pressOrigin.current) return;
            const pct = moveScope(event.clientX, event.clientY);
            if (!pct) return;
            const dragged = Math.hypot(
              pct.x - pressOrigin.current.x,
              pct.y - pressOrigin.current.y,
            );
            pressOrigin.current = null;
            if (dragged <= 3.5) shootAt(pct);
          }}
          onPointerCancel={() => {
            pressOrigin.current = null;
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            aria-hidden
          >
            <div className="absolute inset-y-0 left-[14%] w-px bg-white/10" />
            <div className="absolute inset-y-0 right-[20%] w-[18%] bg-black/40" />
            <div className="absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute left-[8%] top-[18%] h-[12%] w-[22%] rounded-sm bg-[#1c2a38]" />
            <div className="absolute right-[12%] top-[30%] h-[28%] w-[10%] bg-[#0e1620]" />
          </div>

          {enemy && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${enemy.x}%`,
                top: `${enemy.y}%`,
                width: `${enemy.w}%`,
                height: `${enemy.h}%`,
              }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={ENEMY_IMAGES[enemy.side]}
                  alt=""
                  fill
                  sizes="160px"
                  priority
                  draggable={false}
                  className="object-contain object-center drop-shadow-[0_0_18px_rgba(0,0,0,0.8)] [mix-blend-mode:lighten]"
                  aria-hidden
                />
              </div>
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: `radial-gradient(circle ${scopeRadiusPx}px at ${scope.x}% ${scope.y}%, transparent 0%, transparent 62%, rgba(0,0,0,0.55) 78%, #000 92%)`,
            }}
            aria-hidden
          />

          <div
            className="pointer-events-none absolute z-20"
            style={{
              left: `${scope.x}%`,
              top: `${scope.y}%`,
              width: scopeRadiusPx * 2,
              height: scopeRadiusPx * 2,
              transform: "translate(-50%, -50%)",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
            aria-hidden
          >
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/90" />
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/90" />
            <div className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80" />
          </div>

          <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/70">
            <span>Scope</span>
            <span className="tabular-nums text-amber-200">
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          {result && <ShotResultFlash result={result} />}
        </div>
      )}
    </div>
  );
}
