import type { Tier, Tournament } from "@/lib/types/game";

/** Prize pools mirror the real circuit (Majors at $1.25M, IEM/BLAST at $1M/$500k). */
export const TOURNAMENTS: Tournament[] = [
  /* -------------------------------- tier 3 -------------------------------- */
  {
    id: "open-qualifier",
    name: "Open Qualifier",
    shortName: "OQ",
    tier: 3,
    prestige: 15,
    prizePool: 2_000,
    winnerShare: 1_000,
    format: "Bo1 single elim",
  },
  {
    id: "cct-series",
    name: "CCT Regional Series",
    shortName: "CCT",
    tier: 3,
    prestige: 28,
    prizePool: 25_000,
    winnerShare: 10_000,
    format: "Bo3 groups + playoffs",
  },
  {
    id: "esea-advanced",
    name: "ESEA Advanced Division",
    shortName: "ESEA",
    tier: 3,
    prestige: 30,
    prizePool: 30_000,
    winnerShare: 12_000,
    format: "Liga regular",
  },
  {
    id: "elisa-invitational",
    name: "Elisa Invitational",
    shortName: "ELISA",
    tier: 3,
    prestige: 34,
    prizePool: 50_000,
    winnerShare: 20_000,
    format: "Bo3 playoffs",
  },
  {
    id: "fissure-playground",
    name: "Fissure Playground",
    shortName: "FISS",
    tier: 3,
    prestige: 36,
    prizePool: 60_000,
    winnerShare: 25_000,
    format: "Bo3 LAN chica",
  },

  /* -------------------------------- tier 2 -------------------------------- */
  {
    id: "esl-challenger",
    name: "ESL Challenger League",
    shortName: "ESL CL",
    tier: 2,
    prestige: 52,
    prizePool: 150_000,
    winnerShare: 50_000,
    format: "Liga + playoffs",
  },
  {
    id: "thunderpick",
    name: "Thunderpick World Championship",
    shortName: "TWC",
    tier: 2,
    prestige: 56,
    prizePool: 250_000,
    winnerShare: 90_000,
    format: "Bo3 doble elim",
  },
  {
    id: "yalla-compass",
    name: "YaLLa Compass",
    shortName: "YaLLa",
    tier: 2,
    prestige: 54,
    prizePool: 200_000,
    winnerShare: 70_000,
    format: "LAN internacional",
  },
  {
    id: "rmr",
    name: "Major Regional Qualifier (RMR)",
    shortName: "RMR",
    tier: 2,
    prestige: 70,
    prizePool: 100_000,
    winnerShare: 30_000,
    format: "Swiss Bo3 · plaza al Major",
  },
  {
    id: "iem-dallas",
    name: "IEM Dallas",
    shortName: "Dallas",
    tier: 2,
    prestige: 66,
    prizePool: 250_000,
    winnerShare: 100_000,
    format: "Groups + playoffs",
  },
  {
    id: "blast-open",
    name: "BLAST Open",
    shortName: "BLAST Open",
    tier: 2,
    prestige: 60,
    prizePool: 200_000,
    winnerShare: 80_000,
    format: "Bo3 doble elim",
  },

  /* -------------------------------- tier 1 -------------------------------- */
  {
    id: "esl-pro-league",
    name: "ESL Pro League",
    shortName: "EPL",
    tier: 1,
    prestige: 82,
    prizePool: 850_000,
    winnerShare: 200_000,
    format: "Groups Bo3 + playoffs",
  },
  {
    id: "iem-chengdu",
    name: "IEM Chengdu",
    shortName: "Chengdu",
    tier: 1,
    prestige: 80,
    prizePool: 500_000,
    winnerShare: 200_000,
    format: "16 equipos, Bo3",
  },
  {
    id: "blast-premier-spring",
    name: "BLAST Premier Spring Final",
    shortName: "BLAST Spring",
    tier: 1,
    prestige: 84,
    prizePool: 425_000,
    winnerShare: 200_000,
    format: "8 equipos, doble elim",
  },
  {
    id: "blast-world-final",
    name: "BLAST Premier World Final",
    shortName: "BLAST WF",
    tier: 1,
    prestige: 90,
    prizePool: 1_000_000,
    winnerShare: 500_000,
    format: "Los 8 mejores del año",
  },
  {
    id: "iem-katowice",
    name: "IEM Katowice",
    shortName: "Katowice",
    tier: 1,
    prestige: 94,
    prizePool: 1_000_000,
    winnerShare: 400_000,
    format: "Spodek · el templo del CS",
  },
  {
    id: "iem-cologne",
    name: "IEM Cologne",
    shortName: "Cologne",
    tier: 1,
    prestige: 95,
    prizePool: 1_000_000,
    winnerShare: 400_000,
    format: "LANXESS arena · Cathedral of CS",
  },
  {
    id: "pgl-major",
    name: "PGL Major Championship",
    shortName: "MAJOR",
    tier: 1,
    prestige: 100,
    prizePool: 1_250_000,
    winnerShare: 500_000,
    isMajor: true,
    format: "Swiss + playoffs Bo3",
  },
  {
    id: "starladder-major",
    name: "StarLadder Major",
    shortName: "MAJOR",
    tier: 1,
    prestige: 100,
    prizePool: 1_250_000,
    winnerShare: 500_000,
    isMajor: true,
    format: "Swiss + playoffs Bo3",
  },
];

