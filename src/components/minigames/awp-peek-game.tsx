"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AwpPeekGameProps = {
  /** Max reaction window in ms after the peek appears. */
  windowMs?: number;
  onComplete: (success: boolean) => void;
};

type Stage = "idle" | "holding" | "peek" | "hit" | "miss";

/** AWP peek duel: wait the angle, flick the head when they peek. */
export function AwpPeekGame({
  windowMs = 480,
  onComplete,
}: AwpPeekGameProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [head, setHead] = useState({ x: 70, y: 38 });
  const timer = useRef<number | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const arm = () => {
    finished.current = false;
    setStage("holding");
    const delay = 900 + Math.random() * 2200;
    timer.current = window.setTimeout(() => {
      setHead({
        x: 55 + Math.random() * 30,
        y: 28 + Math.random() * 30,
      });
      setStage("peek");
      timer.current = window.setTimeout(() => {
        if (!finished.current) {
          finished.current = true;
          setStage("miss");
          window.setTimeout(() => onComplete(false), 500);
        }
      }, windowMs);
    }, delay);
  };

  const shoot = () => {
    if (stage === "holding") {
      if (timer.current) window.clearTimeout(timer.current);
      finished.current = true;
      setStage("miss");
      window.setTimeout(() => onComplete(false), 450);
      return;
    }
    if (stage !== "peek" || finished.current) return;
    finished.current = true;
    if (timer.current) window.clearTimeout(timer.current);
    setStage("hit");
    window.setTimeout(() => onComplete(true), 450);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
        Duelo AWP · peek
      </div>

      {stage === "idle" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-card p-4">
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            Hold el ángulo. Cuando peakee, clickeá la cabeza. Si tirás antes,
            te leen.
          </p>
          <Button size="lg" onClick={arm}>
            Hold ángulo
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={shoot}
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden rounded-lg border border-border/60",
            stage === "holding" && "bg-[#101820]",
            stage === "peek" && "bg-[#1a2430]",
            stage === "hit" && "bg-primary/20",
            stage === "miss" && "bg-destructive/20",
          )}
        >
          <div className="absolute inset-y-0 left-[18%] w-px bg-white/15" />
          <div className="absolute inset-y-0 right-[22%] w-10 bg-black/35" />
          <p className="absolute inset-x-0 top-3 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {stage === "holding" && "Holding… no dispares"}
            {stage === "peek" && "¡PEEK!"}
            {stage === "hit" && "Headshot"}
            {stage === "miss" && "Te ganaron el peek"}
          </p>
          {(stage === "peek" || stage === "hit") && (
            <span
              className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-400 bg-red-500/70 shadow-[0_0_16px_rgba(248,113,113,0.7)]"
              style={{ left: `${head.x}%`, top: `${head.y}%` }}
            />
          )}
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/80" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/80" />
          </div>
        </button>
      )}
    </div>
  );
}
