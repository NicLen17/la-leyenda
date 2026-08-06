import type { ProPlayer, Region, Role } from "@/lib/types/game";

/** Real CS2 professionals used as rivals, teammates and benchmark names. */
export const PRO_PLAYERS: ProPlayer[] = [
  { nickname: "ZywOo", realName: "Mathieu Herbaut", country: "Francia", role: "awp", teamId: "vitality", rating: 1.29 },
  { nickname: "apEX", realName: "Dan Madesclaire", country: "Francia", role: "igl", teamId: "vitality", rating: 0.95 },
  { nickname: "ropz", realName: "Robin Kool", country: "Estonia", role: "lurker", teamId: "vitality", rating: 1.16 },
  { nickname: "flameZ", realName: "Shahar Shushan", country: "Israel", role: "entry", teamId: "vitality", rating: 1.14 },
  { nickname: "mezii", realName: "William Merriman", country: "Reino Unido", role: "support", teamId: "vitality", rating: 1.08 },

  { nickname: "donk", realName: "Danil Kryshkovets", country: "Rusia", role: "entry", teamId: "spirit", rating: 1.33 },
  { nickname: "sh1ro", realName: "Dmitry Sokolov", country: "Rusia", role: "awp", teamId: "spirit", rating: 1.18 },
  { nickname: "chopper", realName: "Leonid Vishnyakov", country: "Rusia", role: "igl", teamId: "spirit", rating: 0.98 },
  { nickname: "magixx", realName: "Boris Vorobiev", country: "Rusia", role: "support", teamId: "spirit", rating: 1.05 },
  { nickname: "zont1x", realName: "Myroslav Plakhotia", country: "Ucrania", role: "lurker", teamId: "spirit", rating: 1.11 },

  { nickname: "m0NESY", realName: "Ilya Osipov", country: "Rusia", role: "awp", teamId: "g2", rating: 1.22 },
  { nickname: "NiKo", realName: "Nikola Kovač", country: "Bosnia", role: "lurker", teamId: "falcons", rating: 1.17 },
  { nickname: "huNter-", realName: "Nemanja Kovač", country: "Bosnia", role: "entry", teamId: "g2", rating: 1.10 },
  { nickname: "malbsMd", realName: "Mario Samayoa", country: "Guatemala", role: "entry", teamId: "g2", rating: 1.12 },
  { nickname: "Snax", realName: "Janusz Pogorzelski", country: "Polonia", role: "igl", teamId: "g2", rating: 1.00 },

  { nickname: "frozen", realName: "David Čerňanský", country: "Eslovaquia", role: "lurker", teamId: "faze", rating: 1.13 },
  { nickname: "broky", realName: "Helvijs Saukants", country: "Letonia", role: "awp", teamId: "faze", rating: 1.09 },
  { nickname: "Twistzz", realName: "Russel Van Dulken", country: "Canadá", role: "entry", teamId: "faze", rating: 1.11 },
  { nickname: "karrigan", realName: "Finn Andersen", country: "Dinamarca", role: "igl", teamId: "faze", rating: 0.92 },
  { nickname: "rain", realName: "Håvard Nygaard", country: "Noruega", role: "entry", teamId: "faze", rating: 1.02 },

  { nickname: "torzsi", realName: "Ádám Torzsás", country: "Hungría", role: "awp", teamId: "mouz", rating: 1.12 },
  { nickname: "xertioN", realName: "Dorian Berman", country: "Israel", role: "entry", teamId: "mouz", rating: 1.10 },
  { nickname: "Jimpphat", realName: "Jimi Salo", country: "Finlandia", role: "lurker", teamId: "mouz", rating: 1.15 },
  { nickname: "siuhy", realName: "Kamil Szkaradek", country: "Polonia", role: "igl", teamId: "mouz", rating: 0.96 },
  { nickname: "Brollan", realName: "Ludvig Brolin", country: "Suecia", role: "support", teamId: "mouz", rating: 1.08 },

  { nickname: "w0nderful", realName: "Ihor Zhdanov", country: "Ucrania", role: "awp", teamId: "navi", rating: 1.14 },
  { nickname: "b1t", realName: "Valerii Vakhovskyi", country: "Ucrania", role: "entry", teamId: "navi", rating: 1.07 },
  { nickname: "iM", realName: "Justinas Lekavicius", country: "Lituania", role: "lurker", teamId: "navi", rating: 1.09 },
  { nickname: "jL", realName: "Justinas Lekavicius", country: "Lituania", role: "entry", teamId: "navi", rating: 1.10 },
  { nickname: "Aleksib", realName: "Aleksi Virolainen", country: "Finlandia", role: "igl", teamId: "navi", rating: 0.94 },

  { nickname: "KSCERATO", realName: "Kaike Cerato", country: "Brasil", role: "lurker", teamId: "furia", rating: 1.15 },
  { nickname: "yuurih", realName: "Yuri Santos", country: "Brasil", role: "support", teamId: "furia", rating: 1.12 },
  { nickname: "FalleN", realName: "Gabriel Toledo", country: "Brasil", role: "igl", teamId: "furia", rating: 0.97 },
  { nickname: "molodoy", realName: "Danil Golubenko", country: "Kazajistán", role: "awp", teamId: "furia", rating: 1.13 },

  { nickname: "910", realName: "Bilguun Tsedendorj", country: "Mongolia", role: "awp", teamId: "mongolz", rating: 1.14 },
  { nickname: "Senzu", realName: "Garidmagnai Byambasuren", country: "Mongolia", role: "entry", teamId: "mongolz", rating: 1.16 },
  { nickname: "mzinho", realName: "Usukhbayar Banzragch", country: "Mongolia", role: "lurker", teamId: "mongolz", rating: 1.18 },
  { nickname: "bLitz", realName: "Ganbaatar Tsend-Ayush", country: "Mongolia", role: "igl", teamId: "mongolz", rating: 1.01 },
  { nickname: "Techno4K", realName: "Tsatsral Batbayar", country: "Mongolia", role: "support", teamId: "mongolz", rating: 1.06 },

  { nickname: "NertZ", realName: "Roey Amar", country: "Israel", role: "entry", teamId: "liquid", rating: 1.09 },
  { nickname: "ultimate", realName: "Felipe Kenzo", country: "Brasil", role: "awp", teamId: "liquid", rating: 1.07 },
  { nickname: "Twexx", realName: "Tobias Sørensen", country: "Dinamarca", role: "support", teamId: "liquid", rating: 1.04 },

  { nickname: "XANTARES", realName: "Can Dörtkardeş", country: "Turquía", role: "entry", teamId: "eternal-fire", rating: 1.12 },
  { nickname: "MAJ3R", realName: "Engin Küpeli", country: "Turquía", role: "igl", teamId: "eternal-fire", rating: 0.93 },
  { nickname: "woxic", realName: "Özgür Eker", country: "Turquía", role: "awp", teamId: "eternal-fire", rating: 1.08 },

  { nickname: "blameF", realName: "Benjamin Bremer", country: "Dinamarca", role: "lurker", teamId: "astralis", rating: 1.13 },
  { nickname: "jabbi", realName: "Jakob Nygaard", country: "Dinamarca", role: "entry", teamId: "astralis", rating: 1.06 },
  { nickname: "Staehr", realName: "Victor Staehr", country: "Dinamarca", role: "awp", teamId: "astralis", rating: 1.09 },

  { nickname: "electroNic", realName: "Denis Sharipov", country: "Rusia", role: "lurker", teamId: "virtus", rating: 1.08 },
  { nickname: "FL1T", realName: "Timur Basharatyan", country: "Rusia", role: "entry", teamId: "virtus", rating: 1.05 },

  { nickname: "s1mple", realName: "Oleksandr Kostyliev", country: "Ucrania", role: "awp", teamId: "falcons", rating: 1.20 },
  { nickname: "kyxsan", realName: "Rasmus Nordfoss", country: "Dinamarca", role: "support", teamId: "falcons", rating: 1.00 },
  { nickname: "TeSeS", realName: "René Madsen", country: "Dinamarca", role: "igl", teamId: "falcons", rating: 1.05 },
  { nickname: "Magisk", realName: "Emil Reif", country: "Dinamarca", role: "support", teamId: "falcons", rating: 1.06 },
];

