import { TEAMS } from "@/lib/data/teams";
import type {
  AttributeKey,
  PlayerState,
  Role,
  StatEffects,
  Team,
  TeamOffer,
} from "@/lib/types/game";
import {
  FAME_LEVELS,
  HLTV_TOP20_THRESHOLD,
  LEGENDS,
  RETIREMENT_AGE,
} from "./constants";
import {
  budgetFitsOffer,
  evaluateMarketAccess,
  qualifiesForTeam,
} from "./market-gates";
import { getTeamBalance } from "./team-context";
import { individualSkill, totalClutches } from "./simulator";

export { evaluateMarketAccess } from "./market-gates";

const ATTRIBUTE_KEYS: AttributeKey[] = [
  "aim",
  "reflexes",
  "gameSense",
  "utility",
  "clutch",
  "movement",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getFameLevel(fame: number): string {
  let label: string = FAME_LEVELS[0].label;
  for (const level of FAME_LEVELS) {
    if (fame >= level.min) {
      label = level.label;
    }
  }
  return label;
}

export function getNextFameLevel(
  fame: number,
): { label: string; min: number } | null {
  for (const level of FAME_LEVELS) {
    if (fame < level.min) {
      return { label: level.label, min: level.min };
    }
  }
  return null;
}

export function getNationalTeamStatus(player: PlayerState): string {
  const skill = individualSkill(player);
  if (player.rating >= 1.2 && player.fame >= 80) return "Cara del circuito";
  if (player.rating >= 1.12 && player.fame >= 60) return "Top 20 candidato";
  if (skill >= 70) return "Convocado a showmatch";
  if (skill >= 50) return "En el radar";
  return "Sin llamados";
}

export function applyEffects(
  player: PlayerState,
  effects: StatEffects,
): PlayerState {
  const next: PlayerState = { ...player };
  const training = { ...(player.splitTraining ?? {}) };

  for (const key of ATTRIBUTE_KEYS) {
    const delta = effects[key];
    if (typeof delta === "number") {
      next[key] = clamp(next[key] + delta, 1, 99);
      // Only deliberate gains count as training toward rust offset.
      if (delta > 0) {
        training[key] = (training[key] ?? 0) + delta;
      }
    }
  }
  next.splitTraining = training;

  if (typeof effects.fame === "number") {
    next.fame = clamp(next.fame + effects.fame, 0, 100);
    next.fameLevel = getFameLevel(next.fame);
  }
  if (typeof effects.earnings === "number") {
    next.earnings = Math.max(0, next.earnings + effects.earnings);
  }
  if (typeof effects.salaryMonthly === "number") {
    next.salaryMonthly = Math.max(400, next.salaryMonthly + effects.salaryMonthly);
  }
  if (typeof effects.chemistry === "number") {
    next.chemistry = clamp(next.chemistry + effects.chemistry, -10, 10);
  }
  if (typeof effects.form === "number") {
    next.form = clamp(next.form + effects.form, -5, 5);
  }
  if (typeof effects.tilt === "number") {
    next.tilt = clamp(next.tilt + effects.tilt, 0, 10);
  }
  if (typeof effects.transferBoost === "number") {
    next.transferBoost = clamp(next.transferBoost + effects.transferBoost, -20, 40);
  }
  if (typeof effects.benchRisk === "number") {
    next.benchRisk = clamp(next.benchRisk + effects.benchRisk, 0, 100);
  }

  next.nationalTeamStatus = getNationalTeamStatus(next);
  return next;
}

/**
 * Rust demand for one core attr this split. High peaks cost more to hold;
 * late-career body taxes mechanical skills. Floor stays soft so rookies
 * don't freefall — pressure appears as you actually stack skill.
 */
export function splitRustDemand(
  value: number,
  age: number,
  key: AttributeKey,
): number {
  if (value < 35) return 0;

  let rust = 1;
  if (value >= 70) rust += 1;
  if (value >= 85) rust += 1;
  if (value >= 95) rust += 1;

  const mechanical =
    key === "aim" || key === "reflexes" || key === "movement";
  if (age >= 24 && mechanical) rust += 1;
  if (age >= 27 && (key === "reflexes" || key === "movement")) rust += 1;

  return rust;
}

/**
 * End-of-split maintenance: every core attr wants rust; training from the
 * split offsets 1:1. Forces prioritisation — you can't stack 99s forever
 * by only ever training aim.
 */
export function applySplitAttrition(player: PlayerState): PlayerState {
  const training = player.splitTraining ?? {};
  const next: PlayerState = { ...player, splitTraining: {} };

  for (const key of ATTRIBUTE_KEYS) {
    const demand = splitRustDemand(next[key], next.age, key);
    const credit = training[key] ?? 0;
    const net = Math.max(0, demand - credit);
    if (net > 0) {
      next[key] = clamp(next[key] - net, 1, 99);
    }
  }

  return next;
}

/** Reflexes fade first, game sense keeps growing. Classic CS ageing curve. */
export function applyAgeing(player: PlayerState): PlayerState {
  const next = { ...player };
  if (next.age <= 22) {
    next.aim = clamp(next.aim + 1, 1, 99);
    next.reflexes = clamp(next.reflexes + 1, 1, 99);
    next.movement = clamp(next.movement + 1, 1, 99);
  } else if (next.age >= 27) {
    // Extra late-career penalty on top of per-split attrition.
    const decay = next.age >= 30 ? 2 : 1;
    next.reflexes = clamp(next.reflexes - decay, 1, 99);
    next.movement = clamp(next.movement - decay, 1, 99);
    next.aim = clamp(next.aim - (next.age >= 30 ? 1 : 0), 1, 99);
  }
  next.gameSense = clamp(next.gameSense + (next.age >= 21 ? 1 : 0), 1, 99);
  next.tilt = clamp(next.tilt - 1, 0, 10);
  return next;
}

/* ----------------------------- transfer market ---------------------------- */

/**
 * What orgs pay for: mechanical level + recent rating + hardware (trophies).
 * Fame is name recognition — useful, not a substitute for fragging.
 * Agent buzz (`transferBoost`) is a small nudge, never the main lever.
 * Soft ceiling keeps superstar MV in a range T1 desks can still bid on.
 */
export function marketValue(player: PlayerState): number {
  const skill = individualSkill(player);
  // ^3.2 (was ^5): still rewards form hard, without pricing every star out of every roster.
  const ratingFactor = Math.pow(clamp(player.rating, 0.75, 1.45), 3.2);
  const base = 400 + skill * 90;
  const fameFactor = 1 + player.fame / 95;
  const trophyFactor = 1 + player.trophies * 0.1 + player.majors * 0.38;
  const ageFactor = player.age <= 21 ? 1.15 : player.age >= 29 ? 0.72 : 1;
  const buzz = 1 + clamp(player.transferBoost, -12, 18) / 220;

  const raw =
    base * ratingFactor * fameFactor * trophyFactor * ageFactor * buzz;
  // Soft soft-cap: asymptotic pull toward 220k so leviathans still rise slowly.
  const capped = raw <= 160_000 ? raw : 160_000 + (raw - 160_000) * 0.35;
  return Math.round(Math.min(capped, 260_000));
}

function offerRole(team: Team, player: PlayerState): Role {
  if (Math.random() < 0.72) return player.role;
  const alternatives: Role[] = ["entry", "awp", "igl", "lurker", "support"];
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

/**
 * Offers are gated by real performance (rating / skill / Majors), then salary
 * fit. Weak numbers → Tier 3 / academias only; stars unlock HLTV top desks.
 * High MV never wipes the market: stretch top desks first, T3 last resort.
 */
export function generateOffers(player: PlayerState, count = 5): TeamOffer[] {
  const value = marketValue(player);
  const access = evaluateMarketAccess(player);

  const eligible = TEAMS.filter(
    (team) => team.id !== player.team.id && qualifiesForTeam(player, team),
  );

  let candidates = eligible.filter((team) => budgetFitsOffer(team, value));

  // Superstar payroll shouldn't erase Tier 1 interest — pad with stretch seats
  // from the best unpaid desks the player already unlocked.
  if (candidates.length < count) {
    const have = new Set(candidates.map((t) => t.id));
    const stretch = eligible
      .filter((team) => !have.has(team.id))
      .sort((a, b) => {
        const tierBias = (t: Team) => (t.tier === access.maxTier ? 30 : 0);
        return (
          b.budgetMonthly + b.prestige + tierBias(b) -
          (a.budgetMonthly + a.prestige + tierBias(a))
        );
      });
    candidates = [...candidates, ...stretch];
  }

  // True empty pool (locked out of everything but academies): T3 grind path.
  if (candidates.length === 0) {
    candidates = TEAMS.filter(
      (team) => team.id !== player.team.id && team.tier === 3,
    );
  }

  // Favour orgs near the player's scouted ceiling (next realistic step up).
  const weighted = [...candidates].sort((a, b) => {
    const score = (team: Team) => {
      const region = team.region === player.region ? 14 : 0;
      const tierFit = team.tier === access.maxTier ? 18 : team.tier < 3 ? 6 : 0;
      const wallet = Math.min(team.budgetMonthly / 8_000, 28);
      const gap = access.maxPrestige - team.prestige;
      // Prefer desks you just unlocked, not random low academies padded in.
      const ceilingFit =
        gap >= 0 && gap <= 18 ? 22 : gap > 18 && gap <= 35 ? 8 : 0;
      return team.prestige + region + tierFit + wallet + ceilingFit;
    };
    return score(b) - score(a);
  });

  const picked: Team[] = [];
  // Prefer a deeper high-tier pool so elite careers actually sample elite orgs.
  const poolSize = Math.max(
    count + 10,
    access.maxTier === 1 ? 18 : access.maxTier === 2 ? 14 : 12,
  );
  const pool = weighted.slice(0, Math.min(poolSize, weighted.length));
  while (picked.length < Math.min(count, pool.length)) {
    // Bias harder toward the front (prestige/wallet) for unlocked max tier.
    const exponent = access.maxTier === 1 ? 0.5 : 0.65;
    const roll = Math.floor(Math.pow(Math.random(), exponent) * pool.length);
    const [team] = pool.splice(roll, 1);
    if (team) picked.push(team);
  }

  const offers = picked.map((team) => buildOffer(team, player, value));

  // Current org always tables a renewal so you can stay put.
  // Modest raise vs market — external top desks can still undercut or match.
  const marketBid = value * 0.88;
  const modestRaise = player.salaryMonthly * 1.06;
  const renewalCap = player.salaryMonthly * 1.35 + 20_000;
  const renewalSalary = Math.round(
    Math.min(Math.max(modestRaise, marketBid), renewalCap) *
      (player.benched ? 0.72 : 1),
  );
  offers.unshift({
    team: player.team,
    salaryMonthly: renewalSalary,
    years: player.age >= 28 ? 1 : 2,
    role: player.role,
    benchRisk: player.benchRisk > 55,
    starRole: player.rating >= 1.1,
    fameDelta: 2,
    note: player.benched
      ? "Te quieren recuperar, pero arrancás peleando el puesto."
      : "Renovación: seguís con la misma gente y el mismo rol.",
  });

  return offers;
}

function salaryBand(tier: Team["tier"]): { floor: number; ceiling: number } {
  if (tier === 1) return { floor: 5_000, ceiling: 210_000 };
  if (tier === 2) return { floor: 2_000, ceiling: 42_000 };
  return { floor: 900, ceiling: 9_000 };
}

function buildOffer(team: Team, player: PlayerState, value: number): TeamOffer {
  const perSeat = team.budgetMonthly / 5;
  // Star package can claim up to ~42% of roster payroll (franchise face).
  const starPackage = Math.round(team.budgetMonthly * 0.42);
  const affordMax = Math.max(Math.round(perSeat * 2.15), starPackage);
  const relative = value / Math.max(perSeat, 1);
  const starRole = relative >= 1.05 || value >= perSeat * 1.2;

  const { floor, ceiling } = salaryBand(team.tier);
  // Bid near market when the desk can; otherwise max stretch package.
  const target = Math.min(value * 0.82, affordMax);
  const salaryMonthly = Math.round(
    clamp(target, floor, Math.min(ceiling, Math.max(affordMax, floor))),
  );

  const stepUp = team.tier < player.team.tier;
  const benchRisk = !starRole && stepUp;

  const notes: string[] = [];
  if (stepUp) notes.push(`Saltás a tier ${team.tier}`);
  if (starRole) notes.push("Te quieren como estrella");
  if (benchRisk) notes.push("Arrancás peleando el quinto puesto");
  if (team.region !== player.region) notes.push("Te mudás de región");
  if (team.prestige >= 90) notes.push("Candidato a Major");
  if (salaryMonthly >= player.salaryMonthly * 0.9 && team.tier === 1) {
    notes.push("Paquete competitivo");
  }

  return {
    team,
    salaryMonthly,
    years: team.tier === 1 ? 2 : Math.random() < 0.5 ? 1 : 2,
    role: offerRole(team, player),
    benchRisk,
    starRole,
    fameDelta: Math.round((team.prestige - player.team.prestige) / 8),
    note: notes.length > 0 ? notes.join(" · ") : "Proyecto estable, sin promesas.",
  };
}

/* ------------------------------ career score ------------------------------ */

export function careerScore(player: PlayerState): number {
  const clutches = totalClutches(player.career.clutches);
  const kd =
    player.career.deaths > 0 ? player.career.kills / player.career.deaths : 1;

  const score =
    player.rating * 260 +
    player.majors * 90 +
    player.trophies * 22 +
    player.mvps * 14 +
    player.fame * 2.4 +
    Math.min(player.career.kills / 24, 120) +
    clutches * 3.5 +
    player.aces * 8 +
    kd * 45 +
    Math.min(player.earnings / 9_000, 110) +
    (player.hltvTop20 ? (21 - player.hltvTop20) * 6 : 0) +
    player.graffiti.length * 6;

  return Math.round(score);
}

export function compareToLegend(score: number): {
  name: string;
  blurb: string;
} {
  for (const legend of LEGENDS) {
    if (score >= legend.minScore) {
      return { name: legend.name, blurb: legend.blurb };
    }
  }
  const last = LEGENDS[LEGENDS.length - 1];
  return { name: last.name, blurb: last.blurb };
}

export function computeTop20(player: PlayerState): number | null {
  if (player.rating < HLTV_TOP20_THRESHOLD) return null;
  const over = player.rating - HLTV_TOP20_THRESHOLD;
  const fameBonus = player.fame / 100;
  const rank = Math.round(20 - over * 55 - fameBonus * 6);
  return clamp(rank, 1, 20);
}

export function shouldRetire(player: PlayerState): boolean {
  if (player.age >= RETIREMENT_AGE) return true;
  // Benched and cold — orgs stop calling; career ends early.
  if (player.age >= 24 && player.benched && player.rating < 0.95) return true;
  // Never broke through: no hardware, no name, fading demos.
  if (
    player.age >= 25 &&
    player.fame < 22 &&
    player.rating < 0.98 &&
    player.trophies === 0
  ) {
    return true;
  }
  return false;
}

/** Base success chance for risky narrative choices (gauge spin). */
export function riskSuccessChance(player: PlayerState): number {
  const balance = getTeamBalance(player.team);
  // Elite desks punish reckless calls; academias forgive more variance.
  const raw =
    38 +
    player.gameSense * 0.22 +
    player.form * 3 +
    player.chemistry * 1.5 -
    player.tilt * 2.5 +
    balance.riskDelta;
  return clamp(Math.round(raw), 18, 74);
}
