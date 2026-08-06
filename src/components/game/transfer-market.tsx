"use client";

import { TeamLogo } from "@/components/art/team-logo";
import { AnimatedNumber } from "@/components/game/animated-number";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/data/archetypes";
import { cn } from "@/lib/utils";
import type { PlayerState, TeamOffer } from "@/lib/types/game";

type TransferMarketProps = {
  offers: TeamOffer[];
  player: PlayerState;
  onAccept: (teamId: string) => void;
  className?: string;
};

/**
 * The market screen mirrors what a real agent would show: who called, what they
 * pay, what role they promise and what you give up by leaving.
 */
export function TransferMarket({
  offers,
  player,
  onAccept,
  className,
}: TransferMarketProps) {
  const best = offers.reduce(
    (max, offer) => Math.max(max, offer.salaryMonthly),
    0,
  );

  return (
    <section className={cn("flex h-full min-h-0 flex-col gap-2", className)}>
      <header className="shrink-0">
        <h2 className="text-xl font-black uppercase leading-none tracking-tight">
          Mercado de pases
        </h2>
        <p className="text-xs text-muted-foreground">
          Tu rating de {player.rating.toFixed(2)} y {player.fame} de fama
          trajeron estas ofertas. ¿Gloria o billetera?
        </p>
      </header>

      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer, index) => {
          const isRenewal = offer.team.id === player.team.id;
          const isBest = offer.salaryMonthly === best;

          return (
            <article
              key={offer.team.id}
              style={{ animationDelay: `${index * 55}ms` }}
              className={cn(
                "animate-card-in relative flex flex-col gap-1.5 overflow-hidden rounded-lg border bg-card/70 p-2.5",
                isRenewal ? "border-primary/60" : "border-border/70",
              )}
            >
              {/* watermark crest */}
              <div className="pointer-events-none absolute -right-4 -top-2 opacity-[0.07]">
                <TeamLogo team={offer.team} size={104} />
              </div>

              <div className="relative flex items-center gap-2">
                <TeamLogo team={offer.team} size={30} animate />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black uppercase leading-none tracking-tight">
                    {offer.team.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Tier {offer.team.tier} · Prestigio {offer.team.prestige}
                  </p>
                </div>
                {isRenewal && (
                  <span className="rounded bg-primary px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-primary-foreground">
                    Renovación
                  </span>
                )}
              </div>

              <div className="relative flex items-baseline gap-1.5">
                <AnimatedNumber
                  value={offer.salaryMonthly}
                  grouped
                  prefix="$"
                  className={cn(
                    "text-lg font-black leading-none",
                    isBest ? "text-primary" : "",
                  )}
                />
                <span className="text-[10px] text-muted-foreground">
                  /mes · {offer.years} año{offer.years > 1 ? "s" : ""}
                </span>
              </div>

              <div className="relative flex flex-wrap gap-1">
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                  {ROLE_LABELS[offer.role]}
                </span>
                {offer.starRole && (
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                    Estrella
                  </span>
                )}
                {offer.benchRisk && (
                  <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-destructive">
                    Riesgo banca
                  </span>
                )}
                {offer.fameDelta !== 0 && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      offer.fameDelta > 0
                        ? "bg-primary/15 text-primary"
                        : "bg-destructive/15 text-destructive",
                    )}
                  >
                    Fama {offer.fameDelta > 0 ? "+" : ""}
                    {offer.fameDelta}
                  </span>
                )}
              </div>

              <p className="relative text-[10px] leading-snug text-muted-foreground">
                {offer.note}
              </p>

              <Button
                size="sm"
                variant={isRenewal ? "default" : "secondary"}
                className="relative mt-auto h-7 w-full text-[11px]"
                onClick={() => onAccept(offer.team.id)}
              >
                {isRenewal ? "Renovar" : "Firmar"}
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
