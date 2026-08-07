import { ROLES, getArchetypeById, rollArchetypes } from "@/lib/data/archetypes";
import {
  getCaseById,
  getGraffitiById,
  randomCase,
  rollCaseItem,
} from "@/lib/data/cases";
import { PRO_PLAYERS, ROOKIE_NICKS, ROOKIE_REAL_NAMES } from "@/lib/data/pros";
import { caseIdForStoreItem, getStoreItem } from "@/lib/data/store";
import { getStarterTeam } from "@/lib/data/teams";
import { getSeasonTournament } from "@/lib/data/tournaments";
import type {
  Archetype,
  AttributeKey,
  CaseItem,
  CareerResult,
  CareerSetup,
  CsCase,
  EventCategory,
  GameEvent,
  GamePhase,
  EventOption,
  HighlightKind,
  OutcomeKind,
  PlayerState,
  RivalPlayer,
  SeasonHighlight,
  SeasonSummary,
  StatEffects,
  Team,
  TeamOffer,
} from "@/lib/types/game";
import {
  EVENTS_PER_SEASON,
  MAX_SPLITS,
  ROOKIE_SALARY,
  SPLITS_PER_YEAR,
  STARTING_AGE,
  STORE_SEASON_LIMITS,
} from "./constants";
import { pickEvent } from "./events";
import {
  applyAgeing,
  applyEffects,
  applySplitAttrition,
  careerScore,
  compareToLegend,
  computeTop20,
  generateOffers,
  getFameLevel,
  getNationalTeamStatus,
  riskSuccessChance,
  shouldRetire,
} from "./progression";
import {
  minigameRewards,
  riskFailEffects,
  riskSuccessEffects,
  sanitizeCareerEffects,
  seriesPerformanceGrowth,
} from "./rewards";
import {
  emptyMapStats,
  getOgRank,
  getPremierBand,
  mergeMapResults,
  refreshRanks,
} from "./ranks";
import {
  adrOf,
  advanceRival,
  computeRating,
  emptyRoundStats,
  hsPercentOf,
  mergeRoundStats,
  simulateSeries,
  totalClutches,
} from "./simulator";

function attributeEffect(key: AttributeKey, amount: number): StatEffects {
  return { [key]: amount } as StatEffects;
}

export type GameRuntime = {
  phase: GamePhase;
  state: PlayerState | null;
  currentEvent: GameEvent | null;
  pendingOption: EventOption | null;
  lastOutcome: string | null;
  lastOutcomeKind: OutcomeKind;
  lastRewards: {
    graffitiName: string | null;
    caseItem: CaseItem | null;
  };
  offers: TeamOffer[];
  /** The three archetypes rolled for this career. */
  archetypeOptions: Archetype[];
  eventsLeftInSeason: number;
  lastSummary: SeasonSummary | null;
  result: CareerResult | null;
};

export const INITIAL_RUNTIME: GameRuntime = {
  phase: "setup",
  state: null,
  currentEvent: null,
  pendingOption: null,
  lastOutcome: null,
  lastOutcomeKind: "neutral",
  lastRewards: { graffitiName: null, caseItem: null },
  offers: [],
  archetypeOptions: [],
  eventsLeftInSeason: EVENTS_PER_SEASON,
  lastSummary: null,
  result: null,
};

function classifyOutcome(
  option: EventOption,
  minigameSuccess: boolean | null,
  caseItem: CaseItem | null,
): OutcomeKind {
  if (caseItem) return "case";
  if (option.grantsGraffiti && minigameSuccess !== false) return "clutch";
  if (minigameSuccess === true) return "win";
  if (minigameSuccess === false) return "fail";
  if (option.id.includes("transfer") || option.id.includes("sign")) {
    return "transfer";
  }
  if (option.minigame === "hold" || option.minigame === "lineup") {
    return "training";
  }
  return "neutral";
}

function highlightKindFromCategory(category: EventCategory): HighlightKind {
  switch (category) {
    case "lockerRoom":
      return "locker";
    case "career":
      return "career";
    case "personal":
      return "personal";
    case "match":
      return "match";
    case "team":
      return "team";
    case "transfer":
      return "transfer";
    case "meta":
      return "meta";
    default:
      return "neutral";
  }
}

