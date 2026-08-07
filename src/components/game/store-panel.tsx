"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { playCoinCollect } from "@/lib/audio/sounds";
import { STORE_ITEMS } from "@/lib/data/store";
import { STORE_SEASON_LIMITS } from "@/lib/game/constants";
import { cn } from "@/lib/utils";
import type { CsCase, PlayerState, StoreItem, StoreItemKind } from "@/lib/types/game";

type StorePanelProps = {
  player: PlayerState;
  onBuy: (itemId: string) => { caseToOpen: CsCase | null; error: string | null };
  onCaseReady: (csCase: CsCase) => void;
  onClose: () => void;
};

const KIND_LABEL: Record<StoreItemKind, string> = {
  case: "Cajas",
  skin: "Skins",
  coaching: "Coaching",
  peripheral: "Periféricos",
};

function money(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value}`;
}

function StoreRow({
  item,
  player,
  onBuy,
  onCaseReady,
}: {
  item: StoreItem;
  player: PlayerState;
  onBuy: StorePanelProps["onBuy"];
  onCaseReady: (csCase: CsCase) => void;
}) {
  const owned = item.unique && player.storeOwned.includes(item.id);
  const canAfford = player.earnings >= item.price;
  const seasonBuys = player.storeSeasonPurchases ?? { coaching: 0, cases: 0 };
  const seasonBlocked =
    (item.kind === "coaching" &&
      seasonBuys.coaching >= STORE_SEASON_LIMITS.coaching) ||
    (item.grantsCase === true &&
      seasonBuys.cases >= STORE_SEASON_LIMITS.cases);

  const purchase = () => {
    const result = onBuy(item.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    playCoinCollect();
    toast.success(`Compraste ${item.name}`);
    if (result.caseToOpen) {
      onCaseReady(result.caseToOpen);
    }
  };

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/40 px-2.5 py-2">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/50 bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imagePath ?? "/ui/cs2-case.webp"}
          alt=""
          className="size-11 object-contain"
          draggable={false}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight">{item.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {item.description}
        </p>
        {item.buff && (
          <p className="text-[11px] font-semibold text-primary">
            +{item.buff.amount} {item.buff.attribute}
            {item.id === "coach-utility" ? " · +1 gameSense" : ""}
            {item.id === "peri-keyboard" ? " · +1 aim" : ""}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-black tabular-nums text-primary">
          {money(item.price)}
        </span>
        <Button
          size="sm"
          className="h-7 px-2.5 text-[11px]"
          disabled={owned || !canAfford || seasonBlocked}
          onClick={purchase}
        >
          {owned ? "Comprado" : seasonBlocked ? "Límite año" : "Comprar"}
        </Button>
      </div>
    </div>
  );
}

/** Compact career store — spends from earnings balance. */
export function StorePanel({
  player,
  onBuy,
  onCaseReady,
  onClose,
}: StorePanelProps) {
  const groups = (["case", "skin", "coaching", "peripheral"] as StoreItemKind[]).map(
    (kind) => ({
      kind,
      items: STORE_ITEMS.filter((item) => item.kind === kind),
    }),
  );

  return (
    <div className="flex max-h-[min(78vh,640px)] flex-col gap-2">
      <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Tienda
          </p>
          <h2 className="text-lg font-black uppercase tracking-tight">
            Market del jugador
          </h2>
          <p className="text-xs text-muted-foreground">
            Se gasta del saldo de ganancias. Coaching y cajas tienen límite por
            temporada (año).
          </p>
          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
            Esta temporada: coaching{" "}
            {(player.storeSeasonPurchases ?? { coaching: 0 }).coaching}/
            {STORE_SEASON_LIMITS.coaching} · cajas{" "}
            {(player.storeSeasonPurchases ?? { cases: 0 }).cases}/
            {STORE_SEASON_LIMITS.cases}
          </p>
        </div>
        <div className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Saldo
          </p>
          <p className="text-base font-black tabular-nums text-primary">
            {money(player.earnings)}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {groups.map((group) => (
          <section key={group.kind} className="space-y-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {KIND_LABEL[group.kind]}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <StoreRow
                  key={item.id}
                  item={item}
                  player={player}
                  onBuy={onBuy}
                  onCaseReady={onCaseReady}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="flex shrink-0 justify-end border-t border-border/50 pt-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cerrar tienda
        </Button>
      </div>
    </div>
  );
}

export function StoreBalanceChip({
  earnings,
  className,
}: {
  earnings: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-primary",
        className,
      )}
    >
      {money(earnings)}
    </span>
  );
}
