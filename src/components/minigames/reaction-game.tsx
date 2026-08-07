"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { CsCrosshair } from "@/components/minigames/cs-crosshair";
import { ShotResultFlash } from "@/components/minigames/shot-result";
import { playGunshot, playReady, playSound } from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";

type ReactionGameProps = {
  /** Pass if the reaction is faster than this, in milliseconds. */
  threshold?: number;
  onComplete: (success: boolean) => void;
};

type Stage = "idle" | "waiting" | "peek" | "tooSoon" | "done";
type EnemySide = "ct" | "t";

const ENEMY_IMAGES: Record<EnemySide, string> = {
  ct: "/ui/cst silueta.webp",
  t: "/ui/tt silueta.webp",
};

const CROSSHAIR_GREEN = "#7CFF6B";

function EnemySilhouette({
  side,
  className,
}: {
  side: EnemySide;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none relative h-full w-full",
        className,
      )}
    >
      <Image
        src={ENEMY_IMAGES[side]}
        alt=""
        fill
        sizes="(max-width: 768px) 92vw, 640px"
        priority
        draggable={false}
        className="object-contain object-center drop-shadow-[0_0_32px_rgba(0,0,0,0.75)] [mix-blend-mode:lighten]"
        aria-hidden
      />
    </div>
  );
}

