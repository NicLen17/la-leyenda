"use client";

import { MapArt } from "@/components/art/map-art";
import { ChoiceButton } from "@/components/game/choice-button";
import { getMapById } from "@/lib/data/maps";
import { cn } from "@/lib/utils";
import type { GameEvent } from "@/lib/types/game";

type EventCardProps = {
  event: GameEvent;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
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
  className,
}: EventCardProps) {
  const map = event.mapId ? getMapById(event.mapId) : null;

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60",
        className,
      )}
    >
      {/* situation artwork */}
      <div className="relative h-[26%] min-h-[112px] shrink-0">
        <MapArt
          mapId={event.mapId}
          scene={event.scene ?? "map"}
          className="h-full w-full"
        />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="rounded bg-primary/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary-foreground">
              {CATEGORY_LABELS[event.category]}
            </span>
            {map && (
              <span className="rounded border border-white/20 bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/90">
                {map.name}
              </span>
            )}
          </div>
          <h2 className="text-lg font-black uppercase leading-none tracking-tight drop-shadow-lg">
            {event.title}
          </h2>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <p className="animate-fade-up shrink-0 text-[13px] leading-snug text-muted-foreground">
          {event.description}
        </p>

        <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5 overflow-y-auto">
          {event.options.map((option, index) => (
            <ChoiceButton
              key={option.id}
              option={option}
              index={index}
              onSelect={onSelect}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
