"use client";

import { cn } from "@/lib/utils";
import type { EventOption, StatEffects } from "@/lib/types/game";

type ChoiceButtonProps = {
  option: EventOption;
  index: number;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
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
  spray: "Minijuego: Spray",
  defuse: "Minijuego: Defuse",
  coinflip: "Minijuego: Moneda CT/T",
  case: "Abrir caja",
};

function formatEffect(key: keyof StatEffects, value: number): string {
  const label = EFFECT_LABELS[key] ?? key;
  if (key === "earnings" || key === "salaryMonthly") {
    const sign = value > 0 ? "+" : "-";
    return `${label} ${sign}$${Math.abs(value).toLocaleString("es-AR")}`;
  }
  return `${label} ${value > 0 ? "+" : ""}${value}`;
}

export function ChoiceButton({
  option,
  index,
  onSelect,
  disabled,
}: ChoiceButtonProps) {
  const effects = Object.entries(option.effects).filter(
    ([, value]) => typeof value === "number" && value !== 0,
  ) as [keyof StatEffects, number][];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option.id)}
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        "animate-card-in group relative w-full overflow-hidden rounded-lg border border-border/70 bg-card/70 p-2.5 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-primary/70 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold leading-tight">{option.label}</p>
        <div className="flex shrink-0 gap-1">
          {option.risk && (
            <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-destructive">
              Riesgo
            </span>
          )}
          {option.minigame && (
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
              {MINIGAME_LABELS[option.minigame] ?? "Minijuego"}
            </span>
          )}
          {option.grantsCase && !option.minigame && (
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
              Caja
            </span>
          )}
        </div>
      </div>

      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
        {option.description}
      </p>

      {effects.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {effects.map(([key, value]) => (
            <span
              key={key}
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums",
                key === "tilt" || key === "benchRisk"
                  ? value > 0
                    ? "bg-destructive/15 text-destructive"
                    : "bg-primary/15 text-primary"
                  : value > 0
                    ? "bg-primary/15 text-primary"
                    : "bg-destructive/15 text-destructive",
              )}
            >
              {formatEffect(key, value)}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