export function getTournamentById(id: string): Tournament | undefined {
  return TOURNAMENTS.find((tournament) => tournament.id === id);
}

/**
 * Calendar by team tier, with progressive unlock inside the ladder:
 * - T3: open qualifiers first; invite-style CCT/ESEA/Fissure as the career continues
 * - T2: Challenger circuit; RMR returns every third split (Major pathway flavor)
 * - T1: regular big events; Majors ~once a year (split % 4 === 3); Spodek/Cologne
 *   only after enough ladder time so rookies on a hot desk don't open on a Major
 */
export function getSeasonTournament(tier: Tier, split: number): Tournament {
  const pool = TOURNAMENTS.filter((tournament) => tournament.tier === tier);
  if (pool.length === 0) {
    return TOURNAMENTS[0];
  }

  const regular = pool
    .filter((tournament) => !tournament.isMajor)
    .sort((a, b) => a.prestige - b.prestige);

  if (tier === 1 && split % 4 === 3 && split >= 5) {
    const majors = pool.filter((tournament) => tournament.isMajor);
    if (majors.length > 0) {
      return majors[Math.floor(split / 4) % majors.length];
    }
  }

  if (tier === 3) {
    // Unlock higher domestic invites as splits pile up (open → CCT → ESEA…).
    const unlockCount = Math.min(
      regular.length,
      Math.max(2, 2 + Math.floor((split - 1) / 2)),
    );
    const band = regular.slice(0, unlockCount);
    return band[(split - 1) % band.length] ?? regular[0];
  }

  if (tier === 2) {
    // RMR every 3rd split once you've ground the ladder a bit.
    if (split >= 3 && split % 3 === 0) {
      const rmr = pool.find((tournament) => tournament.id === "rmr");
      if (rmr) return rmr;
    }
    const withoutRmr = regular.filter((tournament) => tournament.id !== "rmr");
    const source = withoutRmr.length > 0 ? withoutRmr : regular;
    // Soft unlock: early T2 stays on lower prestige invites.
    const unlockCount = Math.min(
      source.length,
      Math.max(3, 3 + Math.floor((split - 1) / 2)),
    );
    const band = source.slice(0, unlockCount);
    return band[(split - 1) % band.length] ?? source[0];
  }

  // T1: Katowice / Cologne / BLAST WF require some career spine.
  let source = regular;
  if (split < 6) {
    source = regular.filter((tournament) => tournament.prestige < 90);
  } else if (split < 10) {
    source = regular.filter((tournament) => tournament.prestige < 94);
  }
  if (source.length === 0) source = regular;
  return source[(split - 1) % source.length] ?? source[0];
}
