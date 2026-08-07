import type { CsMap } from "@/lib/types/game";

/**
 * Map metadata + palettes. Hero art uses CS2 preview shots under
 * /public/maps/preview (not radar overviews).
 */
export const CS_MAPS: CsMap[] = [
  {
    id: "mirage",
    name: "Mirage",
    pool: "active",
    favours: "t",
    palette: {
      sky: "#3f6fa8",
      ground: "#c8a26a",
      accent: "#f2d49b",
      structure: "#8a6b45",
    },
    callouts: ["Mid", "Palace", "Connector", "Jungle", "Apps", "Ramp", "Window"],
    sites: ["A", "B"],
    blurb: "El clásico. Todo pasa por el control de mid y window.",
    imagePath: "/maps/preview/miragecs2.webp",
  },
  {
    id: "inferno",
    name: "Inferno",
    pool: "active",
    favours: "ct",
    palette: {
      sky: "#7a3b1f",
      ground: "#b06239",
      accent: "#f0a15c",
      structure: "#5c2f18",
    },
    callouts: ["Banana", "Apps", "Pit", "Arch", "Balcony", "Second Mid"],
    sites: ["A", "B"],
    blurb: "Guerra de utilidad. Banana define media partida.",
    imagePath: "/maps/preview/infernocs2.jpg",
  },
  {
    id: "nuke",
    name: "Nuke",
    pool: "active",
    favours: "ct",
    palette: {
      sky: "#2b4a63",
      ground: "#8b9aa6",
      accent: "#6fd3e8",
      structure: "#3d5566",
    },
    callouts: ["Outside", "Ramp", "Heaven", "Vents", "Secret", "Lobby"],
    sites: ["A", "B"],
    blurb: "Verticalidad pura. El CT que sabe rotar te come vivo.",
    imagePath: "/maps/preview/nukecs2.jpeg",
  },
  {
    id: "ancient",
    name: "Ancient",
    pool: "active",
    favours: "t",
    palette: {
      sky: "#1f4a37",
      ground: "#4f7a52",
      accent: "#9fe6a0",
      structure: "#2f5a41",
    },
    callouts: ["Donut", "Cave", "Temple", "Mid", "Ramp", "Elbow"],
    sites: ["A", "B"],
    blurb: "Selva y ejecuciones milimétricas. Mid vale oro.",
    imagePath: "/maps/preview/ancient.webp",
  },
  {
    id: "anubis",
    name: "Anubis",
    pool: "active",
    favours: "t",
    palette: {
      sky: "#2c3f7a",
      ground: "#c9a44c",
      accent: "#ffd77a",
      structure: "#6b5220",
    },
    callouts: ["Canals", "Palace", "Bridge", "Connector", "Heaven", "Street"],
    sites: ["A", "B"],
    blurb: "Mapa de T. Si no retomás, no ganás halves de CT.",
    imagePath: "/maps/preview/anubis.webp",
  },
  {
    id: "dust2",
    name: "Dust II",
    pool: "active",
    favours: "ct",
    palette: {
      sky: "#6b93c0",
      ground: "#d6b878",
      accent: "#ffe6a8",
      structure: "#9b7d4d",
    },
    callouts: ["Long", "Catwalk", "Tunnels", "Short", "Pit", "Car"],
    sites: ["A", "B"],
    blurb: "El mapa que todos creen conocer. Duelos de AWP eternos.",
    imagePath: "/maps/preview/dust2.webp",
  },
  {
    id: "cache",
    name: "Cache",
    pool: "active",
    favours: "ct",
    palette: {
      sky: "#4a5c6a",
      ground: "#96a3ad",
      accent: "#8fd0ff",
      structure: "#3b4a56",
    },
    callouts: ["Mid", "Squeaky", "Highway", "Checkers", "Z", "Vents"],
    sites: ["A", "B"],
    blurb: "Volvió al pool. Control de mid y de highway manda.",
    imagePath: "/maps/preview/cachecs2.jpg",
  },
  {
    id: "overpass",
    name: "Overpass",
    pool: "reserve",
    favours: "ct",
    palette: {
      sky: "#4e6b52",
      ground: "#9aa88b",
      accent: "#cfe8a8",
      structure: "#4a5544",
    },
    callouts: ["Monster", "Toilets", "Bathrooms", "Connector", "Long", "Party"],
    sites: ["A", "B"],
    blurb: "Fuera del Active Duty pero sigue en Competitive.",
    imagePath: "/maps/preview/overpass.webp",
  },
  {
    id: "train",
    name: "Train",
    pool: "reserve",
    favours: "ct",
    palette: {
      sky: "#3a4450",
      ground: "#7d8790",
      accent: "#b9c6d1",
      structure: "#2c343d",
    },
    callouts: ["Ivy", "Popdog", "Ladder", "Connector", "Z", "Alley"],
    sites: ["A", "B"],
    blurb: "Trenes, ángulos imposibles y retakes durísimos.",
    imagePath: "/maps/preview/train.webp",
  },
  {
    id: "vertigo",
    name: "Vertigo",
    pool: "reserve",
    favours: "ct",
    palette: {
      sky: "#5b6570",
      ground: "#a8a196",
      accent: "#ffcf87",
      structure: "#4a4239",
    },
    callouts: ["Ramp", "Scaffolding", "Elevator", "Mid", "Sandbags", "B Stairs"],
    sites: ["A", "B"],
    blurb: "El rascacielos. Un mal paso y te caés literalmente.",
    imagePath: "/maps/preview/vertigo.webp",
  },
];

export const ACTIVE_DUTY = CS_MAPS.filter((map) => map.pool === "active");

export function getMapById(id: string): CsMap | undefined {
  return CS_MAPS.find((map) => map.id === id);
}

export function randomActiveMap(): CsMap {
  return ACTIVE_DUTY[Math.floor(Math.random() * ACTIVE_DUTY.length)];
}
