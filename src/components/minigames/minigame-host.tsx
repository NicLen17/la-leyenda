"use client";

import { AwpPeekGame } from "./awp-peek-game";
import { CoinFlip } from "./coin-flip";
import { EconomyQuiz } from "./economy-quiz";
import { FlickGame } from "./flick-game";
import { HoldGame } from "./hold-game";
import { LineupMemoryGame } from "./lineup-memory-game";
import { ReactionGame } from "./reaction-game";
import { RetakeGame } from "./retake-game";
import { TimingGame } from "./timing-game";
import {
  getTeamBalance,
  scaleMinigameEase,
  scaleMinigameHard,
} from "@/lib/game/team-context";
import type { MinigameKind, PlayerState } from "@/lib/types/game";

type MinigameHostProps = {
  kind: MinigameKind;
  player: PlayerState;
  onComplete: (success: boolean) => void;
};

/**
 * Difficulty blends attributes with org pressure: superteams demand sharper
 * executions, academias leave more room to learn. Attrs still carry the day.
 */
export function MinigameHost({ kind, player, onComplete }: MinigameHostProps) {
  const { minigameHardness: hard } = getTeamBalance(player.team);

  switch (kind) {
    case "flick": {
      // Harder orgs: more hits required, tighter time windows.
      let required = player.aim >= 75 ? 3 : player.aim >= 55 ? 4 : 5;
      required = Math.min(7, Math.max(3, Math.round(scaleMinigameHard(required, hard))));
      if (hard > 1.15 && player.aim < 80) required = Math.min(7, required + 1);
      const msPerTarget = scaleMinigameEase(
        700 + Math.round(player.reflexes * 4),
        hard,
      );
      return (
        <FlickGame
          required={required}
          msPerTarget={Math.min(1150, Math.max(480, Math.round(msPerTarget)))}
          onComplete={onComplete}
        />
      );
    }
    case "reaction": {
      // Lower threshold = harder (need faster clicks).
      const threshold = scaleMinigameEase(
        240 + Math.round(player.reflexes * 1.9),
        hard,
      );
      return (
        <ReactionGame
          threshold={Math.max(200, Math.round(threshold))}
          onComplete={onComplete}
        />
      );
    }
    case "defuse":
      return (
        <TimingGame mode="defuse" difficulty={hard} onComplete={onComplete} />
      );
    case "lineup": {
      const studyMs = scaleMinigameEase(
        Math.max(1800, 3600 - Math.round(player.utility * 14)),
        hard,
      );
      const required = hard > 1.1 ? 3 : 2;
      return (
        <LineupMemoryGame
          studyMs={Math.max(1200, Math.round(studyMs))}
          required={required}
          onComplete={onComplete}
        />
      );
    }
    case "plant":
      return (
        <TimingGame mode="plant" difficulty={hard} onComplete={onComplete} />
      );
    case "hold": {
      const holdSeconds = scaleMinigameHard(
        2.4 + (99 - player.aim) * 0.01,
        hard,
      );
      const zoneSize = scaleMinigameEase(player.aim >= 70 ? 11 : 13, hard);
      const driftSpeed = scaleMinigameHard(player.aim >= 70 ? 30 : 24, hard);
      return (
        <HoldGame
          holdSeconds={Math.min(3.6, holdSeconds)}
          zoneSize={Math.max(7, Math.round(zoneSize))}
          driftSpeed={Math.round(driftSpeed)}
          onComplete={onComplete}
        />
      );
    }
    case "retake": {
      let targets = player.gameSense >= 70 ? 3 : 4;
      if (hard > 1.12) targets = Math.min(5, targets + 1);
      const seconds = scaleMinigameEase(
        6.5 + player.reflexes * 0.025,
        hard,
      );
      return (
        <RetakeGame
          targets={targets}
          seconds={Math.min(9, Math.max(4.5, seconds))}
          onComplete={onComplete}
        />
      );
    }
    case "economy":
      // Quiet quiz — pressure does not change theory questions.
      return <EconomyQuiz onComplete={onComplete} />;
    case "awpPeek": {
      const seconds = scaleMinigameEase(
        5.15 + (99 - player.reflexes) * 0.008,
        hard,
      );
      return (
        <AwpPeekGame
          seconds={Math.min(6.2, Math.max(4.2, seconds))}
          onComplete={onComplete}
        />
      );
    }
    case "coinflip":
      return <CoinFlip onComplete={onComplete} />;
    default:
      return <FlickGame onComplete={onComplete} />;
  }
}

/** Optional: for debugging / UI labels of current org pressure. */
export function orgPressureLabel(player: PlayerState): string {
  return getTeamBalance(player.team).label;
}
