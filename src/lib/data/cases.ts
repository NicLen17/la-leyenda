import type { CaseItem, CsCase, Graffiti, Rarity } from "@/lib/types/game";

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; glow: string; odds: number }
> = {
  consumer: { label: "Consumer", color: "#b0c3d9", glow: "#b0c3d9", odds: 0 },
  industrial: { label: "Industrial", color: "#5e98d9", glow: "#5e98d9", odds: 0 },
  milspec: { label: "Mil-Spec", color: "#4b69ff", glow: "#4b69ff", odds: 0.7992 },
  restricted: { label: "Restricted", color: "#8847ff", glow: "#8847ff", odds: 0.1598 },
  classified: { label: "Classified", color: "#d32ce6", glow: "#d32ce6", odds: 0.032 },
  covert: { label: "Covert", color: "#eb4b4b", glow: "#eb4b4b", odds: 0.0064 },
  knife: { label: "★ Rare Special", color: "#ffd700", glow: "#ffd700", odds: 0.0026 },
};

/** Real CS drop odds: 79.92% / 15.98% / 3.2% / 0.64% / 0.26%. */
export const CASE_ODDS: { rarity: Rarity; weight: number }[] = [
  { rarity: "milspec", weight: 0.7992 },
  { rarity: "restricted", weight: 0.1598 },
  { rarity: "classified", weight: 0.032 },
  { rarity: "covert", weight: 0.0064 },
  { rarity: "knife", weight: 0.0026 },
];

function item(
  id: string,
  weapon: string,
  name: string,
  rarity: Rarity,
  value: number,
  buff: CaseItem["buff"] = null,
): CaseItem {
  return { id, weapon, name, rarity, value, buff };
}

export const CS_CASES: CsCase[] = [
  {
    id: "revolution",
    name: "Revolution Case",
    blurb: "La caja icónica de la transición a CS2.",
    items: [
      item("rev-ak", "AK-47", "Head Shot", "covert", 95, { attribute: "aim", amount: 3 }),
      item("rev-m4", "M4A4", "Temukau", "covert", 78, { attribute: "aim", amount: 3 }),
      item("rev-p2000", "P2000", "Wicked Sick", "classified", 22, { attribute: "reflexes", amount: 2 }),
      item("rev-glock", "Glock-18", "Umbral Rabbit", "classified", 18, { attribute: "reflexes", amount: 2 }),
      item("rev-mp9", "MP9", "Featherweight", "restricted", 9, { attribute: "movement", amount: 1 }),
      item("rev-r8", "R8 Revolver", "Banana Cannon", "restricted", 7, { attribute: "clutch", amount: 1 }),
      item("rev-p90", "P90", "Neoqueen", "milspec", 2, null),
      item("rev-mac10", "MAC-10", "Sail", "milspec", 1.5, null),
      item("rev-knife", "★ Karambit", "Doppler Phase 2", "knife", 1450, { attribute: "clutch", amount: 4 }),
    ],
  },
  {
    id: "dreams-nightmares",
    name: "Dreams & Nightmares Case",
    blurb: "La caja hecha por la comunidad. Arte puro.",
    items: [
      item("dn-ak", "AK-47", "Nightwish", "covert", 120, { attribute: "aim", amount: 3 }),
      item("dn-mp9", "MP9", "Starlight Protector", "covert", 65, { attribute: "movement", amount: 3 }),
      item("dn-usp", "USP-S", "Ticket to Hell", "classified", 20, { attribute: "clutch", amount: 2 }),
      item("dn-fiveseven", "Five-SeveN", "Scrawl", "classified", 14, { attribute: "reflexes", amount: 2 }),
      item("dn-g3", "G3SG1", "Dream Glade", "restricted", 8, { attribute: "gameSense", amount: 1 }),
      item("dn-dual", "Dual Berettas", "Melondrama", "restricted", 6, { attribute: "reflexes", amount: 1 }),
      item("dn-xm", "XM1014", "Zombie Offensive", "milspec", 2, null),
      item("dn-mag7", "MAG-7", "Foresight", "milspec", 1.2, null),
      item("dn-knife", "★ Butterfly Knife", "Fade", "knife", 2100, { attribute: "clutch", amount: 4 }),
    ],
  },
  {
    id: "kilowatt",
    name: "Kilowatt Case",
    blurb: "El primer case nativo de CS2, con el Kukri.",
    items: [
      item("kw-ak", "AK-47", "Inheritance", "covert", 88, { attribute: "aim", amount: 3 }),
      item("kw-awp", "AWP", "Chrome Cannon", "covert", 72, { attribute: "aim", amount: 3 }),
      item("kw-m4", "M4A1-S", "Black Lotus", "classified", 26, { attribute: "utility", amount: 2 }),
      item("kw-usp", "USP-S", "Jawbreaker", "classified", 17, { attribute: "reflexes", amount: 2 }),
      item("kw-nova", "Nova", "Dark Sigil", "restricted", 5, { attribute: "utility", amount: 1 }),
      item("kw-mp7", "MP7", "Just Smile", "restricted", 6, { attribute: "movement", amount: 1 }),
      item("kw-glock", "Glock-18", "Block-18", "milspec", 3, null),
      item("kw-p90", "P90", "Wave Breaker", "milspec", 1.4, null),
      item("kw-knife", "★ Kukri Knife", "Case Hardened", "knife", 1250, { attribute: "clutch", amount: 4 }),
    ],
  },
  {
    id: "fracture",
    name: "Fracture Case",
    blurb: "Barata de abrir, cara de soñar.",
    items: [
      item("fr-desert", "Desert Eagle", "Printstream", "covert", 145, { attribute: "aim", amount: 3 }),
      item("fr-ak", "AK-47", "Legion of Anubis", "covert", 42, { attribute: "aim", amount: 3 }),
      item("fr-m4", "M4A4", "Tooth Fairy", "classified", 28, { attribute: "utility", amount: 2 }),
      item("fr-galil", "Galil AR", "Connexion", "classified", 12, { attribute: "movement", amount: 2 }),
      item("fr-mag7", "MAG-7", "Monster Call", "restricted", 7, { attribute: "clutch", amount: 1 }),
      item("fr-ssg", "SSG 08", "Mainframe 001", "restricted", 5, { attribute: "reflexes", amount: 1 }),
      item("fr-tec9", "Tec-9", "Brother", "milspec", 2.5, null),
      item("fr-glock", "Glock-18", "Vogue", "milspec", 3.2, null),
      item("fr-knife", "★ Paracord Knife", "Slaughter", "knife", 780, { attribute: "clutch", amount: 4 }),
    ],
  },
];

