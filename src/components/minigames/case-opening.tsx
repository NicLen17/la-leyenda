"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { playCaseOpen } from "@/lib/audio/sounds";
import { RARITY_META, rollCaseItem } from "@/lib/data/cases";
import { cn } from "@/lib/utils";
import type { CaseItem, CsCase } from "@/lib/types/game";

type CaseOpeningProps = {
  csCase: CsCase;
  onUnboxed: (item: CaseItem) => void;
  onClose: () => void;
};

const ITEM_WIDTH = 116;
const REEL_LENGTH = 56;
/** Viewport starts mid-strip so opening never begins at slot 0. */
const START_INDEX = 12;
const WINNER_INDEX = 49;
/** Audio intros; reel stays still and zooms in. */
const PRE_OPEN_MS = 2000;
/** Reel motion window (~audio 2s → 9s). */
const SPIN_MS = 7000;
/** Let the sting finish a beat after the reel stops. */
const AUDIO_TAIL_MS = 800;

type Phase = "idle" | "preopen" | "spinning" | "done";

/** Fast start, long ease-out — close to cubic-bezier(0.12, 0.72, 0.12, 1). */
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

/** Continuous scale falloff — no stepped jumps when the reel slows. */
function itemScale(distance: number) {
  const d = Math.abs(distance);
  const peak = Math.exp(-0.55 * d * d);
  return 0.82 + 0.4 * peak;
}

