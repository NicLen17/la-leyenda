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
import { StorePanel } from "@/components/game/store-panel";
import { TransferMarket } from "@/components/game/transfer-market";
import { CaseOpening } from "@/components/minigames/case-opening";
import { MinigameHost } from "@/components/minigames/minigame-host";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { randomCase } from "@/lib/data/cases";
import { useGame } from "@/lib/game/game-context";
import { loadSetup } from "@/lib/game/storage";
import type { CsCase } from "@/lib/types/game";

export default function PlayPage() {
  const router = useRouter();
  const {
    runtime,
    loading,
    start,
    pickArchetype,
    choose,
    finishMinigame,
    next,
    nextSeason,
    signWith,
    unbox,
    buyItem,
    reset,
  } = useGame();

  const [csCase, setCsCase] = useState<CsCase | null>(null);
  const [storeOpen, setStoreOpen] = useState(false);

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

  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 gap-2.5 p-2.5">
      {loading && <GameLoader />}

      {player && runtime.phase !== "retired" && runtime.phase !== "archetype" && (
        <div className="hidden w-[300px] shrink-0 xl:w-[320px] lg:block">
          <PlayerCard player={player} className="h-full" />
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        {/* status strip */}
        {player && runtime.phase !== "retired" && (
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-1.5">
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {player.year} · Split {((player.currentSplit - 1) % 2) + 1} ·{" "}
              {player.age} años · {player.team.name}
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1 px-2.5 text-[11px] font-bold"
                onClick={() => setStoreOpen(true)}
              >
                Tienda
              </Button>
              {player.casesAvailable > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 gap-1 px-2.5 text-[11px]"
                  onClick={() => setCsCase(randomCase())}
                >
                  <span className="text-amber-400">◆</span>
                  {player.casesAvailable} caja
                  {player.casesAvailable > 1 ? "s" : ""}
                </Button>
              )}
              <CareerTimeline log={player.careerLog} />
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1">
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
              className="h-full"
            />
          )}

          {runtime.phase === "minigame" &&
            runtime.pendingOption?.minigame &&
            player && (
              <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60">
                <div className="relative h-[20%] min-h-[88px] shrink-0">
                  <MapArt
                    mapId={runtime.currentEvent?.mapId}
                    scene={runtime.currentEvent?.scene ?? "map"}
                    className="h-full w-full"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
                      Momento decisivo
                    </p>
                    <h2 className="text-lg font-black uppercase leading-none tracking-tight drop-shadow">
                      {runtime.pendingOption.label}
                    </h2>
                  </div>
                </div>
                <div className="min-h-0 flex-1 p-3">
                  <MinigameHost
                    kind={runtime.pendingOption.minigame}
                    player={player}
                    onComplete={finishMinigame}
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
              onContinue={nextSeason}
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
              className="mx-auto h-full max-w-3xl"
            />
          )}
        </div>
      </div>

      <Dialog
        open={csCase !== null}
        onOpenChange={(open) => !open && setCsCase(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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
        <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-xl">
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
    </div>
  );
}
