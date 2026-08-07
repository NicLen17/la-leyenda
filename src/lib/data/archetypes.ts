import type { Archetype, Role, RoleInfo } from "@/lib/types/game";

export const ROLES: RoleInfo[] = [
  {
    id: "entry",
    label: "Entry Fragger",
    tag: "ENTRY",
    description:
      "Primer contacto. Abrís el site y comprás espacio con tu vida.",
    image: "/ui/entry.webp",
    bonuses: { aim: 6, reflexes: 5, movement: 3 },
  },
  {
    id: "awp",
    label: "AWPer",
    tag: "AWP",
    description:
      "El rifle de $4750. Un pick tuyo vale el round entero.",
    image: "/ui/awpcs.webp",
    bonuses: { aim: 7, reflexes: 4, clutch: 3 },
  },
  {
    id: "igl",
    label: "In-Game Leader",
    tag: "IGL",
    description:
      "Llamás el default, leés la economía y gastás los timeouts.",
    image: "/ui/igl.webp",
    bonuses: { gameSense: 8, utility: 5, clutch: 2 },
  },
  {
    id: "lurker",
    label: "Lurker",
    tag: "LURK",
    description:
      "Jugás solo el flanco. Timing e info: aparecés cuando duele.",
    image: "/ui/lurker.webp",
    bonuses: { gameSense: 5, clutch: 6, movement: 4 },
  },
  {
    id: "support",
    label: "Support",
    tag: "SUP",
    description:
      "Flashes, smokes y trades. El equipo brilla porque vos lo sostenés.",
    image: "/ui/support.webp",
    bonuses: { utility: 8, gameSense: 4, aim: 2 },
  },
];

export const ROLE_LABELS: Record<Role, string> = {
  entry: "Entry Fragger",
  awp: "AWPer",
  igl: "IGL",
  lurker: "Lurker",
  support: "Support",
};

/**
 * Archetypes are drawn from Counter-Strike culture rather than sports tropes:
 * spray control, crosshair placement, utility theory, economy reads.
 */
export const ARCHETYPES: Archetype[] = [
  {
    id: "spray-transfer",
    label: "Spray Transfer",
    tag: "RECOIL",
    description: "+8 Aim · +3 Movement",
    flavour:
      "Controlás el patrón del AK como si fuera un láser. Dos cuerpos con una ráfaga y transfer al tercero.",
    bonuses: { aim: 8, movement: 3 },
  },
  {
    id: "crosshair-placement",
    label: "Crosshair Placement",
    tag: "PRE-AIM",
    description: "+7 Reflejos · +4 Game Sense",
    flavour:
      "Tu mira ya está en la cabeza antes de que el enemigo aparezca. No hacés flicks: no los necesitás.",
    bonuses: { reflexes: 7, gameSense: 4 },
  },
  {
    id: "utility-theory",
    label: "Utility Theory",
    tag: "NADES",
    description: "+9 Utility · +3 Game Sense",
    flavour:
      "Memorizás cada lineup: smokes, molotovs y flashes. Ganás rounds sin disparar porque te acordás del pixel.",
    bonuses: { utility: 9, gameSense: 3 },
  },
  {
    id: "clutch-minister",
    label: "Clutch Minister",
    tag: "1vX",
    description: "+9 Clutch · +3 Reflejos",
    flavour:
      "Cuando quedás solo, el server se calla. 1v3 con pistola y el chat escribiendo tu nombre.",
    bonuses: { clutch: 9, reflexes: 3 },
  },
  {
    id: "economy-brain",
    label: "Economy Brain",
    tag: "ECO",
    description: "+9 Game Sense · +3 Utility",
    flavour:
      "Contás la plata del rival mejor que ellos. Sabés cuándo forzar y cuándo romper el save.",
    bonuses: { gameSense: 9, utility: 3 },
  },
  {
    id: "movement-demon",
    label: "Movement Demon",
    tag: "MOVE",
    description: "+8 Movement · +4 Reflejos",
    flavour:
      "Counter-strafeás perfecto, jiggle peek imposible de trackear. Te movés como si el tick fuera tuyo.",
    bonuses: { movement: 8, reflexes: 4 },
  },
];

export function getArchetypeById(id: string): Archetype | undefined {
  return ARCHETYPES.find((archetype) => archetype.id === id);
}

/** Three random archetypes offered at career start, like El Ídolo's dice roll. */
export function rollArchetypes(count = 3): Archetype[] {
  const pool = [...ARCHETYPES];
  const picked: Archetype[] = [];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}
