import type { Team, Tier } from "@/lib/types/game";

/**
 * Org context drives balance the way real CS does:
 *
 * - Academias (low prestige): weaker roster, softer skill checks, weaker draws.
 * - Superteams (high prestige): structural power wins more series, but the
 *   personal bar (minigames, risk, demos) is higher and brackets are brutal.
 *
 * Use `getTeamBalance(team)` everywhere instead of ad-hoc tier checks.
 */

export type TeamBalance = {
  /** 0 academia → 1 Falcons-tier */
  heat: number;
  /** Minigame scalar: >1 = harder */
  minigameHardness: number;
  /** Added to risk gauge success chance */
  riskDelta: number;
  /**
   * Structural roster power (teammates, IGL staff, system) feeding
   * series win chance — not the player's aim.
   */
  rosterPower: number;
  /** How much individual skill contributes to team strength */
  carryCoeff: number;
  /** Opponent prestige targeting (higher = tougher draws) */
  bracketHeat: number;
  /** Extra opponent prestige per series stage */
  stageRamp: number;
  /** Scales how fast poor form piles bench risk */
  benchSensitivity: number;
  /** Multiplier on minimum rating for mechanical series growth */
  growthBar: number;
  /** Fame spike when winning under a bigger org brand */
  fameWinBoost: number;
  /** Slight clamp tighter on round win extremes for bigger stages */
  winClampTightness: number;
  /** Human-readable band for UI / debug */
  label: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function bandLabel(prestige: number, tier: Tier): string {
  if (prestige >= 93) return "Superteam";
  if (tier === 1 || prestige >= 82) return "Tier 1";
  if (prestige >= 70) return "Challenger alto";
  if (tier === 2 || prestige >= 50) return "Challenger";
  return "Academia";
}

/**
 * Derive full balance profile from an org. Budget softens/hardens slightly:
 * well-funded desks (Liquid) feel more “pro” than their HLTV prestige alone.
 */
export function getTeamBalance(
  team: Pick<Team, "prestige" | "tier" | "budgetMonthly">,
): TeamBalance {
  const prestige = team.prestige;
  const heat = clamp((prestige - 28) / 72, 0, 1);
  const wallet = clamp(team.budgetMonthly / 260_000, 0, 1);
  // Blend roster payroll into pressure so budgeted orgs aren't free rides.
  const pressure = clamp(heat * 0.82 + wallet * 0.18, 0, 1);

  return {
    heat: pressure,
    minigameHardness: 0.84 + pressure * 0.5,
    riskDelta: Math.round(5 - pressure * 14),
    rosterPower: prestige * 0.78 + wallet * 14,
    // Rookies on weak teams can hard-carry more; on superteams you're a cog.
    carryCoeff: 0.4 - pressure * 0.16,
    bracketHeat: 0.4 + pressure * 0.9,
    stageRamp: 4 + pressure * 7,
    benchSensitivity: 0.7 + pressure * 0.85,
    growthBar: 0.9 + pressure * 0.12,
    fameWinBoost: 0.8 + pressure * 0.55,
    winClampTightness: pressure * 0.06,
    label: bandLabel(prestige, team.tier),
  };
}

/**
 * Scale a “base” minigame parameter where higher base = easier
 * (more time / wider zone). Returns the org-adjusted value.
 */
export function scaleMinigameEase(base: number, hardness: number): number {
  return base / Math.max(0.7, hardness);
}

/**
 * Scale a “base” minigame parameter where higher base = harder
 * (more targets, faster drift).
 */
export function scaleMinigameHard(base: number, hardness: number): number {
  return base * Math.max(0.7, hardness);
}
