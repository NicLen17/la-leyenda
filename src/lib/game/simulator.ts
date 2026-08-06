import { getMapById, randomActiveMap } from "@/lib/data/maps";
import { TEAMS } from "@/lib/data/teams";
import type {
  ClutchRecord,
  CsMap,
  MapResult,
  PlayerState,
  RoundStats,
  SeriesResult,
  Side,
  Tournament,
} from "@/lib/types/game";
import {
  MAX_ROUND_DAMAGE,
  OT_ROUNDS_TO_WIN,
  PLAYERS_PER_SIDE,
  ROUNDS_TO_WIN,
} from "./constants";

export function emptyRoundStats(): RoundStats {
  return {
    roundsPlayed: 0,
    roundsWon: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    headshots: 0,
    damage: 0,
    kastRounds: 0,
    openingKills: 0,
    openingDeaths: 0,
    utilityDamage: 0,
    flashAssists: 0,
    multiKills: { k2: 0, k3: 0, k4: 0, k5: 0 },
    clutches: { v1: 0, v2: 0, v3: 0, v4: 0, v5: 0 },
    bombPlants: 0,
    bombDefuses: 0,
  };
}

export function mergeRoundStats(a: RoundStats, b: RoundStats): RoundStats {
  return {
    roundsPlayed: a.roundsPlayed + b.roundsPlayed,
    roundsWon: a.roundsWon + b.roundsWon,
    kills: a.kills + b.kills,
    deaths: a.deaths + b.deaths,
    assists: a.assists + b.assists,
    headshots: a.headshots + b.headshots,
    damage: a.damage + b.damage,
    kastRounds: a.kastRounds + b.kastRounds,
    openingKills: a.openingKills + b.openingKills,
    openingDeaths: a.openingDeaths + b.openingDeaths,
    utilityDamage: a.utilityDamage + b.utilityDamage,
    flashAssists: a.flashAssists + b.flashAssists,
    multiKills: {
      k2: a.multiKills.k2 + b.multiKills.k2,
      k3: a.multiKills.k3 + b.multiKills.k3,
      k4: a.multiKills.k4 + b.multiKills.k4,
      k5: a.multiKills.k5 + b.multiKills.k5,
    },
    clutches: {
      v1: a.clutches.v1 + b.clutches.v1,
      v2: a.clutches.v2 + b.clutches.v2,
      v3: a.clutches.v3 + b.clutches.v3,
      v4: a.clutches.v4 + b.clutches.v4,
      v5: a.clutches.v5 + b.clutches.v5,
    },
    bombPlants: a.bombPlants + b.bombPlants,
    bombDefuses: a.bombDefuses + b.bombDefuses,
  };
}

export function totalClutches(clutches: ClutchRecord): number {
  return (
    clutches.v1 + clutches.v2 + clutches.v3 + clutches.v4 + clutches.v5
  );
}

