import type { Region } from "@/lib/types/game";

export const REGIONS: { id: Region; label: string; flag: string }[] = [
  { id: "south-america", label: "Sudamérica", flag: "🇧🇷" },
  { id: "north-america", label: "Norteamérica", flag: "🇺🇸" },
  { id: "europe", label: "Europa", flag: "🇪🇺" },
  { id: "cis", label: "CIS", flag: "🇷🇺" },
  { id: "asia", label: "Asia / Oceanía", flag: "🌏" },
];

export const NATIONALITIES: Record<Region, string[]> = {
  "south-america": [
    "Argentina",
    "Brasil",
    "Uruguay",
    "Chile",
    "Colombia",
    "Perú",
  ],
  "north-america": ["Estados Unidos", "Canadá", "México"],
  europe: [
    "Francia",
    "Dinamarca",
    "Suecia",
    "Polonia",
    "Alemania",
    "Reino Unido",
    "España",
    "Turquía",
    "Israel",
  ],
  cis: ["Rusia", "Ucrania", "Kazajistán", "Bielorrusia"],
  asia: ["Mongolia", "China", "Australia", "Corea del Sur", "Vietnam"],
};

export const NATIONALITY_FLAGS: Record<string, string> = {
  Argentina: "🇦🇷",
  Brasil: "🇧🇷",
  Uruguay: "🇺🇾",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  Perú: "🇵🇪",
  "Estados Unidos": "🇺🇸",
  Canadá: "🇨🇦",
  México: "🇲🇽",
  Francia: "🇫🇷",
  Dinamarca: "🇩🇰",
  Suecia: "🇸🇪",
  Polonia: "🇵🇱",
  Alemania: "🇩🇪",
  "Reino Unido": "🇬🇧",
  España: "🇪🇸",
  Turquía: "🇹🇷",
  Israel: "🇮🇱",
  Rusia: "🇷🇺",
  Ucrania: "🇺🇦",
  Kazajistán: "🇰🇿",
  Bielorrusia: "🇧🇾",
  Mongolia: "🇲🇳",
  China: "🇨🇳",
  Australia: "🇦🇺",
  "Corea del Sur": "🇰🇷",
  Vietnam: "🇻🇳",
};

export const FAME_LEVELS = [
  { min: 0, label: "Desconocido" },
  { min: 15, label: "Prospecto" },
  { min: 30, label: "Rising Star" },
  { min: 50, label: "Pro consolidado" },
  { min: 70, label: "Estrella" },
  { min: 85, label: "Superestrella" },
  { min: 95, label: "Leyenda" },
] as const;

/* --------------------------- Counter-Strike rules -------------------------- */

/** MR12: first to 13 rounds, 24 in regulation. */
export const ROUNDS_TO_WIN = 13;
export const REGULATION_ROUNDS = 24;
/** Overtime is MR3: first to 4 in each OT block. */
export const OT_ROUNDS_TO_WIN = 4;
export const PLAYERS_PER_SIDE = 5;
/** Max theoretical damage per round against a full enemy team. */
export const MAX_ROUND_DAMAGE = 500;

export const STARTING_AGE = 17;
/**
 * Hard career end. Kept tighter than real life so a full run stays session-length
 * (17 → 28 ≈ 11 years / 22 splits instead of dragging into the early 30s).
 */
export const RETIREMENT_AGE = 28;
export const SPLITS_PER_YEAR = 2;
/** Two splits per year from 17 → 28 ≈ 22 splits max. */
export const MAX_SPLITS = (RETIREMENT_AGE - STARTING_AGE) * SPLITS_PER_YEAR;
/**
 * Narrative + match decisions per split. Three beats keep the season readable
 * without a 150-choice marathon (was 5 → ~150 events; now ~66).
 */
export const EVENTS_PER_SEASON = 3;

/**
 * A "temporada" is one calendar year (2 splits). Shop buffs reset purchase
 * counters at year rollover so coaching/cases can't stack infinitely.
 */
export const STORE_SEASON_LIMITS = {
  coaching: 1,
  cases: 2,
} as const;

/** Career start: tier 3 salaries sit in the reported $1k-$5k band. */
export const ROOKIE_SALARY = 900;

export function careerYearsLeft(age: number): number {
  return Math.max(0, RETIREMENT_AGE - age);
}

export function careerProgress(age: number): number {
  const span = RETIREMENT_AGE - STARTING_AGE;
  return Math.min(1, Math.max(0, (age - STARTING_AGE) / span));
}

export const LEGENDS = [
  {
    name: "s1mple",
    minScore: 940,
    blurb:
      "Rating imposible, Major MVP y highlights que se estudian. Estás en la conversación del GOAT.",
  },
  {
    name: "ZywOo",
    minScore: 880,
    blurb:
      "Consistencia inhumana año tras año. Cada mapa tuyo era un problema para el rival.",
  },
  {
    name: "donk",
    minScore: 820,
    blurb:
      "Explotaste joven y arrasaste con todo. Nadie te quería en su bracket.",
  },
  {
    name: "device",
    minScore: 760,
    blurb:
      "Trofeos, liderazgo silencioso y finales ganadas. La definición de campeón.",
  },
  {
    name: "coldzera",
    minScore: 700,
    blurb:
      "El ícono latinoamericano. Dos veces Major MVP y una jump-shot eterna.",
  },
  {
    name: "NiKo",
    minScore: 640,
    blurb:
      "Fragging brutal durante una década, aunque el Major se te hizo esquivo.",
  },
  {
    name: "FalleN",
    minScore: 560,
    blurb:
      "IGL, AWPer y profesor. Tu influencia excede tus estadísticas.",
  },
  {
    name: "KSCERATO",
    minScore: 470,
    blurb:
      "Rating alto en un equipo que no siempre te acompañó. Respeto absoluto.",
  },
  {
    name: "TACO",
    minScore: 320,
    blurb:
      "Rolero puro: sostuviste equipos y ganaste cosas sin buscar el spotlight.",
  },
  {
    name: "un tier 2 querido",
    minScore: 0,
    blurb:
      "No llegaste al Olimpo, pero viviste del CS y eso ya es ganar.",
  },
] as const;

export const HLTV_TOP20_THRESHOLD = 1.14;
