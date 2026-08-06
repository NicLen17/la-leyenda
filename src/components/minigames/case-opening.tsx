"use client";

import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
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
const WINNER_INDEX = 49;

function ItemCard({ item, highlight }: { item: CaseItem; highlight?: boolean }) {
  const meta = RARITY_META[item.rarity];
  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col items-center justify-end overflow-hidden rounded-md border bg-gradient-to-b from-[#1b2330] to-[#0d131b] px-2 pb-2 pt-3",
        highlight ? "border-foreground/40" : "border-border/50",
      )}
      style={{ width: ITEM_WIDTH - 8, height: 118, marginRight: 8 }}
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
  );
}

export function CaseOpening({ csCase, onUnboxed, onClose }: CaseOpeningProps) {
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<CaseItem | null>(null);
  const [offset, setOffset] = useState(0);
  const winner = useRef<CaseItem | null>(null);

  // Preview strip is deterministic; the randomised reel is built on spin so no
  // impure call happens during render.
  const preview = useMemo(
    () =>
      Array.from(
        { length: REEL_LENGTH },
        (_, index) => csCase.items[index % csCase.items.length],
      ),
    [csCase],
  );

  const [reelItems, setReelItems] = useState<CaseItem[]>(preview);

  const spin = () => {
    if (spinning || won) return;
    const prize = rollCaseItem(csCase);
    winner.current = prize;

    const nextReel = Array.from(
      { length: REEL_LENGTH },
      () => csCase.items[Math.floor(Math.random() * csCase.items.length)],
    );
    nextReel[WINNER_INDEX] = prize;
    setReelItems(nextReel);
    setSpinning(true);

    // Land the winning item under the centre marker with a small random drift.
    const jitter = (Math.random() - 0.5) * (ITEM_WIDTH * 0.45);
    requestAnimationFrame(() => {
      setOffset(WINNER_INDEX * ITEM_WIDTH + jitter);
    });

    window.setTimeout(() => {
      setSpinning(false);
      setWon(prize);
      onUnboxed(prize);
    }, 5400);
  };

  const meta = won ? RARITY_META[won.rarity] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Unlock Container
        </p>
        <p className="text-lg font-bold tracking-tight">{csCase.name}</p>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-border bg-[#0a0e14] py-3">
        <div
          className="absolute left-1/2 top-0 z-20 h-full w-[2px] -translate-x-1/2 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0a0e14] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#0a0e14] to-transparent" />

        <div
          className="flex will-change-transform"
          style={{
            transform: `translateX(calc(50% - ${ITEM_WIDTH / 2}px - ${offset}px))`,
            transition: spinning
              ? "transform 5.2s cubic-bezier(0.12, 0.72, 0.12, 1)"
              : undefined,
          }}
        >
          {reelItems.map((item, index) => (
            <ItemCard
              key={`${item.id}-${index}`}
              item={item}
              highlight={Boolean(won) && index === WINNER_INDEX}
            />
          ))}
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
          <Button onClick={spin} disabled={spinning} size="lg">
            {spinning ? "Abriendo..." : "Abrir caja"}
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