function highlightKindForEvent(
  category: EventCategory,
  outcomeKind: OutcomeKind,
): HighlightKind {
  if (outcomeKind !== "neutral") return outcomeKind;
  return highlightKindFromCategory(category);
}

function pushHighlight(
  highlights: SeasonHighlight[],
  text: string,
  kind: HighlightKind,
): SeasonHighlight[] {
  return [...highlights, { text, kind }];
}

function pickRival(setup: CareerSetup): RivalPlayer {
  const names = ROOKIE_REAL_NAMES[setup.region];
  const nick = ROOKIE_NICKS[Math.floor(Math.random() * ROOKIE_NICKS.length)];
  const realName = names[Math.floor(Math.random() * names.length)];

  return {
    nickname: nick,
    realName,
    country: setup.nationality,
    role: setup.role,
    rating: 0.98 + Math.random() * 0.1,
    kills: 0,
    majors: 0,
    teamName: "Academia rival",
  };
}

export function createPlayer(setup: CareerSetup): PlayerState {
  const team: Team = getStarterTeam(setup.region);

  const base: PlayerState = {
    nickname: setup.nickname,
    realName: setup.realName,
    nationality: setup.nationality,
    role: setup.role,
    region: setup.region,
    team,
    age: STARTING_AGE,
    year: new Date().getFullYear(),
    currentSplit: 1,

    aim: 40,
    reflexes: 40,
    gameSense: 34,
    utility: 32,
    clutch: 34,
    movement: 36,
    splitTraining: {},

    form: 0,
    tilt: 0,
    chemistry: 0,

    career: emptyRoundStats(),
    mapStats: emptyMapStats(),
    aces: 0,
    majors: 0,
    trophies: 0,
    mvps: 0,
    rating: 1.0,
    premierRating: 1_200,
    peakPremierRating: 1_200,

    salaryMonthly: ROOKIE_SALARY,
    earnings: 0,
    prizeMoney: 0,

    fame: 4,
    fameLevel: "Desconocido",
    hltvTop20: null,
    nationalTeamStatus: "Sin llamados",

    benched: false,
    benchRisk: 8,
    transferBoost: 0,

    rival: pickRival(setup),
    graffiti: [],
    inventory: [],
    casesAvailable: 1,
    storeOwned: [],
    peripherals: {},
    storeSeasonPurchases: { coaching: 0, cases: 0 },

    careerLog: [],
    lastSeries: null,
    archetypeChosen: false,
    archetypeId: null,
    usedEventIds: [],
    seasonHighlights: [],
    isDaily: setup.isDaily,
    minigameLocked: false,
  };

  const roleInfo = ROLES.find((entry) => entry.id === setup.role);
  return refreshRanks(applyEffects(base, roleInfo?.bonuses ?? {}));
}

export function startCareer(setup: CareerSetup): GameRuntime {
  return {
    ...INITIAL_RUNTIME,
    phase: "archetype",
    state: createPlayer(setup),
    archetypeOptions: rollArchetypes(3),
  };
}

export function chooseArchetype(
  runtime: GameRuntime,
  archetypeId: string,
): GameRuntime {
  if (!runtime.state) return runtime;
  const archetype = getArchetypeById(archetypeId);
  if (!archetype) return runtime;

  const state = refreshRanks(applyEffects(runtime.state, archetype.bonuses));

  return {
    ...runtime,
    phase: "event",
    state: {
      ...state,
      archetypeChosen: true,
      archetypeId: archetype.id,
    },
    currentEvent: pickEvent(state),
    eventsLeftInSeason: EVENTS_PER_SEASON,
  };
}

/** Options with a minigame or risk gauge pause here; else resolve immediately. */
export function selectOption(
  runtime: GameRuntime,
  optionId: string,
): GameRuntime {
  if (!runtime.state || !runtime.currentEvent) return runtime;
  const option = runtime.currentEvent.options.find(
    (candidate) => candidate.id === optionId,
  );
  if (!option) return runtime;

  // Already left/finished a minigame this split — no second skill check.
  if (option.minigame && runtime.state.minigameLocked) {
    const { minigame: _minigame, ...withoutSkill } = option;
    return resolveOption(runtime, withoutSkill, null);
  }

  if (option.minigame) {
    return { ...runtime, phase: "minigame", pendingOption: option };
  }

  // Risky narrative choices spin the probability gauge before resolving.
  if (option.risk) {
    return { ...runtime, phase: "risk", pendingOption: option };
  }

  return resolveOption(runtime, option, null);
}

