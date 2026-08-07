"use client";

import { Backpack } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RARITY_META } from "@/lib/data/cases";
import { cn } from "@/lib/utils";
import type { AttributeKey, CaseItem, PlayerState, Rarity } from "@/lib/types/game";

type InventoryPanelProps = {
  player: PlayerState;
  onClose: () => void;
};

const RARITY_ORDER: Rarity[] = [
  "knife",
  "covert",
  "classified",
  "restricted",
  "milspec",
  "industrial",
  "consumer",
];

const ATTR_LABEL: Record<AttributeKey, string> = {
  aim: "Aim",
  reflexes: "Reflejos",
  gameSense: "Game sense",
  utility: "Utility",
  clutch: "Clutch",
  movement: "Movement",
};

function money(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return `$${Math.round(value)}`;
}

function rarityRank(rarity: Rarity): number {
  const idx = RARITY_ORDER.indexOf(rarity);
  return idx === -1 ? RARITY_ORDER.length : idx;
}

function sortSkins(items: CaseItem[]): CaseItem[] {
  return [...items].sort((a, b) => {
    const byRarity = rarityRank(a.rarity) - rarityRank(b.rarity);
    if (byRarity !== 0) return byRarity;
    return b.value - a.value;
  });
}

function SkinCard({ item }: { item: CaseItem }) {
  const meta = RARITY_META[item.rarity];

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-lg border bg-gradient-to-b from-[#1b2330] to-[#0d131b]"
      style={{ borderColor: `${meta.color}55` }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-35"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${meta.glow}, transparent 72%)`,
        }}
      />
      <div className="relative flex flex-1 flex-col items-center px-2.5 pb-2.5 pt-3">
        <svg viewBox="0 0 64 28" className="mb-1.5 h-8 w-full" aria-hidden>
          <rect
            x="4"
            y="12"
            width="42"
            height="6"
            rx="1.5"
            fill={meta.color}
            fillOpacity="0.85"
          />
          <rect
            x="42"
            y="9"
            width="16"
            height="5"
            rx="1"
            fill={meta.color}
            fillOpacity="0.6"
          />
          <rect
            x="10"
            y="18"
            width="9"
            height="8"
            rx="1"
            fill={meta.color}
            fillOpacity="0.5"
          />
          <rect
            x="24"
            y="17"
            width="4"
            height="7"
            rx="1"
            fill={meta.color}
            fillOpacity="0.7"
          />
        </svg>
        <p className="w-full truncate text-center text-[10px] font-semibold text-muted-foreground">
          {item.weapon}
        </p>
        <p className="w-full truncate text-center text-xs font-bold leading-tight">
          {item.name}
        </p>
        <p
          className="mt-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: meta.color }}
        >
          {meta.label}
        </p>
        {item.buff && (
          <p className="mt-0.5 text-[10px] font-semibold text-primary">
            +{item.buff.amount} {ATTR_LABEL[item.buff.attribute]}
          </p>
        )}
      </div>
      <div
        className="flex items-center justify-between border-t px-2.5 py-1.5"
        style={{ borderColor: `${meta.color}33` }}
      >
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Valor
        </span>
        <span className="text-xs font-black tabular-nums text-primary">
          {money(item.value)}
        </span>
      </div>
      <div
        className="h-[3px] shrink-0"
        style={{ backgroundColor: meta.color }}
      />
    </div>
  );
}

/** Inventory of skins unboxed (and bought) during the career. */
export function InventoryPanel({ player, onClose }: InventoryPanelProps) {
  const skins = sortSkins(player.inventory);
  const totalValue = skins.reduce((sum, item) => sum + item.value, 0);
  const best = skins[0] ?? null;

  return (
    <div className="flex max-h-[min(78dvh,640px)] flex-col gap-2">
      <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border/50 pb-2 pr-10 sm:pr-8">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Inventario
          </p>
          <h2 className="text-base font-black uppercase tracking-tight sm:text-lg">
            Skins unboxeadas
          </h2>
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Todas las skins que abriste en cajas o compraste en la tienda.
          </p>
        </div>
        <div className="shrink-0 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Valor total
          </p>
          <p className="text-base font-black tabular-nums text-primary">
            {money(totalValue)}
          </p>
          <p className="text-[10px] tabular-nums text-muted-foreground">
            {skins.length} skin{skins.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      {best && (
        <p className="shrink-0 text-[11px] text-muted-foreground">
          Mejor drop:{" "}
          <span className="font-bold text-foreground">
            {best.weapon} | {best.name}
          </span>{" "}
          · {money(best.value)}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 sm:pr-1">
        {skins.length === 0 ? (
          <div
            className={cn(
              "flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/30 px-6 text-center sm:min-h-[220px]",
            )}
          >
            <div className="flex size-12 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
              <Backpack className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold">Inventario vacío</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Abrí cajas desde el panel o comprá skins en la tienda para
                llenar tu colección.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {skins.map((item, index) => (
              <SkinCard key={`${item.id}-${index}`} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 justify-stretch border-t border-border/50 pt-2 sm:justify-end">
        <Button
          variant="secondary"
          size="sm"
          className="h-10 w-full touch-manipulation sm:h-8 sm:w-auto"
          onClick={onClose}
        >
          Cerrar inventario
        </Button>
      </div>
    </div>
  );
}
