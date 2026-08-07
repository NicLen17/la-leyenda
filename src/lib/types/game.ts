export type Role = "entry" | "awp" | "igl" | "lurker" | "support";

export type Region =
  | "south-america"
  | "north-america"
  | "europe"
  | "cis"
  | "asia";

export type Tier = 1 | 2 | 3;

export type Side = "ct" | "t";

export type EventCategory =
  | "career"
  | "team"
  | "personal"
  | "match"
  | "transfer"
  | "meta"
  | "lockerRoom";

export type GamePhase =
  | "setup"
  | "archetype"
  | "event"
  | "minigame"
  | "risk"
  | "outcome"
  | "market"
  | "seasonSummary"
  | "retired";

/** Per-year (temporada) shop purchase counters — reset on year rollover. */
export type StoreSeasonPurchases = {
  coaching: number;
  cases: number;
};

export type AttributeKey =
  | "aim"
  | "reflexes"
  | "gameSense"
  | "utility"
  | "clutch"
  | "movement";

export type MinigameKind =
  | "flick"
  | "reaction"
  | "defuse"
  | "coinflip"
  | "case"
  | "hold"
  | "lineup"
  | "retake"
  | "economy"
  | "awpPeek"
  | "plant";

export type PeripheralSlot = "mouse" | "keyboard" | "monitor" | "headset";

export type StoreItemKind = "case" | "skin" | "coaching" | "peripheral";

export type StoreItem = {
  id: string;
  name: string;
  description: string;
  kind: StoreItemKind;
  /** Price deducted from spendable `earnings`. */
  price: number;
  buff?: { attribute: AttributeKey; amount: number } | null;
  /** One-time purchase (peripherals / unique skins). */
  unique?: boolean;
  peripheralSlot?: PeripheralSlot;
  /** Adds one unopened case to inventory when bought. */
  grantsCase?: boolean;
  imagePath?: string;
};

export type OutcomeKind =
  | "win"
  | "clutch"
  | "fail"
  | "transfer"
  | "case"
  | "neutral"
  | "training";

/** Visual category for "Momentos del split" entries. */
export type HighlightKind =
  | OutcomeKind
  | "bench"
  | "graffiti"
  | "locker"
  | "career"
  | "personal"
  | "match"
  | "team"
  | "meta";

export type SeasonHighlight = {
  text: string;
  kind: HighlightKind;
};

export type Rarity =
  | "consumer"
  | "industrial"
  | "milspec"
  | "restricted"
  | "classified"
  | "covert"
  | "knife";

/* ---------------------------------- teams --------------------------------- */

export type Team = {
  id: string;
  name: string;
  shortName: string;
  region: Region;
  tier: Tier;
  /** HLTV-style world ranking strength, 0-100 */
  prestige: number;
  /** Estimated monthly roster salary budget in USD (real-world estimates) */
  budgetMonthly: number;
  colors: { primary: string; secondary: string };
  /** Short identity blurb shown in the transfer market */
  blurb: string;
  /** Optional local logo under /public/teams/real-logo. */
  logoPath?: string;
};

export type TeamOffer = {
  team: Team;
  /** Monthly salary in USD offered to the player */
  salaryMonthly: number;
  /** Contract length in years */
  years: number;
  role: Role;
  /** true when the player would start on the bench */
  benchRisk: boolean;
  starRole: boolean;
  fameDelta: number;
  note: string;
};

/* --------------------------------- players -------------------------------- */

export type ProPlayer = {
  nickname: string;
  realName: string;
  country: string;
  role: Role;
  teamId: string;
  rating: number;
};

export type RivalPlayer = {
  nickname: string;
  realName: string;
  country: string;
  role: Role;
  rating: number;
  kills: number;
  majors: number;
  teamName: string;
};

/* ---------------------------------- maps ---------------------------------- */

export type CsMap = {
  id: string;
  name: string;
  pool: "active" | "reserve";
  /** Which side historically favoured, used by the simulator */
  favours: Side;
  palette: { sky: string; ground: string; accent: string; structure: string };
  callouts: string[];
  sites: [string, string];
  blurb: string;
  /** Local hero/radar asset under /public (object-cover). */
  imagePath?: string;
};

/* ------------------------------- tournaments ------------------------------ */

