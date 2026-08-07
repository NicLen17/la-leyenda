import type { StoreItem } from "@/lib/types/game";
import { CS_CASES } from "./cases";

/**
 * Career shop catalogue. Prices spend from `PlayerState.earnings`
 * (sueldo acumulado + premios + valor de skins), not monthly salary alone.
 */
export const STORE_ITEMS: StoreItem[] = [
  {
    id: "case-revolution",
    name: "Revolution Case",
    description: "Abrí una caja Revolution en cuanto la compres.",
    kind: "case",
    price: 2_500,
    grantsCase: true,
    imagePath: "/ui/cs2-case.webp",
  },
  {
    id: "case-dreams",
    name: "Dreams & Nightmares Case",
    description: "Arte de la comunidad. Una caja lista para unboxear.",
    kind: "case",
    price: 2_800,
    grantsCase: true,
    imagePath: "/ui/cs2-case-2.png",
  },
  {
    id: "case-kilowatt",
    name: "Kilowatt Case",
    description: "Case nativo de CS2. Incluye chance de Kukri.",
    kind: "case",
    price: 3_200,
    grantsCase: true,
    imagePath: "/ui/cs2-case-2.png",
  },
  {
    id: "skin-starter-ak",
    name: "AK-47 | Slate",
    description: "Skin de práctica. +2 aim mientras la tengas.",
    kind: "skin",
    price: 4_500,
    unique: true,
    buff: { attribute: "aim", amount: 2 },
    imagePath: "/store/skin.svg",
  },
  {
    id: "skin-awp-chrome",
    name: "AWP | Atheris",
    description: "Look de sniper. +2 clutch.",
    kind: "skin",
    price: 6_000,
    unique: true,
    buff: { attribute: "clutch", amount: 2 },
    imagePath: "/store/skin.svg",
  },
  {
    id: "coach-aim",
    name: "Sesión de aim coach",
    description: "2 horas con un coach de aim. Buff permanente de aim.",
    kind: "coaching",
    price: 8_000,
    buff: { attribute: "aim", amount: 3 },
    imagePath: "/store/coach.svg",
  },
  {
    id: "coach-utility",
    name: "Sesión de utility IGL",
    description: "Lineups y defaults. +3 utility, +1 game sense.",
    kind: "coaching",
    price: 7_500,
    buff: { attribute: "utility", amount: 3 },
    imagePath: "/store/coach.svg",
  },
  {
    id: "coach-clutch",
    name: "Mental coaching",
    description: "Trabajo de clutch y tilt control. +3 clutch.",
    kind: "coaching",
    price: 7_000,
    buff: { attribute: "clutch", amount: 3 },
    imagePath: "/store/coach.svg",
  },
  {
    id: "peri-mouse",
    name: "Mouse pro 8k Hz",
    description: "Sensor top. +3 reflejos (único).",
    kind: "peripheral",
    price: 12_000,
    unique: true,
    peripheralSlot: "mouse",
    buff: { attribute: "reflexes", amount: 3 },
    imagePath: "/ui/mouse-pro.webp",
  },
  {
    id: "peri-keyboard",
    name: "Teclado TKL magnético",
    description: "Actuación rápida. +2 movement, +1 aim.",
    kind: "peripheral",
    price: 9_000,
    unique: true,
    peripheralSlot: "keyboard",
    buff: { attribute: "movement", amount: 2 },
    imagePath: "/ui/keyboard.webp",
  },
  {
    id: "peri-monitor",
    name: "Monitor 540 Hz",
    description: "Claridad brutal. +3 aim.",
    kind: "peripheral",
    price: 18_000,
    unique: true,
    peripheralSlot: "monitor",
    buff: { attribute: "aim", amount: 3 },
    imagePath: "/ui/monitor.webp",
  },
  {
    id: "peri-headset",
    name: "Headset de estudio",
    description: "Footsteps nítidos. +3 game sense.",
    kind: "peripheral",
    price: 10_000,
    unique: true,
    peripheralSlot: "headset",
    buff: { attribute: "gameSense", amount: 3 },
    imagePath: "/ui/headset-pro.png",
  },
];

export function getStoreItem(id: string): StoreItem | undefined {
  return STORE_ITEMS.find((item) => item.id === id);
}

export function caseIdForStoreItem(item: StoreItem): string | null {
  if (!item.grantsCase) return null;
  if (item.id.includes("dreams")) return "dreams-nightmares";
  if (item.id.includes("kilowatt")) return "kilowatt";
  return CS_CASES[0]?.id ?? null;
}
