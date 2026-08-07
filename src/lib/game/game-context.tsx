"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CaseItem, CsCase } from "@/lib/types/game";
import {
  INITIAL_RUNTIME,
  acceptOffer,
  buyStoreItem,
  chooseArchetype,
  continueAfterOutcome,
  continueAfterSummary,
  openCase,
  pendingRiskChance,
  resolveMinigame,
  resolveRisk,
  retire,
  selectOption,
  startCareer,
  type GameRuntime,
} from "./engine";
import { saveCareerResult, saveSetup } from "./storage";
import type { CareerSetup } from "@/lib/types/game";

type GameContextValue = {
  runtime: GameRuntime;
  /** True while the themed loader covers a phase transition. */
  loading: boolean;
  start: (setup: CareerSetup) => void;
  pickArchetype: (archetypeId: string) => void;
  choose: (optionId: string) => void;
  finishMinigame: (success: boolean) => void;
  finishRisk: (success: boolean) => void;
  riskChance: number;
  next: () => void;
  nextSeason: () => void;
  signWith: (teamId: string) => void;
  unbox: (item: CaseItem) => void;
  /** Spend earnings on a store item. Returns a case to open, or an error. */
  buyItem: (itemId: string) => { caseToOpen: CsCase | null; error: string | null };
  retireNow: () => void;
  reset: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

/** Big beats (season / market / retire) keep a short cinematic beat. */
const LOADER_MS = 360;
/** Event → outcome → next fires often; keep friction tiny. */
const LOADER_BEAT_MS = 160;

export function GameProvider({ children }: { children: ReactNode }) {
  const [runtime, setRuntime] = useState<GameRuntime>(INITIAL_RUNTIME);
  const [loading, setLoading] = useState(false);

  /**
   * Phase changes go through the CS-themed loader so screens never pop in
   * abruptly — duration depends on how often the beat repeats.
   */
  const transition = useCallback(
    (
      updater: (current: GameRuntime) => GameRuntime,
      instantOrMs: boolean | number = false,
    ) => {
      if (instantOrMs === true) {
        setRuntime(updater);
        return;
      }
      const delay =
        typeof instantOrMs === "number" ? instantOrMs : LOADER_MS;
      setLoading(true);
      window.setTimeout(() => {
        setRuntime(updater);
        setLoading(false);
      }, delay);
    },
    [],
  );

  const start = useCallback(
    (setup: CareerSetup) => {
      saveSetup(setup);
      transition(() => startCareer(setup));
    },
    [transition],
  );

  const pickArchetype = useCallback(
    (archetypeId: string) => {
      transition((current) => chooseArchetype(current, archetypeId));
    },
    [transition],
  );

  const choose = useCallback(
    (optionId: string) => {
      transition((current) => selectOption(current, optionId), LOADER_BEAT_MS);
    },
    [transition],
  );

  const finishMinigame = useCallback(
    (success: boolean) => {
      transition(
        (current) => resolveMinigame(current, success),
        LOADER_BEAT_MS,
      );
    },
    [transition],
  );

  const finishRisk = useCallback(
    (success: boolean) => {
      transition((current) => resolveRisk(current, success), LOADER_BEAT_MS);
    },
    [transition],
  );

  const riskChance = pendingRiskChance(runtime);

  const next = useCallback(() => {
    transition((current) => continueAfterOutcome(current), LOADER_BEAT_MS);
  }, [transition]);

  const nextSeason = useCallback(() => {
    transition((current) => {
      const updated = continueAfterSummary(current);
      if (updated.phase === "retired" && updated.result) {
        saveCareerResult(updated.result);
      }
      return updated;
    });
  }, [transition]);

  const signWith = useCallback(
    (teamId: string) => {
      transition((current) => acceptOffer(current, teamId));
    },
    [transition],
  );

  const unbox = useCallback((item: CaseItem) => {
    setRuntime((current) => openCase(current, item));
  }, []);

  const buyItem = useCallback(
    (itemId: string) => {
      const result = buyStoreItem(runtime, itemId);
      if (!result.error) {
        setRuntime(result.runtime);
      }
      return { caseToOpen: result.openCase, error: result.error };
    },
    [runtime],
  );

  const retireNow = useCallback(() => {
    transition((current) => {
      const updated = retire(current);
      if (updated.result) {
        saveCareerResult(updated.result);
      }
      return updated;
    });
  }, [transition]);

  const reset = useCallback(() => {
    setRuntime(INITIAL_RUNTIME);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
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
    }),
    [
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
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame debe usarse dentro de <GameProvider>");
  }
  return context;
}