export const LEGEND_NAMES = [
  "s1mple",
  "ZywOo",
  "donk",
  "device",
  "coldzera",
  "NiKo",
  "m0NESY",
  "FalleN",
  "sh1ro",
  "KSCERATO",
] as const;

/** Nicknames used when a rival needs to be invented for a lower-tier career. */
export const ROOKIE_NICKS = [
  "kruzz",
  "vexo",
  "dr1ft",
  "pulze",
  "nyte",
  "raxo",
  "slyce",
  "orb1t",
  "hazze",
  "bl1tzen",
  "m0nk",
  "zeru",
  "spyke",
  "quartz",
  "flikk",
];

export const ROOKIE_REAL_NAMES: Record<Region, string[]> = {
  "south-america": [
    "Tomás Ibarra",
    "Lucas Ferreira",
    "Mateo Ruiz",
    "Bruno Almeida",
    "Nicolás Paz",
  ],
  "north-america": [
    "Tyler Brooks",
    "Ethan Vance",
    "Marcus Hale",
    "Owen Clarke",
    "Dylan Reed",
  ],
  europe: [
    "Lukas Vogel",
    "Mateusz Nowak",
    "Théo Girard",
    "Jonas Berg",
    "Marco Rossi",
  ],
  cis: [
    "Artem Volkov",
    "Nikita Orlov",
    "Danil Sokolov",
    "Ruslan Iskakov",
    "Yegor Panov",
  ],
  asia: [
    "Batbayar Tur",
    "Chen Wei",
    "Jae-won Park",
    "Minh Tran",
    "Jack Whitfield",
  ],
};

export function getProsByTeam(teamId: string): ProPlayer[] {
  return PRO_PLAYERS.filter((pro) => pro.teamId === teamId);
}

export function getProsByRole(role: Role): ProPlayer[] {
  return PRO_PLAYERS.filter((pro) => pro.role === role);
}
