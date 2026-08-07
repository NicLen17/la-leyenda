import type { PlayerState, Team, Tier } from "@/lib/types/game";
import { STARTING_AGE } from "./constants";
import { individualSkill } from "./simulator";

/**
 * Transfer / scout gates mirror how CS orgs actually sign and notice players
 * (HLTV-style ladder, Aug 2026 snapshot):
 *
 * - Academias / open grind (T3, prestige ~30–41): always open.
 * - Low Challenger (T2 ~50–57): after real map volume + decent demos.
 * - Solid Challenger / RMR band (T2 ~58–69): consistent numbers or a trophy.
 * - Near-T1 / high T2 (~70–76: paiN, Liquid, VP, EF…): proven LAN form + radar.
 * - Mid T1 (~82–89: MongolZ → 9z, G2, FaZe…): established pro, not a no-name.
 * - Big T1 (~90–92: MOUZ, NAVI): stars or Major pedigree.
 * - Elite desks (≥93: Falcons, Spirit, FURIA, Vitality): only star form / Major.
 *
 * Agent interest events and market offers share the same prestige ceiling so
 * rookies never get "Falcons pregunta por vos" before they have proof.
 */

export type MarketAccess = {
  skill: number;
  rating: number;
  /** Highest tier the player can receive offers from. */
  maxTier: Tier;
  /** Can hear from prestige ≥ ELITE_PRESTIGE_CUTOFF desks. */
  eliteReady: boolean;
  /** Highest org prestige that would realistically scout you. */
  maxPrestige: number;
  /** Short copy for the transfer screen. */
  label: string;
  /** What to grind next if locked out of the next band. */
  nextStep: string;
};

/** Prestige bands aligned with our roster data. */
export const PRESTIGE = {
  /** Falcons / Spirit / FURIA / Vitality */
  ELITE: 93,
  /** MOUZ / NAVI */
  BIG_T1: 90,
  /** Floor of implemented Tier 1 (MongolZ…) */
  MID_T1: 82,
  /** High T2 / RMR contenders (Liquid, paiN, VP, EF…) */
  HIGH_T2: 70,
  /** Solid Challenger */
  MID_T2: 58,
  /** Soft Challenger / regional invite */
  LOW_T2: 50,
  /** Top of academy / domestic (BNE…) */
  ACADEMY: 45,
} as const;

export const ELITE_PRESTIGE_CUTOFF = PRESTIGE.ELITE;

/**
 * Max prestige an org can have and still reasonably notice this player.
 * Demos + hardware unlock ceilings; fame is name recognition, not a substitute.
 */
export function maxScoutedPrestige(player: PlayerState): number {
  const skill = individualSkill(player);
  const rating = player.rating;
  const { fame, majors, trophies } = player;
  const rounds = player.career.roundsPlayed;
  const yearsOnCircuit = Math.max(0, player.age - STARTING_AGE);

  // --- Proof thresholds (hardware / volume) --------------------------------
  // Brand-new careers: only academias call. No pro desk scouts a qualifier
  // entry fragger with 40 rounds on HLTV.
  if (rounds < 100 && trophies === 0 && majors === 0) {
    return PRESTIGE.ACADEMY;
  }

  // First full season without silverware — regional / low Challenger only.
  if (rounds < 240 && trophies === 0 && majors === 0 && yearsOnCircuit < 1) {
    return Math.min(computePrestigeFromForm(rating, skill, fame, majors, trophies), 57);
  }

  // Still no titles after some volume: can climb into mid Challenger on demos,
  // but not into Liquid/paiN/T1 desks that build around proven winners.
  if (trophies === 0 && majors === 0 && rounds < 480) {
    return Math.min(computePrestigeFromForm(rating, skill, fame, majors, trophies), 69);
  }

  return computePrestigeFromForm(rating, skill, fame, majors, trophies);
}

/**
 * Pure form / pedigree ladder — called after volume gates.
 * Mirrors real progression: CCT → Challenger → RMR→T1 invite → star desks.
 * Hardware (trophies / Majors) opens the next band even while raw skill catches up.
 */
