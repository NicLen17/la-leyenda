"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type ReactionGameProps = {
  /** Pass if the reaction is faster than this, in milliseconds. */
  threshold?: number;
  onComplete: (success: boolean) => void;
};

type Stage = "idle" | "waiting" | "peek" | "tooSoon" | "done";

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
    waiting: "Esperá el peek... no dispares antes",
    peek: "¡DISPARÁ!",
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
          "flex flex-1 select-none flex-col items-center justify-center gap-2 rounded-lg border-2 text-center transition-colors duration-100",
          stage === "peek"
            ? "border-primary bg-primary/25"
            : stage === "tooSoon"
              ? "border-destructive bg-destructive/20"
              : stage === "done"
                ? reaction !== null && reaction <= threshold
                  ? "border-primary bg-primary/15"
                  : "border-destructive bg-destructive/15"
                : "border-border bg-card",
        )}
      >
        <span className="text-lg font-bold tracking-tight">{label[stage]}</span>
        {stage === "waiting" && (
          <span className="text-xs text-muted-foreground">
            Crosshair en el ángulo. Aguantá.
          </span>
        )}
      </button>
    </div>
  );
}