/** Weighted individual skill on a 0-100 scale. */
export function individualSkill(player: PlayerState): number {
  const weights: Record<string, number> = {
    entry: 0.34,
    awp: 0.36,
    igl: 0.2,
    lurker: 0.28,
    support: 0.22,
  };
  const aimWeight = weights[player.role] ?? 0.28;

  const raw =
    player.aim * aimWeight +
    player.reflexes * 0.2 +
    player.gameSense * 0.18 +
    player.clutch * 0.14 +
    player.movement * 0.1 +
    player.utility * (0.38 - aimWeight);

  return clamp(raw + player.form * 2 - player.tilt * 2, 5, 99);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * HLTV Rating 2.x approximation. Kills, survival and impact drive the number,
 * KAST and ADR round it out.
 */
export function computeRating(stats: RoundStats): number {
  if (stats.roundsPlayed === 0) {
    return 1.0;
  }
  const kpr = stats.kills / stats.roundsPlayed;
  const dpr = stats.deaths / stats.roundsPlayed;
  const apr = stats.assists / stats.roundsPlayed;
  const kast = (stats.kastRounds / stats.roundsPlayed) * 100;
  const adr = stats.damage / stats.roundsPlayed;
  const impact = 2.13 * kpr + 0.42 * apr - 0.41;

  const rating =
    0.0073 * kast +
    0.3591 * kpr -
    0.5329 * dpr +
    0.2372 * impact +
    0.0032 * adr +
    0.1587;

  return Math.round(clamp(rating, 0.3, 2.0) * 100) / 100;
}

export function adrOf(stats: RoundStats): number {
  if (stats.roundsPlayed === 0) return 0;
  return Math.round(stats.damage / stats.roundsPlayed);
}

export function kastOf(stats: RoundStats): number {
  if (stats.roundsPlayed === 0) return 0;
  return Math.round((stats.kastRounds / stats.roundsPlayed) * 1000) / 10;
}

export function hsPercentOf(stats: RoundStats): number {
  if (stats.kills === 0) return 0;
  return Math.round((stats.headshots / stats.kills) * 1000) / 10;
}

/* ------------------------------ round engine ------------------------------ */

type RoundOutcome = {
  won: boolean;
  kills: number;
  died: boolean;
  assists: number;
  headshots: number;
  damage: number;
  kast: boolean;
  openingKill: boolean;
  openingDeath: boolean;
  utilityDamage: number;
  flashAssist: boolean;
  clutchSize: number | null;
  clutchWon: boolean;
  planted: boolean;
  defused: boolean;
};

function simulateRound(
  player: PlayerState,
  skill: number,
  teamStrength: number,
  enemyStrength: number,
  side: Side,
  map: CsMap,
): RoundOutcome {
  const sideBonus = map.favours === side ? 0.05 : -0.05;
  const baseWinChance = clamp(
    0.5 + (teamStrength - enemyStrength) / 220 + sideBonus,
    0.15,
    0.85,
  );

  // Kills per round is modelled as "win the first duel, then keep going".
  const kpr = 0.42 + (skill / 100) * 0.5;
  const continuation = clamp(0.3 + (skill / 100) * 0.18, 0.28, 0.5);
  const firstKillChance = clamp(kpr * (1 - continuation), 0.1, 0.72);

  let kills = 0;
  if (Math.random() < firstKillChance) {
    kills = 1;
    while (kills < PLAYERS_PER_SIDE && Math.random() < continuation) {
      kills += 1;
    }
  }

  const deathChance = clamp(0.74 - (skill / 100) * 0.26 - kills * 0.06, 0.18, 0.8);
  const died = Math.random() < deathChance;

  const isEntry = player.role === "entry";
  const openingChance = isEntry ? 0.3 : player.role === "awp" ? 0.22 : 0.12;
  const openingKill = kills > 0 && Math.random() < openingChance;
  const openingDeath =
    died && !openingKill && Math.random() < (isEntry ? 0.24 : 0.1);

  const assistChance = clamp(0.1 + player.utility / 420, 0.08, 0.28);
  const assists = Math.random() < assistChance ? 1 : 0;

  const hsRate = clamp(0.32 + player.aim / 260, 0.28, 0.72);
  let headshots = 0;
  for (let i = 0; i < kills; i += 1) {
    if (Math.random() < hsRate) headshots += 1;
  }

  const utilityDamage =
    Math.random() < clamp(player.utility / 200, 0.1, 0.55)
      ? Math.round(8 + Math.random() * player.utility * 0.4)
      : 0;
  const flashAssist = Math.random() < clamp(player.utility / 500, 0.04, 0.2);

  // 100 HP per enemy: kills are full damage, plus chip damage on survivors.
  const chip = Math.round(Math.random() * 60 * (0.5 + skill / 200));
  const damage = Math.min(
    MAX_ROUND_DAMAGE,
    kills * 100 + chip + utilityDamage,
  );

  // Clutch situations: last man alive against X enemies.
  let clutchSize: number | null = null;
  let clutchWon = false;
  if (!died && Math.random() < 0.11) {
    clutchSize = 1 + Math.floor(Math.random() * 5);
    const clutchChance = clamp(
      (0.62 + player.clutch / 150) / Math.pow(clutchSize, 1.25),
      0.02,
      0.9,
    );
    clutchWon = Math.random() < clutchChance;
  }

  // The clutch decides the round when it happens.
  const won = clutchSize
    ? clutchWon
    : Math.random() < clamp(baseWinChance + kills * 0.07 - (died ? 0.05 : 0), 0.05, 0.95);

  const planted = side === "t" && won && Math.random() < 0.35;
  const defused = side === "ct" && won && Math.random() < 0.18;

  const kast = kills > 0 || assists > 0 || !died || Math.random() < 0.3;

  return {
    won,
    kills,
    died,
    assists,
    headshots,
    damage,
    kast,
    openingKill,
    openingDeath,
    utilityDamage,
    flashAssist,
    clutchSize,
    clutchWon,
    planted,
    defused,
  };
}

function accumulate(stats: RoundStats, outcome: RoundOutcome): void {
  stats.roundsPlayed += 1;
  if (outcome.won) stats.roundsWon += 1;
  stats.kills += outcome.kills;
  stats.deaths += outcome.died ? 1 : 0;
  stats.assists += outcome.assists;
  stats.headshots += outcome.headshots;
  stats.damage += outcome.damage;
  if (outcome.kast) stats.kastRounds += 1;
  if (outcome.openingKill) stats.openingKills += 1;
  if (outcome.openingDeath) stats.openingDeaths += 1;
  stats.utilityDamage += outcome.utilityDamage;
  if (outcome.flashAssist) stats.flashAssists += 1;
  if (outcome.planted) stats.bombPlants += 1;
  if (outcome.defused) stats.bombDefuses += 1;

  if (outcome.kills === 2) stats.multiKills.k2 += 1;
  if (outcome.kills === 3) stats.multiKills.k3 += 1;
  if (outcome.kills === 4) stats.multiKills.k4 += 1;
  if (outcome.kills === 5) stats.multiKills.k5 += 1;

  if (outcome.clutchSize && outcome.clutchWon) {
    const key = `v${outcome.clutchSize}` as keyof ClutchRecord;
    stats.clutches[key] += 1;
  }
}

/** Plays a single MR12 map, including overtime if it reaches 12-12. */
export function simulateMap(
  player: PlayerState,
  teamStrength: number,
  enemyStrength: number,
  map: CsMap,
): { result: MapResult; stats: RoundStats } {
  const stats = emptyRoundStats();
  let ours = 0;
  let theirs = 0;
  let overtime = false;

  // Regulation: 12 rounds per side, first to 13.
  const startSide: Side = Math.random() < 0.5 ? "ct" : "t";
  const flipSide = (side: Side): Side => (side === "ct" ? "t" : "ct");

  while (ours < ROUNDS_TO_WIN && theirs < ROUNDS_TO_WIN) {
    const roundNumber = ours + theirs;
    const side = roundNumber < 12 ? startSide : flipSide(startSide);
    const outcome = simulateRound(
      player,
      individualSkill(player),
      teamStrength,
      enemyStrength,
      side,
      map,
    );
    accumulate(stats, outcome);
    if (outcome.won) ours += 1;
    else theirs += 1;

    if (ours === 12 && theirs === 12) break;
  }

  if (ours === 12 && theirs === 12) {
    overtime = true;
    let otOurs = 0;
    let otTheirs = 0;
    while (
      Math.abs(otOurs - otTheirs) < 2 ||
      (otOurs < OT_ROUNDS_TO_WIN && otTheirs < OT_ROUNDS_TO_WIN)
    ) {
      const side: Side = (otOurs + otTheirs) % 6 < 3 ? "ct" : "t";
      const outcome = simulateRound(
        player,
        individualSkill(player),
        teamStrength,
        enemyStrength,
        side,
        map,
      );
      accumulate(stats, outcome);
      if (outcome.won) otOurs += 1;
      else otTheirs += 1;

      if (
        (otOurs >= OT_ROUNDS_TO_WIN || otTheirs >= OT_ROUNDS_TO_WIN) &&
        Math.abs(otOurs - otTheirs) >= 2
      ) {
        break;
      }
      if (otOurs + otTheirs > 30) break;
    }
    ours += otOurs;
    theirs += otTheirs;
  }

  const result: MapResult = {
    mapId: map.id,
    mapName: map.name,
    roundsWon: ours,
    roundsLost: theirs,
    overtime,
    won: ours > theirs,
    kills: stats.kills,
    deaths: stats.deaths,
    assists: stats.assists,
    adr: adrOf(stats),
    kast: kastOf(stats),
    hsPercent: hsPercentOf(stats),
    rating: computeRating(stats),
    aces: stats.multiKills.k5,
    clutchesWon: totalClutches(stats.clutches),
  };

  return { result, stats };
}

/* ------------------------------ series engine ----------------------------- */

const PLACEMENTS: Record<number, string> = {
  0: "Fase de grupos",
  1: "Top 8",
  2: "Top 4",
  3: "Finalista",
  4: "CAMPEÓN",
};

export function simulateSeries(
  player: PlayerState,
  tournament: Tournament,
): { series: SeriesResult; stats: RoundStats } {
  const teamStrength = clamp(
    player.team.prestige + player.chemistry * 1.5 + individualSkill(player) * 0.25,
    10,
    130,
  );

  const opponents = TEAMS.filter(
    (team) => team.id !== player.team.id && Math.abs(team.tier - player.team.tier) <= 1,
  );
  const opponent =
    opponents[Math.floor(Math.random() * opponents.length)] ?? TEAMS[0];

  // Four stages: groups, quarters, semis, final.
  let stagesWon = 0;
  let aggregateStats = emptyRoundStats();
  const maps: MapResult[] = [];
  let mapsWon = 0;
  let mapsLost = 0;

  for (let stage = 0; stage < 4; stage += 1) {
    const stageOpponentStrength = clamp(
      opponent.prestige + stage * 6 + (Math.random() * 10 - 5),
      10,
      130,
    );

    let stageMapsWon = 0;
    let stageMapsLost = 0;
    const bestOf = stage === 0 ? 1 : 3;
    const needed = Math.ceil(bestOf / 2);

    while (stageMapsWon < needed && stageMapsLost < needed) {
      const map = randomActiveMap();
      const { result, stats } = simulateMap(
        player,
        teamStrength,
        stageOpponentStrength,
        map,
      );
      maps.push(result);
      aggregateStats = mergeRoundStats(aggregateStats, stats);
      if (result.won) {
        stageMapsWon += 1;
        mapsWon += 1;
      } else {
        stageMapsLost += 1;
        mapsLost += 1;
      }
    }

    if (stageMapsWon >= needed) {
      stagesWon += 1;
    } else {
      break;
    }
  }

  const placement = PLACEMENTS[stagesWon] ?? "Fase de grupos";
  const won = stagesWon === 4;
  const rating = computeRating(aggregateStats);

  const prizeShares = [0, 0.04, 0.09, 0.2, 0.4];
  const prizeMoney = Math.round(
    (tournament.prizePool * (prizeShares[stagesWon] ?? 0)) / 5,
  );

  const mvp = won && rating >= 1.15;

  return {
    series: {
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      opponentName: opponent.name,
      bestOf: 3,
      maps,
      mapsWon,
      mapsLost,
      won,
      placement,
      prizeMoney,
      mvp,
      isMajor: Boolean(tournament.isMajor),
    },
    stats: aggregateStats,
  };
}

/** The rival grows on their own so the player always has a benchmark. */
export function advanceRival(player: PlayerState): PlayerState {
  const rival = { ...player.rival };
  const drift = (Math.random() - 0.42) * 0.06;
  rival.rating = Math.round(clamp(rival.rating + drift, 0.75, 1.4) * 100) / 100;
  rival.kills += Math.round(320 + Math.random() * 260);
  if (Math.random() < 0.08) {
    rival.majors += 1;
  }
  return { ...player, rival };
}

export { getMapById };