export function resolveMinigame(
  runtime: GameRuntime,
  success: boolean,
): GameRuntime {
  if (!runtime.state || !runtime.pendingOption) return runtime;
  return resolveOption(runtime, runtime.pendingOption, success);
}

export function resolveRisk(
  runtime: GameRuntime,
  success: boolean,
): GameRuntime {
  if (!runtime.state || !runtime.pendingOption) return runtime;
  return resolveOption(runtime, runtime.pendingOption, success, true);
}

/** Chance shown on the risk gauge for the pending option. */
export function pendingRiskChance(runtime: GameRuntime): number {
  if (!runtime.state) return 40;
  return riskSuccessChance(runtime.state);
}

function resolveOption(
  runtime: GameRuntime,
  option: EventOption,
  rollSuccess: boolean | null,
  fromRisk = false,
): GameRuntime {
  if (!runtime.state || !runtime.currentEvent) return runtime;

  let state = runtime.state;
  let outcomeText = option.outcomeText;

  if (fromRisk && rollSuccess === true) {
    state = applyEffects(
      state,
      sanitizeCareerEffects(riskSuccessEffects(option)),
    );
    // outcomeText is the success blurb for risk options; fail uses failText.
    // Parens required: ?? cannot mix with || without grouping.
    outcomeText =
      option.successText ??
      (option.outcomeText || "La jugada sale. El riesgo valió la pena.");
  } else if (fromRisk && rollSuccess === false) {
    state = applyEffects(
      state,
      sanitizeCareerEffects(riskFailEffects(option)),
    );
    // Never fall back to outcomeText — it often narrates the win path.
    outcomeText =
      option.failText || "La jugada no sale. Te sale el tiro por la culata.";
  } else if (option.minigame && rollSuccess !== null) {
    // Skill checks use the CS training table — not authored fame/market spam.
    const rewards = minigameRewards(option.minigame);
    state = applyEffects(state, sanitizeCareerEffects(option.effects));
    state = applyEffects(
      state,
      rollSuccess ? rewards.success : rewards.fail,
    );
    outcomeText = rollSuccess
      ? (option.successText ?? option.outcomeText)
      : (option.failText ?? option.outcomeText);
  } else {
    state = applyEffects(state, sanitizeCareerEffects(option.effects));
    if (rollSuccess === true) {
      state = applyEffects(
        state,
        sanitizeCareerEffects(option.successEffects ?? {}),
      );
      outcomeText = option.successText ?? option.outcomeText;
    } else if (rollSuccess === false) {
      state = applyEffects(
        state,
        sanitizeCareerEffects(option.failEffects ?? {}),
      );
      outcomeText = option.failText ?? option.outcomeText;
    }
  }

  let graffitiName: string | null = null;
  const earnedGraffiti = option.grantsGraffiti;
  if (earnedGraffiti && rollSuccess !== false) {
    const graffiti = getGraffitiById(earnedGraffiti);
    if (graffiti && !state.graffiti.some((entry) => entry.id === graffiti.id)) {
      state = { ...state, graffiti: [...state.graffiti, graffiti] };
      graffitiName = graffiti.name;
    }
  }

  let caseItem: CaseItem | null = null;
  if (option.grantsCase) {
    const csCase = randomCase();
    caseItem = rollCaseItem(csCase);
    state = {
      ...state,
      inventory: [...state.inventory, caseItem],
      earnings: state.earnings + caseItem.value,
    };
    if (caseItem.buff) {
      state = applyEffects(
        state,
        attributeEffect(caseItem.buff.attribute, caseItem.buff.amount),
      );
    }
    outcomeText = `Abrís la ${csCase.name} en vivo y sale un ${caseItem.weapon} | ${caseItem.name}. Valor de mercado: $${caseItem.value.toLocaleString("es-AR")}.`;
  }

  state = refreshRanks(state);
  const outcomeKind = classifyOutcome(option, rollSuccess, caseItem);

  // Leaving or finishing a minigame locks further ones for this split.
  if (option.minigame) {
    state = { ...state, minigameLocked: true };
  }

  return {
    ...runtime,
    phase: "outcome",
    pendingOption: null,
    state: {
      ...state,
      usedEventIds: [...state.usedEventIds, runtime.currentEvent.id],
      seasonHighlights: pushHighlight(
        state.seasonHighlights,
        outcomeText,
        highlightKindForEvent(runtime.currentEvent.category, outcomeKind),
      ),
    },
    lastOutcome: outcomeText,
    lastOutcomeKind: outcomeKind,
    lastRewards: { graffitiName, caseItem },
    eventsLeftInSeason: Math.max(0, runtime.eventsLeftInSeason - 1),
  };
}