export function ReactionGame({
  threshold = 320,
  onComplete,
}: ReactionGameProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [reaction, setReaction] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [enemySide, setEnemySide] = useState<EnemySide>("t");
  const [remainingMs, setRemainingMs] = useState(threshold);
  const [arenaSize, setArenaSize] = useState(280);
  const arenaRef = useRef<HTMLButtonElement | null>(null);
  const peekAt = useRef(0);
  const armTimer = useRef<number | null>(null);
  const failTimer = useRef<number | null>(null);
  const hardCapTimer = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    const el = arenaRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setArenaSize(Math.min(width, height));
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clearTimers = useCallback(() => {
    if (armTimer.current) {
      window.clearTimeout(armTimer.current);
      armTimer.current = null;
    }
    if (failTimer.current) {
      window.clearTimeout(failTimer.current);
      failTimer.current = null;
    }
    if (hardCapTimer.current) {
      window.clearTimeout(hardCapTimer.current);
      hardCapTimer.current = null;
    }
    if (raf.current) {
      window.cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  }, []);

  const finish = useCallback(
    (success: boolean, ms: number | null) => {
      if (finished.current) return;
      finished.current = true;
      clearTimers();
      setWon(success);
      setReaction(ms);
      setRemainingMs(success && ms !== null ? Math.max(0, threshold - ms) : 0);
      setStage("done");
      window.setTimeout(() => onComplete(success), 900);
    },
    [clearTimers, onComplete, threshold],
  );

  const timeoutMiss = useCallback(() => {
    if (finished.current) return;
    playSound("helmet", { volume: 0.35 });
    finish(false, threshold);
  }, [finish, threshold]);

  const startPeekCountdown = useCallback(() => {
    peekAt.current = Date.now();
    setRemainingMs(threshold);

    const tick = () => {
      if (finished.current) return;
      const elapsed = Date.now() - peekAt.current;
      const left = Math.max(0, threshold - elapsed);
      setRemainingMs(left);
      if (left <= 0) {
        // Don't rely only on setTimeout — resolve as soon as the bar hits 0.
        timeoutMiss();
        return;
      }
      raf.current = window.requestAnimationFrame(tick);
    };
    raf.current = window.requestAnimationFrame(tick);

    // Backup if rAF is throttled/backgrounded.
    failTimer.current = window.setTimeout(timeoutMiss, threshold + 40);
  }, [threshold, timeoutMiss]);

  const arm = useCallback(() => {
    clearTimers();
    finished.current = false;
    setStage("waiting");
    setReaction(null);
    setWon(false);
    setRemainingMs(threshold);
    playReady();

    const delay = 1100 + Math.random() * 2400;
    armTimer.current = window.setTimeout(() => {
      if (finished.current) return;
      setEnemySide(Math.random() < 0.5 ? "ct" : "t");
      setStage("peek");
      startPeekCountdown();
    }, delay);

    // Absolute ceiling: waiting delay + reaction window + slack.
    // If anything stalls, the round still ends as a loss.
    hardCapTimer.current = window.setTimeout(() => {
      timeoutMiss();
    }, delay + threshold + 750);
  }, [clearTimers, startPeekCountdown, threshold, timeoutMiss]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleClick = () => {
    if (stage === "idle") {
      arm();
      return;
    }

    if (stage === "waiting") {
      finished.current = true;
      clearTimers();
      playSound("helmet", { volume: 0.3 });
      setStage("tooSoon");
      window.setTimeout(() => onComplete(false), 700);
      return;
    }

    if (stage === "peek") {
      const ms = Date.now() - peekAt.current;
      playGunshot();
      finish(ms <= threshold, ms);
    }
  };

  const progress = Math.max(0, Math.min(1, remainingMs / threshold));
  const secondsLeft = (remainingMs / 1000).toFixed(2);
  const urgent = stage === "peek" && remainingMs <= threshold * 0.35;
  const crosshairSize = Math.max(
    arenaSize < 280 ? 140 : 180,
    Math.round(arenaSize * (arenaSize < 280 ? 0.55 : 0.72)),
  );

  const showEnemy =
    stage === "peek" || (stage === "done" && reaction !== null);

  const flashResult =
    stage === "tooSoon"
      ? ("miss" as const)
      : stage === "done"
        ? won
          ? ("hit" as const)
          : ("miss" as const)
        : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Tiempo de reacción</span>
        <span
          className={cn(
            "animate-pulse rounded-md border px-2.5 py-1 font-mono text-xs font-black tabular-nums tracking-wide",
            stage === "peek" && urgent
              ? "border-destructive/70 bg-destructive/20 text-destructive"
              : "border-primary/55 bg-primary/15 text-primary",
          )}
        >
          &lt; {threshold} ms
        </span>
      </div>

      <p
        className={cn(
          "animate-pulse rounded-md border px-3 py-1.5 text-center text-xs",
          stage === "peek"
            ? urgent
              ? "border-destructive/50 bg-destructive/15 text-destructive"
              : "border-primary/40 bg-primary/10 text-foreground"
            : "border-border/50 bg-card/50 text-muted-foreground",
        )}
      >
        Reaccioná en menos de{" "}
        <span className="font-semibold text-foreground">{threshold} ms</span>.
        Cuando aparece el enemigo, dispará antes de que se acabe el contador.
      </p>

      <button
        ref={arenaRef}
        type="button"
        onClick={handleClick}
        disabled={stage === "tooSoon" || stage === "done"}
        className={cn(
          "relative flex min-h-0 flex-1 select-none flex-col items-center justify-center overflow-hidden rounded-lg border-2 text-center transition-colors duration-100",
          stage === "peek"
            ? urgent
              ? "border-destructive bg-[#1a120c]"
              : "border-primary bg-[#1a120c]"
            : stage === "tooSoon"
              ? "border-destructive bg-destructive/20"
              : stage === "done"
                ? won
                  ? "border-primary bg-primary/15"
                  : "border-destructive bg-destructive/15"
                : "border-border bg-[radial-gradient(ellipse_at_center,#1a2430_0%,#0b1018_70%)]",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(56,90,120,0.25),transparent_40%,rgba(0,0,0,0.45))]" />

        {(stage === "peek" || stage === "done") && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-2.5 bg-black/55">
            <div
              className={cn(
                "h-full origin-left transition-[width] duration-75 ease-linear",
                urgent || (stage === "done" && !won)
                  ? "bg-destructive"
                  : "bg-[#7CFF6B]",
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex flex-col items-center gap-1 px-3">
          {stage === "peek" && (
            <>
              <span
                className={cn(
                  "font-mono text-4xl font-black tabular-nums tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:text-5xl md:text-6xl",
                  urgent ? "text-destructive" : "text-[#7CFF6B]",
                )}
              >
                {secondsLeft}s
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.22em]",
                  urgent ? "text-destructive" : "text-foreground/80",
                )}
              >
                dispará ahora
              </span>
            </>
          )}
        </div>

        {showEnemy && (
          <div
            className={cn(
              "pointer-events-none absolute inset-[2%] z-[1]",
              stage === "peek" && "animate-fade-up",
              stage === "done" && !won && "opacity-40",
            )}
          >
            <EnemySilhouette side={enemySide} />
          </div>
        )}

        <CsCrosshair
          size={crosshairSize}
          color={CROSSHAIR_GREEN}
          className="z-[2]"
        />

        {flashResult && <ShotResultFlash result={flashResult} />}

        <div className="relative z-10 mt-auto mb-4 px-4">
          {stage === "idle" && (
            <span className="text-sm font-semibold text-muted-foreground">
              Click para tomar el ángulo
            </span>
          )}
          {stage === "waiting" && (
            <p className="text-xs text-muted-foreground">
              Esperá el peek. El contador arranca cuando aparece.
            </p>
          )}
          {stage === "peek" && (
            <span className="sr-only">Enemigo visible — dispará</span>
          )}
          {stage === "done" && reaction !== null && (
            <span className="tabular-nums text-sm font-bold text-muted-foreground">
              {reaction} ms
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
