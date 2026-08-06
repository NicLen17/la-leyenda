import type {
  MapCareerStat,
  OgRankId,
  PlayerState,
  PremierBand,
  RankSnapshot,
} from "@/lib/types/game";
import { individualSkill } from "./simulator";

type PremierBandMeta = {
  id: PremierBand;
  min: number;
  label: string;
  color: string;
  glow: string;
};

/** CS2 Premier colour bands (grey → gold by CS Rating). */
export const PREMIER_BANDS: PremierBandMeta[] = [
  { id: "grey", min: 0, label: "Grey", color: "#9ca3af", glow: "#6b7280" },
  { id: "lightBlue", min: 5_000, label: "Light Blue", color: "#7dd3fc", glow: "#38bdf8" },
  { id: "blue", min: 10_000, label: "Blue", color: "#3b82f6", glow: "#2563eb" },
  { id: "purple", min: 15_000, label: "Purple", color: "#a855f7", glow: "#9333ea" },
  { id: "pink", min: 20_000, label: "Pink", color: "#ec4899", glow: "#db2777" },
  { id: "red", min: 25_000, label: "Red", color: "#ef4444", glow: "#dc2626" },
  { id: "gold", min: 30_000, label: "Gold", color: "#fbbf24", glow: "#f59e0b" },
];

type OgRankMeta = {
  id: OgRankId;
  label: string;
  short: string;
  /** Premier rating floor that maps to this classic rank. */
  premierMin: number;
  color: string;
  tier: "silver" | "gold" | "mg" | "eagle" | "elite";
};