export function continueAfterOutcome(runtime: GameRuntime): GameRuntime {
  if (!runtime.state) return runtime;

  if (runtime.eventsLeftInSeason > 0) {
    return {
      ...runtime,
      phase: "event",
      currentEvent: pickEvent(runtime.state),
      lastOutcome: null,
      lastOutcomeKind: "neutral",
      lastRewards: { graffitiName: null, caseItem: null },
    };
  }

  return resolveSeason(runtime);
}

function resolveSeason(runtime: GameRuntime): GameRuntime {
  if (!runtime.state) return runtime;

  let state = { ...runtime.state };
  const tournament = getSeasonTournament(state.team.tier, state.currentSplit);

  // A benched player still collects the salary but plays nothing.
  if (state.benched) {
    const salaryEarned = state.salaryMonthly * 6;
    state = {
      ...state,
      earnings: state.earnings + salaryEarned,
      form: Math.max(-5, state.form - 1),
    };

    const summary: SeasonSummary = {
      year: state.year,
      split: state.currentSplit,
      age: state.age,
      teamName: state.team.name,
      teamId: state.team.id,
      tier: state.team.tier,
      tournamentName: tournament.name,
      placement: "En el banco",
      rating: state.rating,
      adr: adrOf(state.career),
      kills: 0,
      deaths: 0,
      roundsPlayed: 0,
      aces: 0,
      clutchesWon: 0,
      prizeMoney: 0,
      salaryEarned,
      benched: true,
      highlights: state.seasonHighlights,
      rivalNote: `${state.rival.nickname} sigue jugando: rating ${state.rival.rating.toFixed(2)}.`,
    };

    return advanceSplit(runtime, state, summary);
  }

  const { series, stats } = simulateSeries(state, tournament);
  const career = mergeRoundStats(state.career, stats);
  const seasonRating = computeRating(stats);
  const salaryEarned = state.salaryMonthly * 6;
  const acesThisSplit = stats.multiKills.k5;
  const clutchesThisSplit = totalClutches(stats.clutches);

  state = {
    ...state,
    career,
    mapStats: mergeMapResults(state.mapStats, series.maps),
    rating: computeRating(career),
    aces: state.aces + acesThisSplit,
    earnings: state.earnings + series.prizeMoney + salaryEarned,
    prizeMoney: state.prizeMoney + series.prizeMoney,
    trophies: state.trophies + (series.won ? 1 : 0),
    majors: state.majors + (series.won && series.isMajor ? 1 : 0),
    mvps: state.mvps + (series.mvp ? 1 : 0),
    lastSeries: series,
  };

  // Results → reputation & role security. Mechanics come from the box score.
  const fameSwing =
    (series.won ? 10 : 0) +
    (series.isMajor && series.won ? 14 : 0) +
    (series.mvp ? 6 : 0) +
    Math.round((seasonRating - 1) * 22) +
    acesThisSplit * 2;

  state = applyEffects(state, {
    fame: fameSwing,
    form: seasonRating >= 1.1 ? 1 : seasonRating < 0.95 ? -1 : 0,
    benchRisk: seasonRating < 0.95 ? 14 : seasonRating > 1.12 ? -12 : -4,
    ...seriesPerformanceGrowth(state, seasonRating, series, stats),
  });

  state.hltvTop20 = computeTop20(state);

  // Auto-graffiti for milestone plays, the way Valve rewards iconic moments.
  const milestones: { id: string; earned: boolean }[] = [
    { id: "gg-ace", earned: acesThisSplit > 0 },
    { id: "gg-major", earned: series.won && series.isMajor },
    { id: "gg-comeback", earned: series.maps.some((map) => map.won && map.roundsLost >= 11) },
    { id: "gg-awp", earned: state.role === "awp" && stats.multiKills.k4 >= 2 },
    { id: "gg-entry", earned: state.role === "entry" && stats.openingKills >= 22 },
    { id: "gg-utility", earned: stats.utilityDamage >= 900 },
    { id: "gg-top20", earned: state.hltvTop20 !== null && state.hltvTop20 <= 10 },
  ];

  for (const milestone of milestones) {
    if (!milestone.earned) continue;
    const graffiti = getGraffitiById(milestone.id);
    if (graffiti && !state.graffiti.some((entry) => entry.id === graffiti.id)) {
      state.graffiti = [...state.graffiti, graffiti];
      state.seasonHighlights = pushHighlight(
        state.seasonHighlights,
        `Valve te dio el graffiti "${graffiti.name}" (${graffiti.reason}).`,
        "graffiti",
      );
    }
  }

  // Benching happens when the risk piles up and the numbers back it.
  if (state.benchRisk >= 75 && seasonRating < 1.0) {
    state.benched = true;
    state.seasonHighlights = pushHighlight(
      state.seasonHighlights,
      `${state.team.name} te manda al banco. La organización busca reemplazo.`,
      "bench",
    );
  } else if (state.benched && seasonRating >= 1.05) {
    state.benched = false;
  }

  // Winning something big earns a case to open.
  if (series.won || series.mvp) {
    state.casesAvailable += 1;
  }

  const summary: SeasonSummary = {
    year: state.year,
    split: state.currentSplit,
    age: state.age,
    teamName: state.team.name,
    teamId: state.team.id,
    tier: state.team.tier,
    tournamentName: series.tournamentName,
    placement: series.placement,
    rating: seasonRating,
    adr: adrOf(stats),
    kills: stats.kills,
    deaths: stats.deaths,
    roundsPlayed: stats.roundsPlayed,
    aces: acesThisSplit,
    clutchesWon: clutchesThisSplit,
    prizeMoney: series.prizeMoney,
    salaryEarned,
    benched: false,
    highlights: state.seasonHighlights,
    rivalNote: `${state.rival.nickname}: rating ${state.rival.rating.toFixed(2)} · ${state.rival.majors} Major(s).`,
  };

  return advanceSplit(runtime, state, summary);
}

