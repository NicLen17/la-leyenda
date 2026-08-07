import type {
  AttributeKey,
  MinigameKind,
  EventOption,
  PlayerState,
  Role,
  RoundStats,
  SeriesResult,
  StatEffects,
} from "@/lib/types/game";
import { getTeamBalance } from "./team-context";

/**
 * CS-first progression:
 * - Core attrs (aim / reflexes / gameSense / utility / clutch / movement)
 *   grow from skill checks (minigames), deliberate practice choices, and
 *   series performance — not from agent chatter.
 * - Fame, salary, transfer buzz, chemistry are career context: they come
 *   from results, orgs, and locker-room decisions.
 */

export const CORE_ATTRIBUTES: AttributeKey[] = [
  "aim",
  "reflexes",
  "gameSense",
  "utility",
  "clutch",
  "movement",
];

/** What each skill check trains — mirrors real CS practice loops. */
const MINIGAME_SUCCESS: Record<MinigameKind, StatEffects> = {
  flick: { aim: 3, reflexes: 2, movement: 1 },
  reaction: { reflexes: 3, aim: 1 },
  hold: { aim: 2, reflexes: 2 },
  awpPeek: { aim: 2, reflexes: 3 },
  retake: { gameSense: 2, aim: 1, clutch: 1 },
  lineup: { utility: 3, gameSense: 2 },
  economy: { gameSense: 3, utility: 1 },
  plant: { gameSense: 2, utility: 1, clutch: 1 },
  defuse: { clutch: 2, gameSense: 2, utility: 1 },
  /** Coin flip is variance, not training — tiny IQ nudge only. */
  coinflip: { gameSense: 1 },
  case: {},
};

const MINIGAME_FAIL: Record<MinigameKind, StatEffects> = {
  flick: { aim: -1, tilt: 1, form: -1 },
  reaction: { reflexes: -1, tilt: 1, form: -1 },
  hold: { aim: -1, tilt: 1 },
  awpPeek: { reflexes: -1, tilt: 1, form: -1 },
  retake: { gameSense: -1, tilt: 1, form: -1 },
  lineup: { utility: -1, tilt: 1 },
  economy: { gameSense: -1, tilt: 1 },
  plant: { clutch: -1, tilt: 1, form: -1 },
  defuse: { clutch: -1, tilt: 1, form: -1 },
  coinflip: { form: -1 },
  case: {},
};

/** Primary attrs each role sharpens when the series goes well. */
const ROLE_GROWTH: Record<Role, AttributeKey[]> = {
  entry: ["aim", "reflexes", "movement"],
  awp: ["aim", "reflexes", "gameSense"],
  igl: ["gameSense", "utility", "clutch"],
  lurker: ["gameSense", "clutch", "aim"],
  support: ["utility", "gameSense", "movement"],
};

export function minigameRewards(kind: MinigameKind): {
  success: StatEffects;
  fail: StatEffects;
} {
  return {
    success: { ...MINIGAME_SUCCESS[kind] },
    fail: { ...MINIGAME_FAIL[kind] },
  };
}

export function mergeEffects(...parts: StatEffects[]): StatEffects {
  const merged: StatEffects = {};
  for (const part of parts) {
    for (const [key, value] of Object.entries(part) as [
      keyof StatEffects,
      number | undefined,
    ][]) {
      if (typeof value !== "number") continue;
      merged[key] = (merged[key] ?? 0) + value;
    }
  }
  return merged;
}

const ATTR_KEYS: AttributeKey[] = [
  "aim",
  "reflexes",
  "gameSense",
  "utility",
  "clutch",
  "movement",
];

function hasRiskUpside(effects: StatEffects): boolean {
  for (const [key, value] of Object.entries(effects) as [
    keyof StatEffects,
    number | undefined,
  ][]) {
    if (typeof value !== "number" || value === 0) continue;
    // Higher tilt / bench risk is never the "win".
    if (key === "tilt" || key === "benchRisk") {
      if (value < 0) return true;
      continue;
    }
    if (value > 0) return true;
  }
  return false;
}