export type Tournament = {
  id: string;
  name: string;
  shortName: string;
  tier: Tier;
  prestige: number;
  /** Total prize pool in USD */
  prizePool: number;
  /** Champion share in USD */
  winnerShare: number;
  isMajor?: boolean;
  format: string;
};

/* -------------------------------- cosmetics ------------------------------- */

export type Graffiti = {
  id: string;
  name: string;
  /** What the player did to earn it */
  reason: string;
  color: string;
  rarity: Rarity;
};

export type CaseItem = {
  id: string;
  name: string;
  weapon: string;
  rarity: Rarity;
  /** USD market value */
  value: number;
  /** Passive buff granted while equipped */
  buff: { attribute: AttributeKey; amount: number } | null;
};

export type CsCase = {
  id: string;
  name: string;
  blurb: string;
  items: CaseItem[];
};

/* --------------------------------- combat --------------------------------- */

export type ClutchRecord = {
  /** 1v1 .. 1v5 */
  v1: number;
  v2: number;
  v3: number;
  v4: number;
  v5: number;
};

export type RoundStats = {
  roundsPlayed: number;
  roundsWon: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  damage: number;
  /** Rounds with a kill, assist, survival or trade */
  kastRounds: number;
  openingKills: number;
  openingDeaths: number;
  utilityDamage: number;
  flashAssists: number;
  multiKills: { k2: number; k3: number; k4: number; k5: number };
  clutches: ClutchRecord;
  bombPlants: number;
  bombDefuses: number;
};

export type MapResult = {
  mapId: string;
  mapName: string;
  roundsWon: number;
  roundsLost: number;
  overtime: boolean;
  won: boolean;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  kast: number;
  hsPercent: number;
  rating: number;
  aces: number;
  clutchesWon: number;
};

/** Career accumulation per map (HLTV-style map pool board). */
export type MapCareerStat = {
  mapId: string;
  mapName: string;
  played: number;
  wins: number;
  kills: number;
  deaths: number;
  ratingSum: number;
  adrSum: number;
};

export type PremierBand =
  | "grey"
  | "lightBlue"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "gold";

export type OgRankId =
  | "s1"
  | "s2"
  | "s3"
  | "s4"
  | "se"
  | "sem"
  | "gn1"
  | "gn2"
  | "gn3"
  | "gnm"
  | "mg1"
  | "mg2"
  | "mge"
  | "dmg"
  | "le"
  | "lem"
  | "smfc"
  | "ge";

export type RankSnapshot = {
  premierRating: number;
  premierBand: PremierBand;
  premierLabel: string;
  ogRank: OgRankId;
  ogLabel: string;
};

export type SeriesResult = {
  tournamentId: string;
  tournamentName: string;
  opponentName: string;
  bestOf: number;
  maps: MapResult[];
  mapsWon: number;
  mapsLost: number;
  won: boolean;
  placement: string;
  prizeMoney: number;
  mvp: boolean;
  isMajor: boolean;
};

/* --------------------------------- effects -------------------------------- */

export type StatEffects = {
  aim?: number;
  reflexes?: number;
  gameSense?: number;
  utility?: number;
  clutch?: number;
  movement?: number;
  fame?: number;
  earnings?: number;
  salaryMonthly?: number;
  chemistry?: number;
  form?: number;
  tilt?: number;
  transferBoost?: number;
  benchRisk?: number;
};

export type EventOption = {
  id: string;
  label: string;
  description: string;
  risk?: boolean;
  effects: StatEffects;
  /** Default narrative; for risk options this is the success blurb */
  outcomeText: string;
  /** Launch a minigame instead of resolving immediately */
  minigame?: MinigameKind;
  /** Effects applied when the minigame is passed (in addition to effects) */
  successEffects?: StatEffects;
  failEffects?: StatEffects;
  successText?: string;
  /** Shown when a risk gauge / minigame fails — do not put win copy in outcomeText for fails */
  failText?: string;
  grantsGraffiti?: string;
  grantsCase?: boolean;
};

export type GameEvent = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  /** Map backdrop id used for the artwork */
  mapId?: string;
  /** Scene artwork variant */
  scene?: SceneKind;
  minTier?: Tier;
  maxTier?: Tier;
  minAge?: number;
  maxAge?: number;
  minFame?: number;
  maxFame?: number;
  roles?: Role[];
  regions?: Region[];
  once?: boolean;
  requiresBenched?: boolean;
  options: EventOption[];
};

