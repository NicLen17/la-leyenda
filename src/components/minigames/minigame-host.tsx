"use client";

import { AwpPeekGame } from "./awp-peek-game";
import { CoinFlip } from "./coin-flip";
import { EconomyQuiz } from "./economy-quiz";
import { FlickGame } from "./flick-game";
import { HoldGame } from "./hold-game";
import { ReactionGame } from "./reaction-game";
import { RetakeGame } from "./retake-game";
import { TimingGame } from "./timing-game";
import type { MinigameKind, PlayerState } from "@/lib/types/game";

type MinigameHostProps = {
  kind: MinigameKind;
  player: PlayerState;
  onComplete: (success: boolean) => void;
};

/**
 * Difficulty scales with the relevant attribute: a great AWPer gets a wider
 * reaction window, a high-utility support gets an easier spray check.
 */
export function MinigameHost({ kind, player, onComplete }: MinigameHostProps) {
  switch (kind) {
    case "flick": {
      const required = player.aim >= 75 ? 3 : player.aim >= 55 ? 4 : 5;
      const msPerTarget = 700 + Math.round(player.reflexes * 4);
      return (
        <FlickGame
          required={required}
          msPerTarget={Math.min(1150, msPerTarget)}
          onComplete={onComplete}
        />
      );
    }
    case "reaction": {
      const threshold = 240 + Math.round(player.reflexes * 1.9);
      return <ReactionGame threshold={threshold} onComplete={onComplete} />;
    }
    case "spray":
      return <TimingGame mode="spray" onComplete={onComplete} />;
    case "defuse":
      return <TimingGame mode="defuse" onComplete={onComplete} />;
    case "smoke":
      return <TimingGame mode="smoke" onComplete={onComplete} />;
    case "plant":
      return <TimingGame mode="plant" onComplete={onComplete} />;
    case "hold": {
      const holdSeconds = 2.1 + (99 - player.aim) * 0.012;
      return (
        <HoldGame
          holdSeconds={Math.min(3.2, holdSeconds)}
          zoneSize={player.aim >= 70 ? 20 : 16}
          onComplete={onComplete}
        />
      );
    }
    case "retake": {
      const targets = player.gameSense >= 70 ? 3 : 4;
      const seconds = 6.5 + player.reflexes * 0.025;
      return (
        <RetakeGame
          targets={targets}
          seconds={Math.min(9, seconds)}
          onComplete={onComplete}
        />
      );
    }
    case "economy":
      return <EconomyQuiz onComplete={onComplete} />;
    case "awpPeek": {
      const windowMs = 380 + Math.round(player.reflexes * 2.2);
      return (
        <AwpPeekGame
          windowMs={Math.min(620, windowMs)}
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
