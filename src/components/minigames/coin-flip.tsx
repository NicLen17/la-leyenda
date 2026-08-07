"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  playMenuClick,
  playReady,
  playSoftFail,
  playUtilitySuccess,
} from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";
import type { Side } from "@/lib/types/game";

type CoinFlipProps = {
  onComplete: (success: boolean) => void;
};

function CtIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        d="M24 4 41 10v14c0 10-7 17-17 20C14 41 7 34 7 24V10Z"
        fill="#4b7ec4"
        stroke="#a8c8ef"
        strokeWidth="2"
      />
      <path
        d="M24 12a8 8 0 0 0-8 8v3h-2v11h20V23h-2v-3a8 8 0 0 0-8-8Zm0 4a4 4 0 0 1 4 4v3h-8v-3a4 4 0 0 1 4-4Z"
        fill="#e8f1fb"
      />
    </svg>
  );
}

function TIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="20" fill="#c9a227" stroke="#f2dc8b" strokeWidth="2" />
      <path
        d="M14 18h20v5h-7v14h-6V23h-7z"
        fill="#2b2107"
      />
      <path d="M12 12l6-4M36 12l-6-4" stroke="#f2dc8b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CoinFlip({ onComplete }: CoinFlipProps) {
  const [choice, setChoice] = useState<Side | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [outcome, setOutcome] = useState<Side | null>(null);

  const flip = (side: Side) => {
    playMenuClick();
    setChoice(side);
    setFlipping(true);
    playReady();
    const result: Side = Math.random() < 0.5 ? "ct" : "t";

    window.setTimeout(() => {
      setOutcome(result);
      setFlipping(false);
      if (result === side) playUtilitySuccess({ volume: 0.92 });
      else playSoftFail({ volume: 0.45 });
      window.setTimeout(() => onComplete(result === side), 1100);
    }, 1600);
  };

  const shown = outcome ?? "ct";

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Knife round</span>
        <span>50 / 50</span>
      </div>

      <p className="rounded-md border border-border/50 bg-card/50 px-3 py-1.5 text-center text-xs text-muted-foreground">
        Elegí un lado. Si la moneda cae de tu lado, ganás · 50% de chance.
      </p>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-border/60 bg-card p-4">
        <div
          className={cn(
            "relative h-24 w-24 [transform-style:preserve-3d]",
            flipping && "animate-coin-flip",
          )}
        >
          {outcome === null && !flipping ? (
            <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-dashed border-border text-xs text-muted-foreground">
              CT / T
            </div>
          ) : shown === "ct" ? (
            <CtIcon className="h-full w-full" />
          ) : (
            <TIcon className="h-full w-full" />
          )}
        </div>

        {outcome === null ? (
          <>
            <p className="text-center text-xs text-muted-foreground">
              Ganaron el knife round. Elegí con qué lado arrancan el mapa.
            </p>
            <div className="flex gap-3">
              <Button
                variant={choice === "ct" ? "default" : "secondary"}
                disabled={flipping}
                onClick={() => flip("ct")}
                className="gap-2"
              >
                <CtIcon className="h-5 w-5" />
                Counter-Terrorists
              </Button>
              <Button
                variant={choice === "t" ? "default" : "secondary"}
                disabled={flipping}
                onClick={() => flip("t")}
                className="gap-2"
              >
                <TIcon className="h-5 w-5" />
                Terrorists
              </Button>
            </div>
          </>
        ) : (
          <p
            className={cn(
              "text-center text-sm font-bold",
              outcome === choice ? "text-primary" : "text-destructive",
            )}
          >
            {outcome === choice
              ? `Salió ${outcome.toUpperCase()}. Elegiste bien.`
              : `Salió ${outcome.toUpperCase()}. No era tu lado.`}
          </p>
        )}
      </div>
    </div>
  );
}