function advanceSplit(
  runtime: GameRuntime,
  input: PlayerState,
  summary: SeasonSummary,
): GameRuntime {
  let state: PlayerState = {
    ...input,
    careerLog: [...input.careerLog, summary],
    seasonHighlights: [],
  };

  state = advanceRival(state);

  const nextSplit = state.currentSplit + 1;
  const yearRollover = nextSplit % SPLITS_PER_YEAR === 1;

  state = {
    ...state,
    currentSplit: nextSplit,
    year: yearRollover ? state.year + 1 : state.year,
    age: yearRollover ? state.age + 1 : state.age,
  };

  if (yearRollover) {
    state = applyAgeing(state);
    // New temporada: shop purchase caps reset so coaching/cases can't snowball.
    state = {
      ...state,
      storeSeasonPurchases: { coaching: 0, cases: 0 },
    };
  }

  // Rust vs training this split: untrained peaks slip. Reset counter after.
  state = applySplitAttrition(state);

  state.fameLevel = getFameLevel(state.fame);
  state.nationalTeamStatus = getNationalTeamStatus(state);
  state = refreshRanks(state);

  return {
    ...runtime,
    phase: "seasonSummary",
    state,
    currentEvent: null,
    lastSummary: summary,
    lastOutcome: null,
    lastRewards: { graffitiName: null, caseItem: null },
    eventsLeftInSeason: EVENTS_PER_SEASON,
  };
}

/** After each summary: retire, open the market, or roll straight into events. */
export function continueAfterSummary(runtime: GameRuntime): GameRuntime {
  if (!runtime.state) return runtime;
  const state = runtime.state;

  if (shouldRetire(state) || state.currentSplit > MAX_SPLITS) {
    return retire(runtime);
  }

  // The transfer window opens once per year and whenever you are benched.
  const marketOpen = state.currentSplit % SPLITS_PER_YEAR === 1 || state.benched;

  if (marketOpen) {
    return {
      ...runtime,
      phase: "market",
      offers: generateOffers(state),
    };
  }

  // New event batch: skill checks are available again.
  const nextState = { ...state, minigameLocked: false };

  return {
    ...runtime,
    phase: "event",
    state: nextState,
    currentEvent: pickEvent(nextState),
    eventsLeftInSeason: EVENTS_PER_SEASON,
  };
}

