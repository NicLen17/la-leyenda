"use client";

import { Button } from "@/components/ui/button";
import { RARITY_META } from "@/lib/data/cases";
import { cn } from "@/lib/utils";
import type { CaseItem } from "@/lib/types/game";

type OutcomeCardProps = {
  text: string;
  graffitiName: string | null;
  caseItem: CaseItem | null;
  onContinue: () => void;
  className?: string;
};

export function OutcomeCard({
  text,
  graffitiName,
  caseItem,
  onContinue,
  className,
}: OutcomeCardProps) {
  const rarity = caseItem ? RARITY_META[caseItem.rarity] : null;

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col items-center justify-center gap-4 rounded-xl border border-border/70 bg-card/60 p-6 text-center",
        className,
      )}
    >
      <span className="animate-fade-up text-[10px] font-semibold uppercase tracking-[0.35em] text-primary">
        Resultado
      </span>

      <p className="animate-fade-up max-w-lg text-lg font-medium leading-snug">
        {text}
      </p>

      {graffitiName && (
        <div className="animate-card-in rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Graffiti desbloqueado
          </p>
          <p className="text-base font-black">{graffitiName}</p>
        </div>
      )}

      {caseItem && rarity && (
        <div
          className="animate-card-in rounded-lg border px-4 py-2"
          style={{ borderColor: rarity.color, backgroundColor: `${rarity.color}1a` }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: rarity.color }}
          >
            {rarity.label}
          </p>
          <p className="text-base font-black">
            {caseItem.weapon} | {caseItem.name}
          </p>
        </div>
      )}

      <Button onClick={onContinue} size="lg" className="animate-fade-up">
        Continuar
      </Button>
    </section>
  );
}
