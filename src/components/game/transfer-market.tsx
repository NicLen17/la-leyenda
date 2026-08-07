"use client";

import { TeamLogo } from "@/components/art/team-logo";
import { AnimatedNumber } from "@/components/game/animated-number";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/data/archetypes";
import { evaluateMarketAccess } from "@/lib/game/market-gates";
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
  const access = evaluateMarketAccess(player);

  return (
    <section className={cn("flex h-full min-h-0 flex-col gap-2", className)}>
      <header className="shrink-0 space-y-1">
        <h2 className="text-xl font-black uppercase leading-none tracking-tight">
          Mercado de pases
        </h2>
        <p className="text-xs text-muted-foreground">
          Rating {access.rating.toFixed(2)} · skill {Math.round(access.skill)} ·
          fama {player.fame} · {player.majors} Major(s) — las orgs miran demos,
          no al agente.
        </p>
        <p className="text-[11px] font-semibold text-sky-300/90">
          {access.label}
          <span className="font-normal text-muted-foreground">
            {" "}
            · {access.nextStep}
          </span>
        </p>
      </header>

      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer, index) => {
          const isRenewal = offer.team.id === player.team.id;
          const isBest = offer.salaryMonthly === best;

          const { primary, secondary } = offer.team.colors;

          return (
            <article
              key={offer.team.id}
              style={{
                animationDelay: `${index * 55}ms`,
                borderColor: isRenewal ? `${primary}99` : `${primary}40`,
                background: `linear-gradient(155deg, ${secondary}f0 0%, ${secondary}cc 48%, ${primary}1f 100%)`,
                boxShadow: `inset 0 1px 0 ${primary}33, 0 0 0 1px ${primary}14`,
              }}
              className="animate-card-in relative flex flex-col gap-1.5 overflow-hidden rounded-lg border p-2.5"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
                }}
              />
              {/* watermark crest */}
              <div className="pointer-events-none absolute -right-3 -top-1 opacity-[0.12]">
                <TeamLogo team={offer.team} size={104} bare />
              </div>

              <div className="relative flex items-center gap-2">
                <TeamLogo team={offer.team} size={36} animate />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black uppercase leading-none tracking-tight">
                    {offer.team.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Tier {offer.team.tier} · Prestigio {offer.team.prestige}
                  </p>
                </div>
                {isRenewal && (
                  <span
                    className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-black"
                    style={{ backgroundColor: primary }}
                  >
                    Renovación
                  </span>
                )}
              </div>

              <div className="relative flex items-baseline gap-1.5">
                <span style={isBest ? { color: primary } : undefined}>
                  <AnimatedNumber
                    value={offer.salaryMonthly}
                    grouped
                    prefix="$"
                    className="text-lg font-black leading-none"
                  />
                </span>
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