export function acceptOffer(
  runtime: GameRuntime,
  teamId: string,
): GameRuntime {
  if (!runtime.state) return runtime;
  const offer = runtime.offers.find((entry) => entry.team.id === teamId);
  if (!offer) return runtime;

  const staying = offer.team.id === runtime.state.team.id;

  let state: PlayerState = {
    ...runtime.state,
    team: offer.team,
    role: offer.role,
    salaryMonthly: offer.salaryMonthly,
    benched: offer.benchRisk && Math.random() < 0.4,
    benchRisk: offer.benchRisk ? 45 : 10,
    chemistry: staying ? runtime.state.chemistry : -2,
    transferBoost: 0,
    minigameLocked: false,
  };

  state = refreshRanks(applyEffects(state, { fame: offer.fameDelta }));

  // Signing with the best org in the world puts a real pro next to you.
  const teammate = PRO_PLAYERS.find((pro) => pro.teamId === offer.team.id);
  const note = teammate
    ? `Compartís roster con ${teammate.nickname}.`
    : `${offer.team.name} te presenta como fichaje.`;

  return {
    ...runtime,
    phase: "event",
    state: {
      ...state,
      seasonHighlights: [
        {
          text: staying
            ? `Renovás con ${offer.team.name} por $${offer.salaryMonthly.toLocaleString("es-AR")}/mes.`
            : `Fichás por ${offer.team.name}: $${offer.salaryMonthly.toLocaleString("es-AR")}/mes durante ${offer.years} año(s). ${note}`,
          kind: "transfer" as const,
        },
      ],
    },
    offers: [],
    currentEvent: pickEvent(state),
    eventsLeftInSeason: EVENTS_PER_SEASON,
  };
}

export function openCase(runtime: GameRuntime, item: CaseItem): GameRuntime {
  if (!runtime.state || runtime.state.casesAvailable <= 0) return runtime;

  let state: PlayerState = {
    ...runtime.state,
    casesAvailable: runtime.state.casesAvailable - 1,
    inventory: [...runtime.state.inventory, item],
    earnings: runtime.state.earnings + item.value,
  };

  if (item.buff) {
    state = applyEffects(state, attributeEffect(item.buff.attribute, item.buff.amount));
  }

  return { ...runtime, state };
}

export type StorePurchaseResult = {
  runtime: GameRuntime;
  /** When buying a case, open the unbox UI with this case. */
  openCase: CsCase | null;
  error: string | null;
};

/**
 * Spend from `earnings` (balance acumulado). Cases grant +1 casesAvailable and
 * return the CsCase so the UI can launch CaseOpening immediately.
 */
