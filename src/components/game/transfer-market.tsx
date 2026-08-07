"use client";

import { TeamLogo } from "@/components/art/team-logo";
import { AnimatedNumber } from "@/components/game/animated-number";
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
    <section className={cn("flex h-full min-h-0 flex-col gap-3", className)}>
      <header className="shrink-0 space-y-1.5 px-0.5">
        <h2 className="text-lg font-black uppercase leading-none tracking-tight sm:text-xl">
          Mercado de pases
        </h2>
        <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
          Rating {access.rating.toFixed(2)} · skill {Math.round(access.skill)} ·
          fama {player.fame} · {player.majors} Major(s) — las orgs miran demos,
          no al agente.
        </p>
        <p className="text-[11px] font-semibold leading-snug text-sky-300/90">
          {access.label}
          <span className="font-normal text-muted-foreground">
            {" "}
            · techo de scouting {access.maxPrestige} · {access.nextStep}
          </span>
        </p>
      </header>

      {/*
        Content-sized rows (never 1fr): auto-rows-fr was collapsing every offer
        into the viewport height and stacking them on top of each other on mobile.
      */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [-webkit-overflow-scrolling:touch]">
        <ul className="m-0 grid list-none grid-cols-1 content-start gap-3 p-0 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-3.5">
          {offers.map((offer, index) => {
            const isRenewal = offer.team.id === player.team.id;
            const isBest = offer.salaryMonthly === best;
            const actionLabel = isRenewal ? "Renovar" : "Firmar";

            const { primary, secondary } = offer.team.colors;

            return (
              <li key={offer.team.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => onAccept(offer.team.id)}
                  aria-label={`${actionLabel} con ${offer.team.name} — $${offer.salaryMonthly.toLocaleString("es-AR")}/mes`}
                  style={{
                    animationDelay: `${index * 55}ms`,
                    borderColor: isRenewal ? `${primary}99` : `${primary}40`,
                    background: `linear-gradient(155deg, ${secondary}f0 0%, ${secondary}cc 48%, ${primary}1f 100%)`,
                    boxShadow: `inset 0 1px 0 ${primary}33, 0 0 0 1px ${primary}14`,
                  }}
                  className={cn(
                    "animate-card-in relative flex w-full touch-manipulation flex-col gap-2.5 overflow-hidden rounded-xl border p-3.5 text-left transition-all",
                    "hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "active:translate-y-0 active:brightness-95",
                  )}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
                    }}
                  />
                  <div className="pointer-events-none absolute -right-3 -top-1 opacity-[0.12]">
                    <TeamLogo team={offer.team} size={104} bare />
                  </div>

                  <div className="relative flex items-center gap-2.5">
                    <TeamLogo team={offer.team} size={40} animate />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black uppercase leading-tight tracking-tight">
                        {offer.team.name}
                      </p>
                      <p className="mt-1 text-[10px] leading-none text-muted-foreground">
                        Tier {offer.team.tier} · Prestigio {offer.team.prestige}
                      </p>
                    </div>
                    {isRenewal && (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-black"
                        style={{ backgroundColor: primary }}
                      >
                        Renovación
                      </span>
                    )}
                  </div>

                  <div className="relative flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span style={isBest ? { color: primary } : undefined}>
                      <AnimatedNumber
                        value={offer.salaryMonthly}
                        grouped
                        prefix="$"
                        className="text-xl font-black leading-none"
                      />
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      /mes · {offer.years} año{offer.years > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="relative flex flex-wrap gap-1.5">
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

                  <p className="relative line-clamp-3 min-h-[2.6em] text-[11px] leading-snug text-muted-foreground">
                    {offer.note}
                  </p>

                  <span
                    className={cn(
                      "relative mt-0.5 flex h-10 w-full shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      isRenewal
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                    aria-hidden
                  >
                    {actionLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
