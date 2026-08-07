"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MapArt } from "@/components/art/map-art";
import { ArchetypePicker } from "@/components/game/archetype-picker";
import { CareerTimeline } from "@/components/game/career-timeline";
import { EventCard } from "@/components/game/event-card";
import { GameLoader } from "@/components/game/game-loader";
import { OutcomeCard } from "@/components/game/outcome-card";
import { PlayerCard } from "@/components/game/player-card";
import { RetirementCard } from "@/components/game/retirement-card";
import { SeasonSummary } from "@/components/game/season-summary";
import { InventoryPanel } from "@/components/game/inventory-panel";
import { MuteButton } from "@/components/game/mute-button";
import { StorePanel } from "@/components/game/store-panel";
import { TransferMarket } from "@/components/game/transfer-market";
import { CaseOpening } from "@/components/minigames/case-opening";
import { MinigameHost } from "@/components/minigames/minigame-host";
import { RiskGauge } from "@/components/minigames/risk-gauge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { randomCase } from "@/lib/data/cases";
import { careerYearsLeft } from "@/lib/game/constants";
import { useGame } from "@/lib/game/game-context";
import { loadSetup } from "@/lib/game/storage";
import type { CsCase } from "@/lib/types/game";
import {
  Backpack,
  CalendarDays,
  DoorOpen,
  ShoppingBag,
  UserRound,
} from "lucide-react";