export function buyStoreItem(
  runtime: GameRuntime,
  itemId: string,
): StorePurchaseResult {
  if (!runtime.state) {
    return { runtime, openCase: null, error: "Sin carrera activa." };
  }

  const item = getStoreItem(itemId);
  if (!item) {
    return { runtime, openCase: null, error: "Ítem no encontrado." };
  }

  const state = runtime.state;
  if (state.earnings < item.price) {
    return {
      runtime,
      openCase: null,
      error: "No te alcanza el saldo (ganancias).",
    };
  }

  if (item.unique && state.storeOwned.includes(item.id)) {
    return { runtime, openCase: null, error: "Ya lo tenés comprado." };
  }

  if (
    item.peripheralSlot &&
    state.peripherals[item.peripheralSlot] &&
    state.storeOwned.includes(item.id)
  ) {
    return { runtime, openCase: null, error: "Ya equipaste este periférico." };
  }

  const seasonBuys = state.storeSeasonPurchases ?? { coaching: 0, cases: 0 };

  if (
    item.kind === "coaching" &&
    seasonBuys.coaching >= STORE_SEASON_LIMITS.coaching
  ) {
    return {
      runtime,
      openCase: null,
      error: `Límite de temporada: ${STORE_SEASON_LIMITS.coaching} sesión de coaching por año.`,
    };
  }

  if (
    item.grantsCase &&
    seasonBuys.cases >= STORE_SEASON_LIMITS.cases
  ) {
    return {
      runtime,
      openCase: null,
      error: `Límite de temporada: ${STORE_SEASON_LIMITS.cases} cajas por año.`,
    };
  }

  let next: PlayerState = {
    ...state,
    earnings: state.earnings - item.price,
  };

  if (item.kind === "coaching") {
    const buys = next.storeSeasonPurchases ?? { coaching: 0, cases: 0 };
    next = {
      ...next,
      storeSeasonPurchases: {
        ...buys,
        coaching: buys.coaching + 1,
      },
    };
  }

  if (item.unique || item.peripheralSlot) {
    next = {
      ...next,
      storeOwned: [...next.storeOwned, item.id],
    };
  }

  if (item.peripheralSlot) {
    next = {
      ...next,
      peripherals: {
        ...next.peripherals,
        [item.peripheralSlot]: item.id,
      },
    };
  }

  if (item.kind === "skin") {
    const skinItem: CaseItem = {
      id: item.id,
      name: item.name.includes("|")
        ? item.name.split("|")[1]?.trim() ?? item.name
        : item.name,
      weapon: item.name.includes("|")
        ? item.name.split("|")[0]?.trim() ?? "Skin"
        : "Skin",
      rarity: "restricted",
      value: Math.round(item.price * 0.35),
      buff: item.buff ?? null,
    };
    next = { ...next, inventory: [...next.inventory, skinItem] };
  }

  if (item.buff && item.kind !== "case") {
    next = applyEffects(
      next,
      attributeEffect(item.buff.attribute, item.buff.amount),
    );
    // coaching utility pack also bumps game sense slightly
    if (item.id === "coach-utility") {
      next = applyEffects(next, { gameSense: 1 });
    }
    if (item.id === "peri-keyboard") {
      next = applyEffects(next, { aim: 1 });
    }
  }

  let opened: CsCase | null = null;
  if (item.grantsCase) {
    const caseId = caseIdForStoreItem(item);
    opened = (caseId ? getCaseById(caseId) : null) ?? randomCase();
    const buys = next.storeSeasonPurchases ?? { coaching: 0, cases: 0 };
    next = {
      ...next,
      casesAvailable: next.casesAvailable + 1,
      storeSeasonPurchases: {
        ...buys,
        cases: buys.cases + 1,
      },
    };
  }

  next = refreshRanks(next);
  return {
    runtime: { ...runtime, state: next },
    openCase: opened,
    error: null,
  };
}

export function retire(runtime: GameRuntime): GameRuntime {
  if (!runtime.state) return runtime;
  const state = runtime.state;

  const score = careerScore(state);
  const legend = compareToLegend(score);
  const teams = Array.from(
    new Set(state.careerLog.map((entry) => entry.teamName).concat(state.team.name)),
  );
  const peakRating = state.careerLog.reduce(
    (max, entry) => Math.max(max, entry.rating),
    state.rating,
  );
  const bestSkin = state.inventory.reduce<CaseItem | null>(
    (best, item) => (!best || item.value > best.value ? item : best),
    null,
  );

  const premierBand = getPremierBand(state.premierRating);
  const og = getOgRank(state.premierRating);

  const result: CareerResult = {
    nickname: state.nickname,
    role: state.role,
    region: state.region,
    nationality: state.nationality,
    finalRating: state.rating,
    peakRating: Math.round(peakRating * 100) / 100,
    trophies: state.trophies,
    majors: state.majors,
    totalKills: state.career.kills,
    totalDeaths: state.career.deaths,
    kd:
      state.career.deaths > 0
        ? Math.round((state.career.kills / state.career.deaths) * 100) / 100
        : state.career.kills,
    adr: adrOf(state.career),
    hsPercent: hsPercentOf(state.career),
    aces: state.aces,
    clutchesWon: totalClutches(state.career.clutches),
    roundsPlayed: state.career.roundsPlayed,
    fame: state.fame,
    fameLevel: state.fameLevel,
    earnings: state.earnings,
    hltvTop20: state.hltvTop20,
    yearsPlayed: Math.max(1, state.age - STARTING_AGE),
    teamsPlayed: teams,
    graffitiCount: state.graffiti.length,
    bestSkin: bestSkin ? `${bestSkin.weapon} | ${bestSkin.name}` : null,
    premierRating: state.premierRating,
    peakPremierRating: state.peakPremierRating,
    premierBand: premierBand.id,
    ogRank: og.id,
    ogLabel: og.label,
    mapStats: state.mapStats,
    legendComparison: legend.blurb,
    legendName: legend.name,
    score,
    isDaily: state.isDaily,
  };

  return { ...runtime, phase: "retired", result };
}