function computePrestigeFromForm(
  rating: number,
  skill: number,
  fame: number,
  majors: number,
  trophies: number,
): number {
  // Elite superteam (Top ~5 HLTV): star rating or Major pedigree + form.
  if (
    (rating >= 1.18 && skill >= 72 && fame >= 45) ||
    (majors >= 1 && rating >= 1.12 && skill >= 68 && fame >= 35)
  ) {
    return 100;
  }

  // Big T1 (MOUZ / NAVI band): near-star numbers + hardware or heavy fame.
  if (
    (rating >= 1.14 && skill >= 68 && fame >= 32 && (trophies >= 1 || majors >= 1)) ||
    (majors >= 1 && rating >= 1.08 && skill >= 64 && fame >= 28) ||
    (trophies >= 4 && rating >= 1.12 && skill >= 66 && fame >= 30)
  ) {
    return PRESTIGE.BIG_T1 + 2; // 92 — still below elite 93
  }

  // Mid / full Tier 1 (prestige 82–89): pro track record, not agent buzz alone.
  // Winning against real fields (2+ trophies) or a Major is the classic jump.
  if (
    (rating >= 1.12 && skill >= 65 && fame >= 28 && trophies >= 1) ||
    (rating >= 1.13 && skill >= 66 && fame >= 32) ||
    (majors >= 1 && rating >= 1.06 && skill >= 58) ||
    (trophies >= 3 && rating >= 1.08 && skill >= 60 && fame >= 22) ||
    (trophies >= 2 && rating >= 1.1 && skill >= 62 && fame >= 25)
  ) {
    return PRESTIGE.MID_T1 + 7; // 89 — room under BIG_T1
  }

  // High T2 / near-T1 (70–76): Challenger kings and RMR desks (Liquid, paiN…).
  // A real trophy + solid demos is enough for the blue-chip mid-tier desk call.
  if (
    (rating >= 1.05 && skill >= 54 && fame >= 16) ||
    (trophies >= 1 && rating >= 1.0 && skill >= 48 && fame >= 12) ||
    (trophies >= 2 && rating >= 0.98 && skill >= 46) ||
    (rating >= 1.08 && skill >= 56)
  ) {
    return PRESTIGE.HIGH_T2 + 6; // 76
  }

  // Mid Challenger (58–69).
  if (
    (rating >= 0.98 && skill >= 50) ||
    (rating >= 0.95 && skill >= 46 && fame >= 15) ||
    (trophies >= 1 && rating >= 0.94 && skill >= 42)
  ) {
    return PRESTIGE.MID_T2 + 11; // 69
  }

  // Soft Challenger / regional invite (50–57) — you put rounds in.
  if (rating >= 0.92 && skill >= 42 && fame >= 8) {
    return PRESTIGE.LOW_T2 + 7; // 57
  }

  // Domestic / academy only.
  return PRESTIGE.ACADEMY;
}

export function evaluateMarketAccess(player: PlayerState): MarketAccess {
  const skill = individualSkill(player);
  const rating = player.rating;
  const maxPrestige = maxScoutedPrestige(player);

  const eliteReady = maxPrestige >= PRESTIGE.ELITE;
  const t1Ready = maxPrestige >= PRESTIGE.MID_T1;
  const t2Ready = maxPrestige >= PRESTIGE.LOW_T2;
  const maxTier: Tier = t1Ready ? 1 : t2Ready ? 2 : 3;

  let label: string;
  let nextStep: string;

  if (eliteReady) {
    label = "Radar de superteams (élite)";
    nextStep =
      "Falcons / Spirit / FURIA / Vitality ya pueden mirar demos tuyas.";
  } else if (maxPrestige >= PRESTIGE.BIG_T1) {
    label = "Radar Big Tier 1";
    nextStep = `Élite (prestigio ≥ ${PRESTIGE.ELITE}): rating ≥ 1.18 · skill ≥ 72 · fama ≥ 45, o Major + 1.12/68/35 (vas ${rating.toFixed(2)} / ${Math.round(skill)} / fama ${player.fame}).`;
  } else if (t1Ready) {
    label = "Mercado Tier 1 abierto";
    nextStep = `Escritorios top (NAVI/MOUZ/élite): subí demos a ~1.14+, sumá trofeos o un Major. Vas ${rating.toFixed(2)} / skill ${Math.round(skill)} / ${player.trophies} trofeos.`;
  } else if (maxPrestige >= PRESTIGE.HIGH_T2) {
    label = "Radar Challenger alto / RMR";
    nextStep = `Tier 1 pide ~1.12 rating + skill 65 + fama 28 y al menos un torneo ganado (vas ${rating.toFixed(2)} / ${Math.round(skill)} / ${player.trophies} trofeos).`;
  } else if (maxPrestige >= PRESTIGE.MID_T2) {
    label = "Mercado Challenger";
    nextStep = `Escritorios tipo Liquid/paiN pedirán ~1.05 rating y algo de nombre o un título (vas ${rating.toFixed(2)} / fama ${player.fame}).`;
  } else if (t2Ready) {
    label = "Radar regional / soft Challenger";
    nextStep = `Subí volume de mapas y rating ≥ 0.98 con skill ~50 para atraer orgs de mitad de tabla T2.`;
  } else {
    label = "Circuito academia / open qualifiers";
    nextStep = `Las orgs serias miran demos después de ~100 rondas y resultados. Jugá splits, ganá CCT/ESEA y recien ahí suena el teléfono.`;
  }

  return { skill, rating, maxTier, eliteReady, maxPrestige, label, nextStep };
}

/**
 * Soft budget fit: comfort seat, or a stretch "star seat" (up to ~40% of
 * the full roster monthly budget). Superstars still hear from big desks
 * even when their MV exceeds a clean 1/5 split of payroll.
 */
export function budgetFitsOffer(team: Team, marketValue: number): boolean {
  const perSeat = team.budgetMonthly / 5;
  const stretchSeat = team.budgetMonthly * 0.4;
  return (
    perSeat * 2.1 >= marketValue * 0.4 || stretchSeat >= marketValue * 0.32
  );
}

/**
 * Hard performance + pedigree gate per org. Prestige must sit under the
 * player's scouted ceiling (or the team is a T3 grind seat always open once
 * the volume gate is passed / always for pure academies).
 */
export function qualifiesForTeam(player: PlayerState, team: Team): boolean {
  const ceiling = maxScoutedPrestige(player);

  // Academias always recruit — that's the entry point to the ecosystem.
  if (team.tier === 3) return true;

  return team.prestige <= ceiling;
}

/**
 * Same gates for narrative "X pregunta por vos" — scout interest is never
 * freer than a real contract offer.
 */
export function qualifiesForOrgInterest(
  player: PlayerState,
  team: Team,
): boolean {
  if (team.id === player.team.id) return false;
  return qualifiesForTeam(player, team);
}