/** Classic CS:GO competitive ranks, mapped onto Premier bands. */
export const OG_RANKS: OgRankMeta[] = [
  { id: "s1", label: "Silver I", short: "S1", premierMin: 0, color: "#c0c0c0", tier: "silver" },
  { id: "s2", label: "Silver II", short: "S2", premierMin: 2_000, color: "#c0c0c0", tier: "silver" },
  { id: "s3", label: "Silver III", short: "S3", premierMin: 3_500, color: "#c0c0c0", tier: "silver" },
  { id: "s4", label: "Silver IV", short: "S4", premierMin: 5_000, color: "#c0c0c0", tier: "silver" },
  { id: "se", label: "Silver Elite", short: "SE", premierMin: 6_500, color: "#d4d4d8", tier: "silver" },
  { id: "sem", label: "Silver Elite Master", short: "SEM", premierMin: 8_000, color: "#e4e4e7", tier: "silver" },
  { id: "gn1", label: "Gold Nova I", short: "GN1", premierMin: 9_500, color: "#facc15", tier: "gold" },
  { id: "gn2", label: "Gold Nova II", short: "GN2", premierMin: 11_000, color: "#facc15", tier: "gold" },
  { id: "gn3", label: "Gold Nova III", short: "GN3", premierMin: 12_500, color: "#eab308", tier: "gold" },
  { id: "gnm", label: "Gold Nova Master", short: "GNM", premierMin: 14_000, color: "#ca8a04", tier: "gold" },
  { id: "mg1", label: "Master Guardian I", short: "MG1", premierMin: 15_500, color: "#60a5fa", tier: "mg" },
  { id: "mg2", label: "Master Guardian II", short: "MG2", premierMin: 17_000, color: "#3b82f6", tier: "mg" },
  { id: "mge", label: "Master Guardian Elite", short: "MGE", premierMin: 18_500, color: "#2563eb", tier: "mg" },
  { id: "dmg", label: "Distinguished Master Guardian", short: "DMG", premierMin: 20_000, color: "#1d4ed8", tier: "mg" },
  { id: "le", label: "Legendary Eagle", short: "LE", premierMin: 22_000, color: "#f59e0b", tier: "eagle" },
  { id: "lem", label: "Legendary Eagle Master", short: "LEM", premierMin: 24_000, color: "#ea580c", tier: "eagle" },
  { id: "smfc", label: "Supreme Master First Class", short: "SMFC", premierMin: 26_500, color: "#a855f7", tier: "elite" },
  { id: "ge", label: "The Global Elite", short: "GE", premierMin: 30_000, color: "#ef4444", tier: "elite" },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getPremierBand(rating: number): PremierBandMeta {
  let band = PREMIER_BANDS[0];
  for (const entry of PREMIER_BANDS) {
    if (rating >= entry.min) band = entry;
  }
  return band;
}

export function getOgRank(premierRating: number): OgRankMeta {
  let rank = OG_RANKS[0];
  for (const entry of OG_RANKS) {
    if (premierRating >= entry.premierMin) rank = entry;
  }
  return rank;
}

function mapsWon(mapStats: MapCareerStat[]): number {
  return mapStats.reduce((sum, map) => sum + map.wins, 0);
}

function mapsPlayed(mapStats: MapCareerStat[]): number {
  return mapStats.reduce((sum, map) => sum + map.played, 0);
}

/**
 * Derives a CS2 Premier CS Rating from career standing.
 * Rookies sit near 1–3k; Major winners with elite rating can push 30k+.
 */
export function computePremierRating(player: PlayerState): number {
  const skill = individualSkill(player);
  const played = mapsPlayed(player.mapStats);
  const wins = mapsWon(player.mapStats);
  const winRate = played > 0 ? wins / played : 0.45;

  const skillPart = skill * 95;
  const ratingPart = Math.max(0, player.rating - 0.75) * 14_000;
  const famePart = player.fame * 70;
  const trophyPart = player.trophies * 380 + player.majors * 1_600 + player.mvps * 220;
  const volumePart = Math.min(played, 180) * 28 + wins * 45;
  const winPart = winRate * 2_400;
  const tierPart =
    player.team.tier === 1 ? 2_800 : player.team.tier === 2 ? 1_200 : 0;
  const top20Part = player.hltvTop20
    ? Math.max(0, 21 - player.hltvTop20) * 180
    : 0;
  const formPart = player.form * 180 - player.tilt * 120;
  const benchPenalty = player.benched ? 1_800 : 0;

  const raw =
    1_100 +
    skillPart +
    ratingPart +
    famePart +
    trophyPart +
    volumePart +
    winPart +
    tierPart +
    top20Part +
    formPart -
    benchPenalty;

  return Math.round(clamp(raw, 1_000, 35_000));
}

export function getRankSnapshot(player: PlayerState): RankSnapshot {
  const premierRating = player.premierRating || computePremierRating(player);
  const band = getPremierBand(premierRating);
  const og = getOgRank(premierRating);
  return {
    premierRating,
    premierBand: band.id,
    premierLabel: band.label,
    ogRank: og.id,
    ogLabel: og.label,
  };
}

export function refreshRanks(player: PlayerState): PlayerState {
  const premierRating = computePremierRating(player);
  return {
    ...player,
    premierRating,
    peakPremierRating: Math.max(player.peakPremierRating ?? 0, premierRating),
  };
}

export function emptyMapStats(): MapCareerStat[] {
  return [];
}

export function mergeMapResults(
  current: MapCareerStat[],
  maps: {
    mapId: string;
    mapName: string;
    won: boolean;
    kills: number;
    deaths: number;
    rating: number;
    adr: number;
  }[],
): MapCareerStat[] {
  const next = new Map(current.map((entry) => [entry.mapId, { ...entry }]));

  for (const map of maps) {
    const existing = next.get(map.mapId) ?? {
      mapId: map.mapId,
      mapName: map.mapName,
      played: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      ratingSum: 0,
      adrSum: 0,
    };
    existing.played += 1;
    if (map.won) existing.wins += 1;
    existing.kills += map.kills;
    existing.deaths += map.deaths;
    existing.ratingSum += map.rating;
    existing.adrSum += map.adr;
    existing.mapName = map.mapName;
    next.set(map.mapId, existing);
  }

  return Array.from(next.values()).sort((a, b) => b.played - a.played);
}

export function mapWinRate(stat: MapCareerStat): number {
  if (stat.played === 0) return 0;
  return Math.round((stat.wins / stat.played) * 1000) / 10;
}

export function mapAvgRating(stat: MapCareerStat): number {
  if (stat.played === 0) return 0;
  return Math.round((stat.ratingSum / stat.played) * 100) / 100;
}

export function mapAvgAdr(stat: MapCareerStat): number {
  if (stat.played === 0) return 0;
  return Math.round(stat.adrSum / stat.played);
}