function ItemCard({
  item,
  highlight,
  scale,
  zIndex,
}: {
  item: CaseItem;
  highlight?: boolean;
  scale: number;
  zIndex: number;
}) {
  const meta = RARITY_META[item.rarity];
  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: ITEM_WIDTH, height: 148, zIndex }}
    >
      <div
        className={cn(
          "relative flex flex-col items-center justify-end overflow-hidden rounded-md border bg-gradient-to-b from-[#1b2330] to-[#0d131b] px-2 pb-2 pt-3",
          highlight ? "border-foreground/50 shadow-[0_0_18px_rgba(251,191,36,0.35)]" : "border-border/50",
        )}
        style={{
          width: ITEM_WIDTH - 8,
          height: 118,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-16 opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${meta.glow}, transparent 70%)`,
          }}
        />
        <svg viewBox="0 0 64 28" className="relative mb-1 h-9 w-full">
          <rect x="4" y="12" width="42" height="6" rx="1.5" fill={meta.color} fillOpacity="0.85" />
          <rect x="42" y="9" width="16" height="5" rx="1" fill={meta.color} fillOpacity="0.6" />
          <rect x="10" y="18" width="9" height="8" rx="1" fill={meta.color} fillOpacity="0.5" />
          <rect x="24" y="17" width="4" height="7" rx="1" fill={meta.color} fillOpacity="0.7" />
        </svg>
        <p className="relative w-full truncate text-center text-[10px] font-semibold text-muted-foreground">
          {item.weapon}
        </p>
        <p className="relative w-full truncate text-center text-[11px] font-bold">
          {item.name}
        </p>
        <div
          className="absolute inset-x-0 bottom-0 h-[3px]"
          style={{ backgroundColor: meta.color }}
        />
      </div>
    </div>
  );
}

const START_OFFSET = START_INDEX * ITEM_WIDTH;

export function CaseOpening({ csCase, onUnboxed, onClose }: CaseOpeningProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [won, setWon] = useState<CaseItem | null>(null);
  const [offset, setOffset] = useState(START_OFFSET);
  const winner = useRef<CaseItem | null>(null);
  const stopCaseAudio = useRef<(() => void) | null>(null);
  const timers = useRef<number[]>([]);
  const raf = useRef<number | null>(null);
  const fromOffset = useRef(START_OFFSET);

  const preview = useMemo(
    () =>
      Array.from(
        { length: REEL_LENGTH },
        (_, index) => csCase.items[index % csCase.items.length],
      ),
    [csCase],
  );

  const [reelItems, setReelItems] = useState<CaseItem[]>(preview);

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
      stopCaseAudio.current?.();
    };
  }, []);

  const finishSpin = (prize: CaseItem, finalOffset: number) => {
    setOffset(finalOffset);
    setPhase("done");
    setWon(prize);
    onUnboxed(prize);

    const audioStop = window.setTimeout(() => {
      stopCaseAudio.current?.();
      stopCaseAudio.current = null;
    }, AUDIO_TAIL_MS);
    timers.current.push(audioStop);
  };

  const runSpin = (prize: CaseItem, targetOffset: number) => {
    setPhase("spinning");
    const startedAt = performance.now();
    const origin = fromOffset.current;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / SPIN_MS);
      const eased = easeOutQuint(t);
      setOffset(origin + (targetOffset - origin) * eased);

      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
        return;
      }

      raf.current = null;
      finishSpin(prize, targetOffset);
    };

    raf.current = requestAnimationFrame(tick);
  };

  const spin = () => {
    if (phase !== "idle") return;
    const prize = rollCaseItem(csCase);
    winner.current = prize;

    const nextReel = Array.from(
      { length: REEL_LENGTH },
      () => csCase.items[Math.floor(Math.random() * csCase.items.length)],
    );
    nextReel[WINNER_INDEX] = prize;
    setReelItems(nextReel);
    fromOffset.current = START_OFFSET;
    setOffset(START_OFFSET);
    setPhase("preopen");
    stopCaseAudio.current = playCaseOpen();

    const jitter = (Math.random() - 0.5) * (ITEM_WIDTH * 0.45);
    const targetOffset = WINNER_INDEX * ITEM_WIDTH + jitter;

    const preOpenTimer = window.setTimeout(() => {
      runSpin(prize, targetOffset);
    }, PRE_OPEN_MS);
    timers.current.push(preOpenTimer);
  };

  const meta = won ? RARITY_META[won.rarity] : null;
  const centerIndex = offset / ITEM_WIDTH;

  return (
    <div className="flex flex-col gap-3 overflow-x-hidden pt-1">
      <div className="flex flex-col items-center gap-2 text-center">
        {/* Extra vertical room so the case drop-shadow isn't clipped by the dialog edge. */}
        <div className="flex h-[7.25rem] items-center justify-center overflow-visible">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ui/cs2-case.webp"
            alt=""
            className={cn(
              "h-24 w-auto object-contain drop-shadow-[0_10px_24px_rgba(250,204,21,0.28)] transition-all duration-700 ease-out",
              phase === "preopen" && "scale-110",
              phase === "spinning" && "scale-100 opacity-80",
              phase === "done" && "scale-110",
            )}
            draggable={false}
          />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Unlock Container
          </p>
          <p className="text-lg font-bold tracking-tight">{csCase.name}</p>
        </div>
      </div>

      {/*
        Clip wrapper stays unscaled so reel zoom never spills horizontally
        outside the modal.
      */}
      <div className="overflow-hidden rounded-lg border border-border bg-[#0a0e14]">
        <div
          className={cn(
            "relative py-2 transition-transform duration-700 ease-out",
            phase === "idle" && "scale-[0.92]",
            phase === "preopen" && "scale-105",
            (phase === "spinning" || phase === "done") && "scale-100",
          )}
        >
          <div
            className="absolute left-1/2 top-0 z-20 h-full w-[2px] -translate-x-1/2 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0a0e14] via-[#0a0e14]/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0a0e14] via-[#0a0e14]/80 to-transparent" />

          {/*
            Anchor the reel at the viewport center with left:50%, then shift by
            half a slot + offset. Avoids translateX(50%) which breaks when the
            strip is width:max-content (looks like a tiny scroll).
          */}
          <div
            className="relative flex h-[148px] will-change-transform"
            style={{
              width: "max-content",
              marginLeft: "50%",
              transform: `translateX(calc(-${ITEM_WIDTH / 2}px - ${offset}px))`,
            }}
          >
            {reelItems.map((item, index) => {
              const distance = index - centerIndex;
              const scale =
                phase === "idle" ? itemScale(distance) * 0.96 : itemScale(distance);
              const isWinner = Boolean(won) && index === WINNER_INDEX;
              // Distance-based stack so the centered card always paints above neighbors.
              const zIndex = isWinner
                ? 200
                : Math.round(100 - Math.abs(distance) * 20);

              return (
                <ItemCard
                  key={`${item.id}-${index}`}
                  item={item}
                  highlight={isWinner}
                  scale={scale}
                  zIndex={zIndex}
                />
              );
            })}
          </div>
        </div>
      </div>

      {won && meta ? (
        <div
          className="animate-fade-up rounded-lg border p-3 text-center"
          style={{ borderColor: meta.color, backgroundColor: `${meta.color}18` }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>
            {meta.label}
          </p>
          <p className="text-base font-bold">
            {won.weapon} | {won.name}
          </p>
          <p className="text-sm text-muted-foreground">
            Valor de mercado: ${won.value.toLocaleString("es-AR")}
            {won.buff && (
              <>
                {" · "}
                <span className="text-primary">
                  +{won.buff.amount} {won.buff.attribute}
                </span>
              </>
            )}
          </p>
        </div>
      ) : (
        <p className="text-center text-xs text-muted-foreground">
          Probabilidades reales de CS: 79,92% Mil-Spec · 15,98% Restricted · 3,2%
          Classified · 0,64% Covert · 0,26% ★ Rare Special
        </p>
      )}

      <div className="flex justify-center gap-2">
        {!won ? (
          <Button onClick={spin} disabled={phase !== "idle"} size="lg">
            {phase === "idle" ? "Abrir caja" : "Abriendo..."}
          </Button>
        ) : (
          <Button onClick={onClose} size="lg" variant="secondary">
            Guardar en el inventario
          </Button>
        )}
      </div>
    </div>
  );
}
