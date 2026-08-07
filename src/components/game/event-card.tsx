"use client";

import { MapArt } from "@/components/art/map-art";
import { ChoiceButton } from "@/components/game/choice-button";
import { GameLoader } from "@/components/game/game-loader";
import { getMapById } from "@/lib/data/maps";
import { cn } from "@/lib/utils";
import type { GameEvent } from "@/lib/types/game";

type EventCardProps = {
  event: GameEvent;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
  /** Localized transition loader over the options panel only. */
  loading?: boolean;
  /** When true, minigame options resolve as normal choices (no skill check). */
  minigameLocked?: boolean;
  className?: string;
};

const CATEGORY_LABELS: Record<GameEvent["category"], string> = {
  career: "Carrera",
  team: "Equipo",
  personal: "Personal",
  match: "Partido",
  transfer: "Mercado",
  meta: "Meta",
  lockerRoom: "Vestuario",
};

export function EventCard({
  event,
  onSelect,
  disabled,
  loading = false,
  minigameLocked = false,
  className,
}: EventCardProps) {
  const map = event.mapId ? getMapById(event.mapId) : null;
  const choicesLocked = disabled || loading;

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60",
        className,
      )}
    >
      {/* Hero — shorter on phones so choices stay tappable */}
      <div className="relative min-h-[110px] max-h-[34%] shrink-0 sm:min-h-0 sm:max-h-none sm:flex-1">
        <MapArt
          mapId={event.mapId}
          scene={event.scene ?? "map"}
          className="h-full w-full"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10 sm:p-4 sm:pt-12">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-sm shadow-primary/40">
              {CATEGORY_LABELS[event.category]}
            </span>
            {map && (
              <span className="rounded border border-white/25 bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                {map.name}
              </span>
            )}
          </div>
          <h2 className="text-xl font-black uppercase leading-none tracking-tight drop-shadow-lg sm:text-2xl md:text-3xl">
            {event.title}
          </h2>
        </div>
      </div>

      {/* Options — scrollable on short viewports */}
      <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto border-t border-border/50 p-2.5 sm:p-3">
        {loading && <GameLoader compact />}

        <p className="animate-fade-up shrink-0 text-[13px] leading-snug text-muted-foreground sm:text-sm">
          {event.description}
        </p>

        <div
          className="grid min-h-0 flex-1 gap-2"
          style={{
            gridTemplateRows: `repeat(${event.options.length}, minmax(min(4.75rem, auto), 1fr))`,
          }}
        >
          {event.options.map((option, index) => (
            <ChoiceButton
              key={option.id}
              option={option}
              index={index}
              onSelect={onSelect}
              disabled={choicesLocked}
              minigameLocked={minigameLocked}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