export function getCaseById(id: string): CsCase | undefined {
  return CS_CASES.find((csCase) => csCase.id === id);
}

export function randomCase(): CsCase {
  return CS_CASES[Math.floor(Math.random() * CS_CASES.length)];
}

/** Weighted roll that honours the real CS unboxing odds. */
export function rollCaseItem(csCase: CsCase): CaseItem {
  const roll = Math.random();
  let cumulative = 0;
  let chosenRarity: Rarity = "milspec";

  for (const entry of CASE_ODDS) {
    cumulative += entry.weight;
    if (roll <= cumulative) {
      chosenRarity = entry.rarity;
      break;
    }
  }

  const candidates = csCase.items.filter((entry) => entry.rarity === chosenRarity);
  if (candidates.length === 0) {
    const fallback = csCase.items.filter((entry) => entry.rarity === "milspec");
    return fallback[Math.floor(Math.random() * fallback.length)] ?? csCase.items[0];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/* -------------------------------- graffiti -------------------------------- */

/** Valve hands out signature graffiti for iconic plays; these mirror that idea. */
export const GRAFFITI: Graffiti[] = [
  {
    id: "gg-ace",
    name: "Full Send",
    reason: "Primer ace en LAN",
    color: "#eb4b4b",
    rarity: "covert",
  },
  {
    id: "gg-clutch",
    name: "Ninja Defuse",
    reason: "Defuse imposible en un 1v3",
    color: "#4b69ff",
    rarity: "classified",
  },
  {
    id: "gg-1v5",
    name: "Impossible Is Nothing",
    reason: "Ganaste un 1v5",
    color: "#ffd700",
    rarity: "knife",
  },
  {
    id: "gg-major",
    name: "Trophy Lift",
    reason: "Campeón de Major",
    color: "#d32ce6",
    rarity: "covert",
  },
  {
    id: "gg-entry",
    name: "First Blood",
    reason: "Racha histórica de opening kills",
    color: "#f97316",
    rarity: "restricted",
  },
  {
    id: "gg-awp",
    name: "One Tap Diff",
    reason: "Cuatro picks de AWP en un solo round",
    color: "#22d3ee",
    rarity: "classified",
  },
  {
    id: "gg-comeback",
    name: "Never Give Up",
    reason: "Remontada desde 12-3 abajo",
    color: "#22c55e",
    rarity: "covert",
  },
  {
    id: "gg-top20",
    name: "Top 20 of the Year",
    reason: "Entraste al ranking HLTV Top 20",
    color: "#ffd700",
    rarity: "knife",
  },
  {
    id: "gg-utility",
    name: "Smoke Criminal",
    reason: "Lineup que definió una final",
    color: "#8847ff",
    rarity: "restricted",
  },
  {
    id: "gg-crowd",
    name: "Crowd Goes Wild",
    reason: "La arena entera gritó tu nick",
    color: "#facc15",
    rarity: "classified",
  },
];

export function getGraffitiById(id: string): Graffiti | undefined {
  return GRAFFITI.find((entry) => entry.id === id);
}