/** Soften a mixed risk package when the gauge lands on success. */
export function softenRiskEffects(effects: StatEffects): StatEffects {
  const soft: StatEffects = { ...effects };
  if (typeof soft.tilt === "number" && soft.tilt > 0) {
    soft.tilt = Math.max(0, soft.tilt - 1);
  }
  if (typeof soft.benchRisk === "number" && soft.benchRisk > 0) {
    soft.benchRisk = Math.max(0, Math.round(soft.benchRisk * 0.45));
  }
  if (typeof soft.chemistry === "number" && soft.chemistry < 0) {
    soft.chemistry = Math.ceil(soft.chemistry / 2);
  }
  if (typeof soft.form === "number" && soft.form < 0) {
    soft.form = 0;
  }
  soft.fame = (soft.fame ?? 0) + 1;
  return soft;
}

/**
 * Pure-downside risks (tilt / banca / -aim) are "endure this" gambles.
 * Winning means you mostly dodge the bullet and keep a light scar + small reward.
 */
function dodgeRiskWin(effects: StatEffects): StatEffects {
  const win: StatEffects = { form: 1, fame: 1 };
  if (typeof effects.tilt === "number" && effects.tilt > 0) {
    win.tilt = 1;
  }
  if (typeof effects.chemistry === "number" && effects.chemistry < 0) {
    win.chemistry = Math.ceil(effects.chemistry / 3);
  }
  if (typeof effects.benchRisk === "number" && effects.benchRisk > 0) {
    win.benchRisk = Math.max(2, Math.round(effects.benchRisk * 0.2));
  }
  return win;
}

/** When a risk option has no failEffects, invent a harsher fallback. */
export function invertRiskEffects(effects: StatEffects): StatEffects {
  const fail: StatEffects = { tilt: 2, form: -1 };
  for (const key of ATTR_KEYS) {
    const value = effects[key];
    if (typeof value === "number" && value > 0) fail[key] = -1;
    if (typeof value === "number" && value < 0) {
      fail[key] = Math.min(value, -Math.abs(value));
    }
  }
  if (typeof effects.fame === "number" && effects.fame > 0) {
    fail.fame = -Math.max(1, Math.ceil(effects.fame / 2));
  } else if (typeof effects.fame === "number" && effects.fame < 0) {
    fail.fame = effects.fame - 1;
  }
  if (typeof effects.chemistry === "number") {
    fail.chemistry = Math.min(-2, -Math.abs(effects.chemistry));
  } else {
    fail.chemistry = -1;
  }
  if (typeof effects.benchRisk === "number" && effects.benchRisk > 0) {
    fail.benchRisk = effects.benchRisk + 8;
  } else {
    fail.benchRisk = 10;
  }
  if (typeof effects.earnings === "number" && effects.earnings > 0) {
    fail.earnings = -Math.round(effects.earnings * 0.35);
  }
  if (typeof effects.transferBoost === "number" && effects.transferBoost > 0) {
    fail.transferBoost = -Math.max(4, Math.ceil(effects.transferBoost / 2));
  } else if (
    typeof effects.transferBoost === "number" &&
    effects.transferBoost < 0
  ) {
    fail.transferBoost = effects.transferBoost - 2;
  }
  return fail;
}

/** What actually applies when the risk gauge wins. */
export function riskSuccessEffects(option: EventOption): StatEffects {
  if (option.successEffects) return { ...option.successEffects };
  if (hasRiskUpside(option.effects)) {
    // Author put the win package in `effects` (and maybe a separate failEffects).
    return option.failEffects
      ? { ...option.effects }
      : softenRiskEffects(option.effects);
  }
  return dodgeRiskWin(option.effects);
}

/** What actually applies when the risk gauge fails. */
export function riskFailEffects(option: EventOption): StatEffects {
  if (option.failEffects) return { ...option.failEffects };
  return invertRiskEffects(option.effects);
}

/**
 * Effects shown on choice buttons: for skill checks, preview the core
 * training payoff. For risks, preview the win path (not the raw downside blob).
 */
