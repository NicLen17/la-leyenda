"use client";

import { MapArt } from "@/components/art/map-art";
import { Button } from "@/components/ui/button";
import { RARITY_META } from "@/lib/data/cases";
import { cn } from "@/lib/utils";
import type { CaseItem, OutcomeKind, SceneKind } from "@/lib/types/game";

type OutcomeCardProps = {
  text: string;
  kind?: OutcomeKind;
  mapId?: string;
  scene?: SceneKind;
  graffitiName: string | null;
  caseItem: CaseItem | null;
  onContinue: () => void;
  className?: string;
};

const OUTCOME_META: Record<
  OutcomeKind,
  { label: string; accent: string; icon: string }
> = {
  win: { label: "Victoria", accent: "text-primary", icon: "/ui/outcome-win.svg" },
  clutch: {
    label: "Clutch",
    accent: "text-amber-400",
    icon: "/ui/outcome-clutch.svg",
  },
  fail: {
    label: "Fallaste",
    accent: "text-destructive",
    icon: "/ui/outcome-fail.svg",
  },
  transfer: {
    label: "Mercado",
    accent: "text-sky-400",
    icon: "/ui/outcome-transfer.svg",
  },
  case: {
    label: "Unbox",
    accent: "text-amber-300",
    icon: "/ui/outcome-case.svg",
  },
  training: {
    label: "Entrenamiento",
    accent: "text-emerald-400",
    icon: "/ui/outcome-training.svg",
  },
  neutral: {
    label: "Resultado",
    accent: "text-primary",
    icon: "/ui/outcome-neutral.svg",
  },
};

export function OutcomeCard({
  text,
  kind = "neutral",
  mapId,
  scene,
  graffitiName,
  caseItem,
  onContinue,
  className,
}: OutcomeCardProps) {
  const rarity = caseItem ? RARITY_META[caseItem.rarity] : null;
  const meta = OUTCOME_META[kind];

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60",
        className,
      )}
    >
      <div className="relative h-[34%] min-h-[140px] shrink-0">
        <MapArt
          mapId={mapId}
          scene={scene ?? (mapId ? "map" : "arena")}
          className="h-full w-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meta.icon}
            alt=""
            className="size-20 drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] animate-fade-up sm:size-24"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p
            className={cn(
              "text-[11px] font-bold uppercase tracking-[0.3em]",
              meta.accent,
            )}
          >
            {meta.label}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-5 text-center">
        <p className="animate-fade-up max-w-xl text-lg font-medium leading-snug sm:text-xl">
          {text}
        </p>

        {graffitiName && (
          <div className="animate-card-in rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Graffiti desbloqueado
            </p>
            <p className="text-base font-black">{graffitiName}</p>
          </div>
        )}

        {caseItem && rarity && (
          <div
            className="animate-card-in rounded-lg border px-4 py-2"
            style={{
              borderColor: rarity.color,
              backgroundColor: `${rarity.color}1a`,
            }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: rarity.color }}
            >
              {rarity.label}
            </p>
            <p className="text-base font-black">
              {caseItem.weapon} | {caseItem.name}
            </p>
          </div>
        )}

        <Button onClick={onContinue} size="lg" className="animate-fade-up mt-1">
          Continuar
        </Button>
      </div>
    </section>
  );
}
