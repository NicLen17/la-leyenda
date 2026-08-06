"use client";

import { CoinFlip } from "./coin-flip";
import { FlickGame } from "./flick-game";
import { ReactionGame } from "./reaction-game";
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
    case "coinflip":
      return <CoinFlip onComplete={onComplete} />;
    default:
      return <FlickGame onComplete={onComplete} />;
  }
}
