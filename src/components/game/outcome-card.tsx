"use client";

import { useEffect } from "react";

import { MapArt } from "@/components/art/map-art";
import { Button } from "@/components/ui/button";
import { playOutcomeCue } from "@/lib/audio/sounds";
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
  {
    label: string;
    accent: string;
    icon: string;
    gradient: string;
  }
> = {
  win: {
    label: "Victoria",
    accent: "text-emerald-300",
    icon: "/ui/outcome-win.svg",
    gradient:
      "bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.45)_0%,rgba(16,185,129,0.18)_42%,transparent_70%)]",
  },
  clutch: {
    label: "Clutch",
    accent: "text-amber-300",
    icon: "/ui/outcome-clutch.svg",
    gradient:
      "bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.48)_0%,rgba(245,158,11,0.2)_42%,transparent_70%)]",
  },
  fail: {
    label: "Fallaste",
    accent: "text-red-300",
    icon: "/ui/outcome-fail.svg",
    gradient:
      "bg-[radial-gradient(ellipse_at_center,rgba(248,113,113,0.48)_0%,rgba(239,68,68,0.2)_42%,transparent_70%)]",
  },
  transfer: {
    label: "Mercado",
    accent: "text-sky-300",
    icon: "/ui/outcome-transfer.svg",
    gradient:
      "bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.4)_0%,rgba(14,165,233,0.16)_42%,transparent_70%)]",
  },
  case: {
    label: "Unbox",
    accent: "text-amber-200",
    icon: "/ui/cs2-case.webp",
    gradient:
      "bg-[radial-gradient(ellipse_at_center,rgba(252,211,77,0.42)_0%,rgba(245,158,11,0.16)_42%,transparent_70%)]",
  },
  training: {
    label: "Entrenamiento",
    accent: "text-emerald-300",
    icon: "/ui/outcome-training.svg",
    gradient:
      "bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.36)_0%,rgba(16,185,129,0.14)_42%,transparent_70%)]",
  },
  neutral: {
    label: "Resultado",
    accent: "text-primary",
    icon: "/ui/outcome-neutral.svg",
    gradient:
      "bg-[radial-gradient(ellipse_at_center,rgba(251,146,60,0.32)_0%,rgba(234,88,12,0.12)_42%,transparent_70%)]",
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

  useEffect(() => {
    playOutcomeCue(kind);
  }, [kind]);

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60",
        className,
      )}
    >
      <div className="relative h-[38%] min-h-[160px] shrink-0">
        <MapArt
          mapId={mapId}
          scene={scene ?? (mapId ? "map" : "arena")}
          className="h-full w-full"
        />
        <div className={cn("absolute inset-0", meta.gradient)} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <div
            className={cn(
              kind === "win" || kind === "fail"
                ? "animate-risk-result-pulse"
                : undefined,
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meta.icon}
              alt=""
              className={cn(
                "size-20 drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] sm:size-24",
                kind === "win" || kind === "fail"
                  ? "animate-crest-in"
                  : "animate-fade-up",
              )}
            />
          </div>
          <p
            className={cn(
              "text-sm font-bold uppercase tracking-[0.28em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]",
              meta.accent,
              kind === "win" || kind === "fail"
                ? "animate-stat-pop"
                : "animate-fade-up",
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
