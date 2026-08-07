"use client";

import { cn } from "@/lib/utils";
import type { Archetype } from "@/lib/types/game";

type ArchetypePickerProps = {
  options: Archetype[];
  onPick: (archetypeId: string) => void;
  className?: string;
};

const TAG_ICONS: Record<string, string> = {
  RECOIL: "M4 20 L12 4 L20 20",
  "PRE-AIM": "M12 3v18M3 12h18",
  NADES: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
  "1vX": "M5 19 19 5M5 5l14 14",
  ECO: "M4 18h4v-6H4zM10 18h4V8h-4zM16 18h4V4h-4z",
  MOVE: "M3 12h18M15 6l6 6-6 6",
};

/** Three random CS archetypes, like El Ídolo's opening dice roll. */
export function ArchetypePicker({
  options,
  onPick,
  className,
}: ArchetypePickerProps) {
  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col items-center justify-start gap-3 overflow-y-auto px-3 py-3 sm:justify-center sm:gap-4 sm:px-4",
        className,
      )}
    >
      <header className="shrink-0 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
          El talento que te tocó
        </p>
        <h2 className="text-xl font-black uppercase tracking-tight sm:text-2xl">
          Elegí tu arquetipo
        </h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          No elegís cómo nacés. Estas son las tres cartas que te tocaron: cada
          una define en qué parte del Counter-Strike sos superior.
        </p>
      </header>

      <div className="grid w-full max-w-4xl gap-2.5 sm:grid-cols-3 sm:gap-3">
        {options.map((archetype, index) => (
          <button
            key={archetype.id}
            type="button"
            onClick={() => onPick(archetype.id)}
            style={{ animationDelay: `${index * 90}ms` }}
            className="animate-card-in group flex min-h-[7.5rem] touch-manipulation flex-col gap-2 rounded-xl border border-border/70 bg-card/70 p-3.5 text-left transition-all hover:-translate-y-1 hover:border-primary hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-0 sm:p-4"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-primary" fill="none" strokeWidth="2" strokeLinecap="round">
                  <path d={TAG_ICONS[archetype.tag] ?? TAG_ICONS.MOVE} />
                </svg>
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                  {archetype.tag}
                </p>
                <p className="text-base font-black uppercase leading-none tracking-tight">
                  {archetype.label}
                </p>
              </div>
            </div>

            <p className="text-xs leading-snug text-muted-foreground">
              {archetype.flavour}
            </p>

            <p className="mt-auto rounded-md bg-primary/10 px-2 py-1 text-center text-[11px] font-bold text-primary">
              {archetype.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
