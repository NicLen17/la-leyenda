import type { PlayerState, Team, Tier } from "@/lib/types/game";
import { individualSkill } from "./simulator";

/**
 * Transfer gates mirror how CS orgs actually scout (HLTV Aug 2026 landscape):
 * - Elite T1 (top ~5 prestige): only star-level rating + skill, or a Major + near-star form.
 * - Tier 1 (approx. HLTV top 15): proven LAN/online numbers — not agent buzz alone.
 * - Tier 2: solid regional / Challenger form.
 * - Tier 3: always open — the grind path when you aren't ready for bigger orgs.
 *
 * Reference snapshot (HLTV world ranking, 3 Aug 2026): Falcons, Spirit, FURIA,
 * Vitality, MOUZ, NAVI, 9z, Aurora, G2, BetBoom, FaZe, Legacy, Astralis, MongolZ…
 */

export type MarketAccess = {
  skill: number;
  rating: number;
  /** Highest tier the player can receive offers from. */
  maxTier: Tier;
  /** Can receive offers from prestige ≥ elitePrestigeCutoff T1 orgs. */
  eliteReady: boolean;
  /** Short copy for the transfer screen. */
  label: string;
  /** What to grind next if locked out of T1. */
  nextStep: string;
};

/** Prestige at/above this = "top desk" (Falcons / Vitality / Spirit / FURIA band). */
export const ELITE_PRESTIGE_CUTOFF = 93;

export function evaluateMarketAccess(player: PlayerState): MarketAccess {
  const skill = individualSkill(player);
  const rating = player.rating;
  const { fame, majors, trophies } = player;

  const eliteReady =
    (rating >= 1.18 && skill >= 72 && fame >= 45) ||
    (majors >= 1 && rating >= 1.12 && skill >= 68 && fame >= 35);

  const t1Ready =
    eliteReady ||
    (rating >= 1.12 && skill >= 65 && fame >= 28) ||
    (majors >= 1 && rating >= 1.06 && skill >= 60) ||
    (trophies >= 3 && rating >= 1.1 && skill >= 63 && fame >= 22);

  const t2Ready =
    t1Ready ||
    (rating >= 0.98 && skill >= 50) ||
    (rating >= 0.95 && skill >= 46 && fame >= 15) ||
    (trophies >= 1 && rating >= 0.94 && skill >= 44);

  const maxTier: Tier = t1Ready ? 1 : t2Ready ? 2 : 3;

  let label: string;
  let nextStep: string;

  if (eliteReady) {
    label = "Radar de orgs top (élite)";
    nextStep = "Podés firmar con los escritorios más fuertes del circuito.";
  } else if (t1Ready) {
    label = "Mercado Tier 1 abierto";
    nextStep =
      rating < 1.18 || skill < 72
        ? `Élite (Falcons/Vitality/…): rating ≥ 1.18 y skill ≥ 72 (vas ${rating.toFixed(2)} / ${Math.round(skill)}).`
        : "Subí fama o ganá un Major para atraer a las superteams.";
  } else if (t2Ready) {
    label = "Mercado Tier 2 / Challenger";
    nextStep = `Tier 1 pide rating ≥ 1.12 y skill ≥ 65 (vas ${rating.toFixed(2)} / ${Math.round(skill)}), o un Major con ~1.06.`;
  } else {
    label = "Circuito Tier 3 / academias";
    nextStep = `Tier 2 pide rating ≥ 0.98 y skill ≥ 50 (vas ${rating.toFixed(2)} / ${Math.round(skill)}).`;
  }

  return { skill, rating, maxTier, eliteReady, label, nextStep };
}

/**
 * Soft budget fit: comfort seat, or a stretch "star seat" (up to ~40% of
 * the full roster monthly budget). Superstars still hear from big desks
 * even when their MV exceeds a clean 1/5 split of payroll.
 */
export function budgetFitsOffer(team: Team, marketValue: number): boolean {
  const perSeat = team.budgetMonthly / 5;
  const stretchSeat = team.budgetMonthly * 0.4;
  // Comfortable share of market value, or top-heavy star package.
  return (
    perSeat * 2.1 >= marketValue * 0.4 || stretchSeat >= marketValue * 0.32
  );
}

/**
 * Hard performance gate per org. Cheap rookies no longer slip into Falcons
 * just because the salary line is low.
 */
export function qualifiesForTeam(player: PlayerState, team: Team): boolean {
  const access = evaluateMarketAccess(player);

  if (team.tier === 3) return true;
  if (team.tier === 2) return access.maxTier <= 2;
  // tier 1
  if (!access.eliteReady && team.prestige >= ELITE_PRESTIGE_CUTOFF) {
    return false;
  }
  return access.maxTier === 1;
}
