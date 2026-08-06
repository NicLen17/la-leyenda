import { ROLES } from "@/lib/data/archetypes";
import { ROOKIE_NICKS, ROOKIE_REAL_NAMES } from "@/lib/data/pros";
import type { CareerSetup, Region, Role } from "@/lib/types/game";
import { NATIONALITIES, REGIONS } from "./constants";

function pick<T>(items: readonly T[], seed?: number): T {
  if (seed === undefined) {
    return items[Math.floor(Math.random() * items.length)];
  }
  return items[seed % items.length];
}

/** Deterministic hash so everyone gets the same daily challenge. */
function dailySeed(date = new Date()): number {
  const key = date.toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDailySetup(date = new Date()): CareerSetup {
  const seed = dailySeed(date);
  const region = pick(REGIONS, seed).id;
  const nationality = pick(NATIONALITIES[region], seed >> 3);
  const role = pick(ROLES, seed >> 6).id;

  return {
    nickname: pick(ROOKIE_NICKS, seed >> 9),
    realName: pick(ROOKIE_REAL_NAMES[region], seed >> 12),
    nationality,
    region,
    role,
    isDaily: true,
  };
}

export function getRandomSetup(): CareerSetup {
  const region = pick(REGIONS).id as Region;
  return {
    nickname: pick(ROOKIE_NICKS),
    realName: pick(ROOKIE_REAL_NAMES[region]),
    nationality: pick(NATIONALITIES[region]),
    region,
    role: pick(ROLES).id as Role,
    isDaily: false,
  };
}