export function previewOptionEffects(
  option: EventOption,
  minigameLocked = false,
): StatEffects {
  if (option.minigame && !minigameLocked) {
    return minigameRewards(option.minigame).success;
  }
  if (option.risk) {
    return riskSuccessEffects(option);
  }
  return option.effects;
}

/** Downside chips for risk choices (shown next to the win preview). */
export function previewRiskFailEffects(option: EventOption): StatEffects {
  if (!option.risk) return {};
  return riskFailEffects(option);
}

/**
 * After a split series: mechanical growth tracks how you actually played.
 * Fame/form/bench stay in the season resolver — this is only core attrs.
 */
export function seriesPerformanceGrowth(
  player: PlayerState,
  seasonRating: number,
  series: SeriesResult,
  stats: RoundStats,
): StatEffects {
  const balance = getTeamBalance(player.team);
  // Superteams demand higher demos for the same skill gain.
  const floor = 0.92 * balance.growthBar;
  const great = 1.2 * (0.97 + balance.heat * 0.04);
  const good = 1.1 * (0.97 + balance.heat * 0.03);
  const ok = 1.02 * (0.97 + balance.heat * 0.02);

  if (seasonRating < floor) {
    const primaries = ROLE_GROWTH[player.role];
    const rust: StatEffects = {};
    if (primaries[0]) rust[primaries[0]] = -1;
    if (seasonRating < floor - 0.07 && primaries[1]) rust[primaries[1]] = -1;
    return rust;
  }

  const primaries = ROLE_GROWTH[player.role];
  const growth: StatEffects = {};

  let primaryGain = 0;
  let secondaryGain = 0;

  if (seasonRating >= great || (series.mvp && seasonRating >= good)) {
    primaryGain = 2;
    secondaryGain = 1;
  } else if (seasonRating >= good) {
    primaryGain = 2;
    secondaryGain = 0;
  } else if (seasonRating >= ok) {
    primaryGain = 1;
    secondaryGain = 0;
  } else {
    primaryGain = 1;
  }

  if (series.won) {
    primaryGain += 1;
  }

  growth[primaries[0]] = (growth[primaries[0]] ?? 0) + primaryGain;
  if (secondaryGain > 0 && primaries[1]) {
    growth[primaries[1]] = (growth[primaries[1]] ?? 0) + secondaryGain;
  }
  if (series.mvp && primaries[2]) {
    growth[primaries[2]] = (growth[primaries[2]] ?? 0) + 1;
  }

  // Impact thresholds scale up on bigger desks (harder to farm free stats).
  const entryBar = Math.round(16 + balance.heat * 10);
  const utilBar = Math.round(620 + balance.heat * 280);
  const clutchBar = Math.round(3 + balance.heat * 2);
  const multiBar = Math.round(5 + balance.heat * 3);

  if (stats.openingKills >= entryBar) {
    growth.aim = (growth.aim ?? 0) + 1;
  }
  if (stats.utilityDamage >= utilBar) {
    growth.utility = (growth.utility ?? 0) + 1;
  }
  const clutches =
    stats.clutches.v1 +
    stats.clutches.v2 +
    stats.clutches.v3 +
    stats.clutches.v4 +
    stats.clutches.v5;
  if (clutches >= clutchBar) {
    growth.clutch = (growth.clutch ?? 0) + 1;
  }
  if (stats.multiKills.k3 + stats.multiKills.k4 + stats.multiKills.k5 >= multiBar) {
    growth.reflexes = (growth.reflexes ?? 0) + 1;
  }

  return growth;
}

/** Soften agent/market noise so it can't outpace a strong rating. */
export function sanitizeCareerEffects(effects: StatEffects): StatEffects {
  const next = { ...effects };
  if (typeof next.transferBoost === "number") {
    next.transferBoost = Math.sign(next.transferBoost) * Math.min(5, Math.abs(next.transferBoost));
  }
  if (typeof next.salaryMonthly === "number" && next.salaryMonthly > 0) {
    // Contract bumps belong in the transfer market, not random event picks.
    next.salaryMonthly = Math.min(next.salaryMonthly, 400);
  }
  return next;
}
