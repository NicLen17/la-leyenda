"use client";

import { playMenuClick } from "@/lib/audio/sounds";
import {
  CORE_ATTRIBUTES,
  previewOptionEffects,
  previewRiskFailEffects,
} from "@/lib/game/rewards";
import { cn } from "@/lib/utils";
import type { EventOption, StatEffects } from "@/lib/types/game";

const CORE_SET = new Set<string>(CORE_ATTRIBUTES);

type ChoiceButtonProps = {
  option: EventOption;
  index: number;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  /** Hide skill-check badges when another minigame was already left this split. */
  minigameLocked?: boolean;
  className?: string;
};

const EFFECT_LABELS: Partial<Record<keyof StatEffects, string>> = {
  aim: "Aim",
  reflexes: "Reflejos",
  gameSense: "Game sense",
  utility: "Utility",
  clutch: "Clutch",
  movement: "Movement",
  fame: "Fama",
  chemistry: "Química",
  form: "Forma",
  tilt: "Tilt",
  salaryMonthly: "Sueldo",
  earnings: "Ganancias",
  transferBoost: "Mercado",
  benchRisk: "Riesgo banca",
};

const MINIGAME_LABELS: Record<string, string> = {
  flick: "Minijuego: Aim",
  reaction: "Minijuego: Reacción",
  defuse: "Minijuego: Defuse",
  coinflip: "Minijuego: Moneda CT/T",
  case: "Abrir caja",
  hold: "Minijuego: Hold",
  lineup: "Minijuego: Lineup",
  retake: "Minijuego: Retake",
  economy: "Minijuego: Economía",
  awpPeek: "Minijuego: Hold AWP",
  plant: "Minijuego: Plant",
};

function formatEffect(key: keyof StatEffects, value: number): string {
  const label = EFFECT_LABELS[key] ?? key;
  if (key === "earnings" || key === "salaryMonthly") {
    const sign = value > 0 ? "+" : "-";
    return `${label} ${sign}$${Math.abs(value).toLocaleString("es-AR")}`;
  }
  return `${label} ${value > 0 ? "+" : ""}${value}`;
}

function effectTone(
  key: keyof StatEffects,
  value: number,
): string {
  if (key === "tilt" || key === "benchRisk") {
    return value > 0
      ? "border-rose-500/40 bg-rose-500/20 text-rose-300"
      : "border-emerald-500/40 bg-emerald-500/20 text-emerald-300";
  }
  if (CORE_SET.has(key)) {
    return value > 0
      ? "border-sky-400/55 bg-sky-500/20 text-sky-200"
      : "border-rose-500/40 bg-rose-500/20 text-rose-300";
  }
  if (key === "fame") {
    return value > 0
      ? "border-amber-400/35 bg-amber-500/15 text-amber-200/90"
      : "border-rose-500/35 bg-rose-500/15 text-rose-300/90";
  }
  return value > 0
    ? "border-border/70 bg-background/40 text-muted-foreground"
    : "border-rose-500/35 bg-rose-500/15 text-rose-300/90";
}

function sortedEntries(effects: StatEffects): [keyof StatEffects, number][] {
  return Object.entries(effects)
    .filter(([, value]) => typeof value === "number" && value !== 0)
    .sort(([a], [b]) => {
      const aCore = CORE_SET.has(a) ? 0 : 1;
      const bCore = CORE_SET.has(b) ? 0 : 1;
      return aCore - bCore;
    }) as [keyof StatEffects, number][];
}

function EffectChips({ effects }: { effects: StatEffects }) {
  const entries = sortedEntries(effects);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap content-start gap-1">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className={cn(
            "rounded border px-1.5 py-0.5 text-[9px] font-semibold tabular-nums",
            effectTone(key, value),
          )}
        >
          {formatEffect(key, value)}
        </span>
      ))}
    </div>
  );
}

export function ChoiceButton({
  option,
  index,
  onSelect,
  disabled,
  minigameLocked = false,
  className,
}: ChoiceButtonProps) {
  const winEffects = previewOptionEffects(option, minigameLocked);
  const failEffects = option.risk ? previewRiskFailEffects(option) : {};
  const showMinigame = Boolean(option.minigame) && !minigameLocked;
  const showRiskSplit = Boolean(option.risk) && !showMinigame;

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => {
        if (disabled) return;
        playMenuClick();
      }}
      onFocus={(event) => {
        if (disabled) return;
        if (event.currentTarget.matches(":hover")) return;
        playMenuClick();
      }}
      onClick={() => onSelect(option.id)}
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        "animate-card-in group relative box-border flex h-full min-h-[4.5rem] w-full flex-col rounded-md border border-border/70 bg-card/70 px-2.5 py-2 text-left transition-all sm:min-h-0 sm:px-3 sm:py-2.5",
        "hover:-translate-y-0.5 hover:border-primary/70 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-[13px] font-bold leading-tight">
            {option.label}
          </p>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {option.risk && (
              <span className="rounded border border-rose-500/45 bg-rose-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-300">
                Riesgo
              </span>
            )}
            {showMinigame && option.minigame && (
              <span className="rounded border border-primary/50 bg-primary/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                {MINIGAME_LABELS[option.minigame] ?? "Minijuego"}
              </span>
            )}
            {option.grantsCase && !showMinigame && (
              <span className="rounded border border-amber-400/50 bg-amber-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                Caja
              </span>
            )}
          </div>
        </div>

        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
          {option.description}
        </p>

        <div className="mt-auto flex min-h-[22px] flex-col gap-1 pt-1">
          {showRiskSplit ? (
            <>
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400/90">
                  Si sale
                </span>
                <EffectChips effects={winEffects} />
              </div>
              <div className="flex items-start gap-1.5">
                <span className="shrink-0 pt-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-400/90">
                  Si falla
                </span>
                <EffectChips effects={failEffects} />
              </div>
            </>
          ) : (
            <EffectChips effects={winEffects} />
          )}
        </div>
      </div>
    </button>
  );
}