export type SceneKind =
  | "map"
  | "lockerRoom"
  | "arena"
  | "bootcamp"
  | "stream"
  | "presser"
  | "market"
  | "case";

/* ------------------------------- career state ------------------------------ */

export type SeasonSummary = {
  year: number;
  split: number;
  age: number;
  teamName: string;
  teamId: string;
  tier: Tier;
  tournamentName: string;
  placement: string;
  rating: number;
  adr: number;
  kills: number;
  deaths: number;
  roundsPlayed: number;
  aces: number;
  clutchesWon: number;
  prizeMoney: number;
  salaryEarned: number;
  benched: boolean;
  highlights: SeasonHighlight[];
  rivalNote: string;
};

export type Archetype = {
  id: string;
  label: string;
  tag: string;
  description: string;
  flavour: string;
  bonuses: Partial<Record<AttributeKey, number>>;
};

export type PlayerState = {
  nickname: string;
  realName: string;
  nationality: string;
  role: Role;
  region: Region;
  team: Team;
  age: number;
  year: number;
  /** Two splits per year */
  currentSplit: number;

  aim: number;
  reflexes: number;
  gameSense: number;
  utility: number;
  clutch: number;
  movement: number;
  /**
   * Positive core-attr training accumulated during the current split
   * (minigames, events, series growth, shop). Offsets split attrition;
   * reset after attrition runs at split end.
   */
  splitTraining: Partial<Record<AttributeKey, number>>;

  /** Short-term modifiers */
  form: number;
  tilt: number;
  chemistry: number;

  career: RoundStats;
  /** Per-map win/play board across the Active Duty pool. */
  mapStats: MapCareerStat[];
  aces: number;
  majors: number;
  trophies: number;
  mvps: number;
  rating: number;
  /** Derived CS2 Premier CS rating (approx. 1k–35k). */
  premierRating: number;
  peakPremierRating: number;

  salaryMonthly: number;
  earnings: number;
  prizeMoney: number;

  fame: number;
  fameLevel: string;
  hltvTop20: number | null;
  nationalTeamStatus: string;

  benched: boolean;
  benchRisk: number;
  transferBoost: number;

  rival: RivalPlayer;
  graffiti: Graffiti[];
  inventory: CaseItem[];
  casesAvailable: number;
  /** Store item ids already purchased (unique gear). */
  storeOwned: string[];
  /** Equipped peripherals bought in the tienda. */
  peripherals: Partial<Record<PeripheralSlot, string>>;
  /** Coaching/case buys this temporada (calendar year). */
  storeSeasonPurchases: StoreSeasonPurchases;

  careerLog: SeasonSummary[];
  lastSeries: SeriesResult | null;
  archetypeChosen: boolean;
  archetypeId: string | null;
  usedEventIds: string[];
  seasonHighlights: SeasonHighlight[];
  isDaily: boolean;
  /**
   * After leaving or finishing a minigame this split, further skill checks
   * are blocked until the next event batch.
   */
  minigameLocked: boolean;
};

export type CareerSetup = {
  nickname: string;
  realName: string;
  nationality: string;
  region: Region;
  role: Role;
  isDaily: boolean;
};

export type CareerResult = {
  nickname: string;
  role: Role;
  region: Region;
  nationality: string;
  finalRating: number;
  peakRating: number;
  trophies: number;
  majors: number;
  totalKills: number;
  totalDeaths: number;
  kd: number;
  adr: number;
  hsPercent: number;
  aces: number;
  clutchesWon: number;
  roundsPlayed: number;
  fame: number;
  fameLevel: string;
  earnings: number;
  hltvTop20: number | null;
  yearsPlayed: number;
  teamsPlayed: string[];
  graffitiCount: number;
  bestSkin: string | null;
  premierRating: number;
  peakPremierRating: number;
  premierBand: PremierBand;
  ogRank: OgRankId;
  ogLabel: string;
  mapStats: MapCareerStat[];
  legendComparison: string;
  legendName: string;
  score: number;
  isDaily: boolean;
};

export type RoleInfo = {
  id: Role;
  label: string;
  tag: string;
  description: string;
  image: string;
  bonuses: Partial<Record<AttributeKey, number>>;
};
