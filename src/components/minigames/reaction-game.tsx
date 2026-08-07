"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ReactionGameProps = {
  /** Pass if the reaction is faster than this, in milliseconds. */
  threshold?: number;
  onComplete: (success: boolean) => void;
};

type Stage = "idle" | "waiting" | "peek" | "tooSoon" | "done";

/** Simple T-side model silhouette that pops on peek. */
function EnemySilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 80"
      className={cn("h-28 w-24 drop-shadow-[0_0_18px_rgba(234,88,12,0.55)]", className)}
      aria-hidden
    >
      <ellipse cx="32" cy="74" rx="14" ry="4" fill="#000" fillOpacity="0.35" />
      {/* legs */}
      <rect x="22" y="48" width="8" height="24" rx="2" fill="#3d2a1a" />
      <rect x="34" y="48" width="8" height="24" rx="2" fill="#3d2a1a" />
      {/* torso */}
      <rect x="20" y="28" width="24" height="24" rx="3" fill="#c45c26" />
      <rect x="24" y="32" width="16" height="10" rx="1" fill="#1a120c" fillOpacity="0.45" />
      {/* head + helmet */}
      <circle cx="32" cy="20" r="10" fill="#c49a6c" />
      <path d="M22 18 Q32 8 42 18 L40 24 Q32 20 24 24 Z" fill="#2a2a2a" />
      {/* rifle */}
      <rect x="40" y="36" width="18" height="3" rx="1" fill="#1f1f1f" />
      <rect x="54" y="34" width="6" height="2" fill="#333" />
    </svg>
  );
}

function Crosshair() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative size-16">
        <div className="absolute left-1/2 top-0 h-3 w-[2px] -translate-x-1/2 bg-primary/90" />
        <div className="absolute bottom-0 left-1/2 h-3 w-[2px] -translate-x-1/2 bg-primary/90" />
        <div className="absolute left-0 top-1/2 h-[2px] w-3 -translate-y-1/2 bg-primary/90" />
        <div className="absolute right-0 top-1/2 h-[2px] w-3 -translate-y-1/2 bg-primary/90" />
        <div className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
      </div>
    </div>
  );
}

export function ReactionGame({
  threshold = 320,
  onComplete,
}: ReactionGameProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [reaction, setReaction] = useState<number | null>(null);
  const peekAt = useRef(0);
  const timer = useRef<number | null>(null);

  const arm = useCallback(() => {
    setStage("waiting");
    setReaction(null);
    const delay = 1100 + Math.random() * 2400;
    timer.current = window.setTimeout(() => {
      peekAt.current = Date.now();
      setStage("peek");
    }, delay);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const handleClick = () => {
    if (stage === "idle" || stage === "tooSoon") {
      arm();
      return;
    }

    if (stage === "waiting") {
      if (timer.current) window.clearTimeout(timer.current);
      setStage("tooSoon");
      return;
    }

    if (stage === "peek") {
      const ms = Date.now() - peekAt.current;
      setReaction(ms);
      setStage("done");
      window.setTimeout(() => onComplete(ms <= threshold), 900);
    }
  };

  const label: Record<Stage, string> = {
    idle: "Click para tomar el ángulo",
    waiting: "Mirá el ángulo... no dispares antes",
    peek: "¡ENEMIGO! DISPARÁ",
    tooSoon: "Te adelantaste. Click para reintentar",
    done:
      reaction !== null && reaction <= threshold
        ? `${reaction} ms — le ganaste el duelo`
        : `${reaction} ms — llegaste tarde`,
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Tiempo de reacción</span>
        <span className="tabular-nums">objetivo &lt; {threshold} ms</span>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative flex flex-1 select-none flex-col items-center justify-center overflow-hidden rounded-lg border-2 text-center transition-colors duration-100",
          stage === "peek"
            ? "border-primary bg-[#1a120c]"
            : stage === "tooSoon"
              ? "border-destructive bg-destructive/20"
              : stage === "done"
                ? reaction !== null && reaction <= threshold
                  ? "border-primary bg-primary/15"
                  : "border-destructive bg-destructive/15"
                : "border-border bg-[radial-gradient(ellipse_at_center,#1a2430_0%,#0b1018_70%)]",
        )}
      >
        {/* environment wash */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(56,90,120,0.25),transparent_40%,rgba(0,0,0,0.45))]" />

        <Crosshair />

        {(stage === "peek" ||
          (stage === "done" && reaction !== null && reaction <= threshold)) && (
          <div className="animate-fade-up absolute left-1/2 top-[28%] -translate-x-1/2">
            <EnemySilhouette />
          </div>
        )}

        {stage === "done" && reaction !== null && reaction > threshold && (
          <div className="absolute left-1/2 top-[28%] -translate-x-1/2 opacity-40">
            <EnemySilhouette />
          </div>
        )}

        <div className="relative z-10 mt-auto mb-6 px-4">
          <span className="text-lg font-bold tracking-tight drop-shadow">{label[stage]}</span>
          {stage === "waiting" && (
            <p className="mt-1 text-xs text-muted-foreground">
              Crosshair fija. Cuando peeks, click.
            </p>
          )}
        </div>
      </button>
    </div>
  );
}
