import { TEAMS } from "@/lib/data/teams";
import type {
  AttributeKey,
  PlayerState,
  Role,
  StatEffects,
  Team,
  TeamOffer,
  Tier,
} from "@/lib/types/game";
import {
  FAME_LEVELS,
  HLTV_TOP20_THRESHOLD,
  LEGENDS,
  RETIREMENT_AGE,
} from "./constants";
import { individualSkill, totalClutches } from "./simulator";

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

  for (const key of ATTRIBUTE_KEYS) {
    const delta = effects[key];
    if (typeof delta === "number") {
      next[key] = clamp(next[key] + delta, 1, 99);
    }
  }

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

/** Reflexes fade first, game sense keeps growing. Classic CS ageing curve. */
export function applyAgeing(player: PlayerState): PlayerState {
  const next = { ...player };
  if (next.age <= 22) {
    next.aim = clamp(next.aim + 1, 1, 99);
    next.reflexes = clamp(next.reflexes + 1, 1, 99);
    next.movement = clamp(next.movement + 1, 1, 99);
  } else if (next.age >= 27) {
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

/** Market value in "how much a roster would pay you per month". */
export function marketValue(player: PlayerState): number {
  const skill = individualSkill(player);
  const ratingFactor = Math.pow(clamp(player.rating, 0.7, 1.5), 6);
  const base = 700 + skill * 60;
  const fameFactor = 1 + player.fame / 55;
  const trophyFactor = 1 + player.trophies * 0.08 + player.majors * 0.35;
  const ageFactor = player.age <= 21 ? 1.18 : player.age >= 29 ? 0.72 : 1;
  const boost = 1 + player.transferBoost / 100;

  return Math.round(
    base * ratingFactor * fameFactor * trophyFactor * ageFactor * boost,
  );
}

function offerRole(team: Team, player: PlayerState): Role {
  if (Math.random() < 0.72) return player.role;
  const alternatives: Role[] = ["entry", "awp", "igl", "lurker", "support"];
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

function eligibleTiers(player: PlayerState): Tier[] {
  const skill = individualSkill(player);
  const strength = skill + player.fame * 0.5 + player.rating * 30;

  if (strength >= 130) return [1, 2];
  if (strength >= 95) return [2, 1];
  if (strength >= 65) return [2, 3];
  return [3];
}

/**
 * Offers are generated from the player's real standing: a tier 1 org only calls
 * if the rating and fame justify the salary line.
 */
export function generateOffers(player: PlayerState, count = 5): TeamOffer[] {
  const tiers = eligibleTiers(player);
  const value = marketValue(player);

  const candidates = TEAMS.filter((team) => {
    if (team.id === player.team.id) return false;
    if (!tiers.includes(team.tier)) return false;
    const perSeat = team.budgetMonthly / 5;
    // Orgs will stretch to 1.8x their average seat for a star.
    return perSeat * 1.8 >= value * 0.55;
  });

  // Favour the player's own region so the career feels grounded.
  const weighted = [...candidates].sort((a, b) => {
    const regionBias = (team: Team) => (team.region === player.region ? -12 : 0);
    return b.prestige + regionBias(b) - (a.prestige + regionBias(a));
  });

  const picked: Team[] = [];
  const pool = weighted.slice(0, Math.max(count + 6, 10));
  while (picked.length < Math.min(count, pool.length)) {
    const index = Math.floor(Math.random() * pool.length);
    const [team] = pool.splice(index, 1);
    if (team) picked.push(team);
  }

  const offers = picked.map((team) => buildOffer(team, player, value));

  // The current org always tables a renewal, like El Ídolo's market screen.
  const renewalSalary = Math.round(
    Math.max(player.salaryMonthly, value * 0.85) *
      (player.benched ? 0.7 : 1),
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

function buildOffer(team: Team, player: PlayerState, value: number): TeamOffer {
  const perSeat = team.budgetMonthly / 5;
  const relative = value / perSeat;
  const starRole = relative >= 1.1;

  const salaryMonthly = Math.round(
    clamp(
      perSeat * clamp(relative, 0.55, 1.9),
      team.tier === 1 ? 5_000 : team.tier === 2 ? 2_000 : 900,
      team.tier === 1 ? 95_000 : team.tier === 2 ? 18_000 : 6_000,
    ),
  );

  const stepUp = team.tier < player.team.tier;
  const benchRisk = !starRole && stepUp;

  const notes: string[] = [];
  if (stepUp) notes.push(`Saltás a tier ${team.tier}`);
  if (starRole) notes.push("Te quieren como estrella");
  if (benchRisk) notes.push("Arrancás peleando el quinto puesto");
  if (team.region !== player.region) notes.push("Te mudás de región");
  if (team.prestige >= 90) notes.push("Candidato a Major");

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
  // Nobody keeps a benched 30-year-old with a broken rating.
  return player.age >= 29 && player.benched && player.rating < 0.95;
}
