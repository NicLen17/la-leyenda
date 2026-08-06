"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CaseItem, CareerSetup } from "@/lib/types/game";
import {
  INITIAL_RUNTIME,
  acceptOffer,
  chooseArchetype,
  continueAfterOutcome,
  continueAfterSummary,
  openCase,
  resolveMinigame,
  retire,
  selectOption,
  startCareer,
  type GameRuntime,
} from "./engine";
import { saveCareerResult, saveSetup } from "./storage";

type GameContextValue = {
  runtime: GameRuntime;
  /** True while the themed loader covers a phase transition. */
  loading: boolean;
  start: (setup: CareerSetup) => void;
  pickArchetype: (archetypeId: string) => void;
  choose: (optionId: string) => void;
  finishMinigame: (success: boolean) => void;
  next: () => void;
  nextSeason: () => void;
  signWith: (teamId: string) => void;
  unbox: (item: CaseItem) => void;
  retireNow: () => void;
  reset: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

const LOADER_MS = 620;

export function GameProvider({ children }: { children: ReactNode }) {
  const [runtime, setRuntime] = useState<GameRuntime>(INITIAL_RUNTIME);
  const [loading, setLoading] = useState(false);

  /**
   * Every phase change goes through the CS-themed loader so screens never
   * pop in abruptly.
   */
  const transition = useCallback(
    (updater: (current: GameRuntime) => GameRuntime, instant = false) => {
      if (instant) {
        setRuntime(updater);
        return;
      }
      setLoading(true);
      window.setTimeout(() => {
        setRuntime(updater);
        setLoading(false);
      }, LOADER_MS);
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
      transition((current) => {
        const next = selectOption(current, optionId);
        // Minigames need to appear instantly after the loader, not behind it.
        return next;
      });
    },
    [transition],
  );

  const finishMinigame = useCallback(
    (success: boolean) => {
      transition((current) => resolveMinigame(current, success));
    },
    [transition],
  );

  const next = useCallback(() => {
    transition((current) => continueAfterOutcome(current));
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
      next,
      nextSeason,
      signWith,
      unbox,
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
      next,
      nextSeason,
      signWith,
      unbox,
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