export default function PlayPage() {
  const router = useRouter();
  const {
    runtime,
    loading,
    start,
    pickArchetype,
    choose,
    finishMinigame,
    finishRisk,
    riskChance,
    next,
    nextSeason,
    signWith,
    unbox,
    buyItem,
    retireNow,
    reset,
  } = useGame();

  const [csCase, setCsCase] = useState<CsCase | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);

  // Boot the career from the setup saved on the landing page.
  useEffect(() => {
    if (runtime.phase !== "setup") return;
    const setup = loadSetup();
    if (!setup) {
      router.replace("/");
      return;
    }
    start(setup);
  }, [router, runtime.phase, start]);

  const player = runtime.state;

  const eventLoading = loading && runtime.phase === "event";
  const panelLoading = loading && runtime.phase !== "event";

  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 gap-2 p-2 sm:gap-2.5 sm:p-2.5">
      {player && runtime.phase !== "retired" && runtime.phase !== "archetype" && (
        <div className="hidden w-[300px] shrink-0 lg:block xl:w-[320px]">
          <PlayerCard
            player={player}
            className="h-full"
            onOpenCases={
              player.casesAvailable > 0
                ? () => setCsCase(randomCase())
                : undefined
            }
          />
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        {/* status strip — stays usable while the options panel transitions */}
        {player && runtime.phase !== "retired" && (
          <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card/80 to-card/60 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/35 bg-primary/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary sm:px-2.5 sm:text-[11px]">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                T{player.year}
                <span className="hidden sm:inline"> · Temporada {player.year}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-400/30 bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-300 sm:px-2.5 sm:text-[11px]">
                Split {((player.currentSplit - 1) % 2) + 1}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground sm:px-2.5 sm:text-[11px]">
                <UserRound className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                {player.age}a
              </span>
              <span
                className="max-w-[9rem] truncate text-[10px] font-bold uppercase tracking-wider sm:max-w-none sm:text-[11px]"
                style={{ color: player.team.colors.primary }}
              >
                {player.team.name}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
              <Button
                size="sm"
                variant="outline"
                className="h-9 shrink-0 gap-1.5 border-border/70 bg-background/40 px-2.5 text-xs font-bold lg:hidden"
                onClick={() => setPlayerOpen(true)}
                aria-label="Ver ficha del jugador"
              >
                <UserRound className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Jugador</span>
              </Button>
              {player.casesAvailable > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-9 shrink-0 gap-1.5 px-2.5 text-xs font-bold lg:hidden"
                  onClick={() => setCsCase(randomCase())}
                  aria-label={`${player.casesAvailable} caja${player.casesAvailable > 1 ? "s" : ""} disponible${player.casesAvailable > 1 ? "s" : ""}`}
                >
                  <span className="text-amber-400" aria-hidden>
                    ◆
                  </span>
                  {player.casesAvailable}
                  <span className="hidden sm:inline">
                    {" "}
                    caja{player.casesAvailable > 1 ? "s" : ""}
                  </span>
                </Button>
              )}
              <MuteButton className="shrink-0 border-primary/25 bg-background/40 hover:bg-background/70" />
              <Button
                size="sm"
                variant="outline"
                className="h-9 shrink-0 gap-1.5 border-primary/40 bg-primary/10 px-2.5 text-xs font-bold text-primary hover:bg-primary/20 hover:text-primary sm:px-3"
                onClick={() => setStoreOpen(true)}
                aria-label="Tienda"
              >
                <ShoppingBag className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Tienda</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 shrink-0 gap-1.5 border-amber-400/40 bg-amber-500/10 px-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 sm:px-3"
                onClick={() => setInventoryOpen(true)}
                aria-label={`Inventario${player.inventory.length > 0 ? `, ${player.inventory.length} items` : ""}`}
              >
                <Backpack className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">Inventario</span>
                {player.inventory.length > 0 && (
                  <span className="rounded border border-amber-400/40 bg-amber-500/20 px-1.5 py-0.5 text-[10px] tabular-nums">
                    {player.inventory.length}
                  </span>
                )}
              </Button>
              <CareerTimeline log={player.careerLog} compact />
            </div>
          </div>
        )}

        <div className="relative min-h-0 flex-1">
          {/* Non-event transitions: cover only the main panel, not sidebar/store */}
          {panelLoading && <GameLoader className="rounded-xl" />}

          {runtime.phase === "archetype" && (
            <ArchetypePicker
              options={runtime.archetypeOptions}
              onPick={pickArchetype}
            />
          )}

          {runtime.phase === "event" && runtime.currentEvent && (
            <EventCard
              event={runtime.currentEvent}
              onSelect={choose}
              loading={eventLoading}
              minigameLocked={player?.minigameLocked ?? false}
              className="h-full"
            />
          )}

          {runtime.phase === "minigame" &&
            runtime.pendingOption?.minigame &&
            player && (
              <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60">
                <div className="relative hidden h-[18%] min-h-[72px] shrink-0 sm:block sm:h-[22%] sm:min-h-[96px] md:h-[28%] md:min-h-[120px]">
                  <MapArt
                    mapId={runtime.currentEvent?.mapId}
                    scene={runtime.currentEvent?.scene ?? "map"}
                    className="h-full w-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-2.5 sm:p-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary sm:text-[11px]">
                        Momento decisivo
                      </p>
                      <h2 className="truncate text-base font-black uppercase leading-none tracking-tight drop-shadow sm:text-lg">
                        {runtime.pendingOption.label}
                      </h2>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 shrink-0 gap-1.5 border-white/25 bg-black/50 px-2.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-black/70 hover:text-white"
                      onClick={() => finishMinigame(false)}
                    >
                      <DoorOpen className="size-3.5" aria-hidden />
                      Salir
                    </Button>
                  </div>
                </div>
                {/* Mobile compact chrome when map art is hidden */}
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 px-3 py-2 sm:hidden">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Momento decisivo
                    </p>
                    <h2 className="truncate text-sm font-black uppercase leading-tight tracking-tight">
                      {runtime.pendingOption.label}
                    </h2>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 gap-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider"
                    onClick={() => finishMinigame(false)}
                  >
                    <DoorOpen className="size-3.5" aria-hidden />
                    Salir
                  </Button>
                </div>
                <div className="min-h-0 flex-1 p-2 sm:p-3">
                  <MinigameHost
                    kind={runtime.pendingOption.minigame}
                    player={player}
                    onComplete={finishMinigame}
                  />
                </div>
              </div>
            )}

          {runtime.phase === "risk" && runtime.pendingOption && (
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60">
              <div className="relative hidden h-[14%] min-h-[64px] shrink-0 sm:block sm:h-[18%] sm:min-h-[80px] md:h-[22%] md:min-h-[96px]">
                <MapArt
                  mapId={runtime.currentEvent?.mapId}
                  scene={runtime.currentEvent?.scene ?? "map"}
                  className="h-full w-full"
                />
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-destructive sm:text-[11px]">
                    Riesgo
                  </p>
                  <h2 className="truncate text-base font-black uppercase leading-none tracking-tight drop-shadow sm:text-lg">
                    {runtime.pendingOption.label}
                  </h2>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 border-b border-border/50 px-3 py-2 sm:hidden">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive">
                    Riesgo
                  </p>
                  <h2 className="truncate text-sm font-black uppercase leading-tight tracking-tight">
                    {runtime.pendingOption.label}
                  </h2>
                </div>
              </div>
              <div className="min-h-0 flex-1 p-2 sm:p-3">
                <RiskGauge
                  chance={riskChance}
                  label={runtime.pendingOption.label}
                  onComplete={finishRisk}
                />
              </div>
            </div>
          )}

          {runtime.phase === "outcome" && runtime.lastOutcome && (
            <OutcomeCard
              text={runtime.lastOutcome}
              kind={runtime.lastOutcomeKind}
              mapId={runtime.currentEvent?.mapId}
              scene={runtime.currentEvent?.scene}
              graffitiName={runtime.lastRewards.graffitiName}
              caseItem={runtime.lastRewards.caseItem}
              onContinue={next}
              className="h-full"
            />
          )}

          {runtime.phase === "seasonSummary" && runtime.lastSummary && (
            <SeasonSummary
              summary={runtime.lastSummary}
              series={player?.lastSeries ?? null}
              premierRating={player?.premierRating}
              yearsLeft={player ? careerYearsLeft(player.age) : undefined}
              onContinue={nextSeason}
              onRetire={retireNow}
              className="h-full"
            />
          )}

          {runtime.phase === "market" && player && (
            <TransferMarket
              offers={runtime.offers}
              player={player}
              onAccept={signWith}
              className="h-full"
            />
          )}

          {runtime.phase === "retired" && runtime.result && (
            <RetirementCard
              result={runtime.result}
              onPlayAgain={() => {
                reset();
                router.push("/");
              }}
              className="mx-auto h-full w-full max-w-4xl"
            />
          )}
        </div>
      </div>

      <Dialog
        open={csCase !== null}
        onOpenChange={(open) => !open && setCsCase(null)}
      >
        <DialogContent className="overflow-x-hidden overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="sr-only">Abrir caja de CS2</DialogTitle>
          {csCase && (
            <CaseOpening
              csCase={csCase}
              onUnboxed={unbox}
              onClose={() => setCsCase(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={storeOpen} onOpenChange={setStoreOpen}>
        <DialogContent className="overflow-hidden sm:max-w-xl">
          <DialogTitle className="sr-only">Tienda de carrera</DialogTitle>
          {player && (
            <StorePanel
              player={player}
              onBuy={buyItem}
              onCaseReady={(nextCase) => {
                setStoreOpen(false);
                setCsCase(nextCase);
              }}
              onClose={() => setStoreOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={inventoryOpen} onOpenChange={setInventoryOpen}>
        <DialogContent className="overflow-hidden sm:max-w-xl">
          <DialogTitle className="sr-only">Inventario de skins</DialogTitle>
          {player && (
            <InventoryPanel
              player={player}
              onClose={() => setInventoryOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={playerOpen} onOpenChange={setPlayerOpen}>
        <DialogContent
          className="flex flex-col overflow-hidden p-0 sm:max-w-md"
          showCloseButton
        >
          <DialogTitle className="sr-only">Ficha del jugador</DialogTitle>
          {player && (
            <PlayerCard
              player={player}
              className="h-full max-h-[min(88dvh,860px)] rounded-xl border-0 pt-10"
              onOpenCases={
                player.casesAvailable > 0
                  ? () => {
                      setPlayerOpen(false);
                      setCsCase(randomCase());
                    }
                  : undefined
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
