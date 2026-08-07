"use client";

/**
 * Lightweight CS2-flavoured sound bus. Browsers block audio until a gesture,
 * so play() is always fire-and-forget and silently no-ops when blocked.
 */

export const SOUND_PATHS = {
  ready: "/sounds/ready_I8K3eoa.mp3",
  caseOpen: "/sounds/csgo-case-open.mp3",
  headshot: "/sounds/cs-go-headshot-sound.mp3",
  awp: "/sounds/awp_02.mp3",
  m4: "/sounds/m4a1_silencer_01.mp3",
  deagle: "/sounds/desert-eagle-cs.mp3",
  helmet: "/sounds/bhit_helmet-1.mp3",
  bombPlanted: "/sounds/cs-go-bomb-has-been-planted.mp3",
  bombDefused: "/sounds/cs-go-bomb-has-been-defused.mp3",
  /** Non-combat success (CS bell). */
  softSuccess: "/sounds/csgo-bell_01Cbl6v.mp3",
  /** Soft fail for quizzes / memory / non-combat misses. */
  softFail: "/sounds/error-notification.mp3",
  /**
   * "Green, what is your problem?" — we only keep the opening "Green"
   * sting (~2.5s) via maxDurationMs when used as a fail cue.
   */
  grinFail: "/sounds/green-what-is-your-problem.mp3",
  coinCollect: "/sounds/coin-collect-tower-geometry-dash.mp3",
  playButton: "/sounds/cs-2-play-button.mp3",
  /** Short UI click for selectable options / menus. */
  menuClick: "/sounds/didj-button-sound.mp3",
  smoke: "/sounds/cs-go-smoke.mp3",
  molotov: "/sounds/eu-choro.mp3",
} as const;

export type UtilitySoundKind = "smoke" | "molotov" | "flash";

export type SoundKey = keyof typeof SOUND_PATHS;

const GUNSHOT_KEYS: SoundKey[] = ["awp", "m4", "deagle", "headshot", "helmet"];

type ActiveClip = {
  audio: HTMLAudioElement;
  key: SoundKey | "tick";
  cutTimer?: number;
};

let unlocked = false;
let lastGunshot: SoundKey | null = null;
const active: ActiveClip[] = [];
let tickTimer: number | null = null;
let tickCtx: AudioContext | null = null;

function unlock() {
  unlocked = true;
}

function releaseClip(entry: ActiveClip) {
  if (entry.cutTimer !== undefined) {
    window.clearTimeout(entry.cutTimer);
    entry.cutTimer = undefined;
  }
  entry.audio.pause();
  entry.audio.currentTime = 0;
  const index = active.indexOf(entry);
  if (index >= 0) active.splice(index, 1);
}

function pruneFinished() {
  for (let i = active.length - 1; i >= 0; i -= 1) {
    const clip = active[i];
    if (clip.audio.ended || clip.audio.paused) {
      if (clip.cutTimer !== undefined) window.clearTimeout(clip.cutTimer);
      active.splice(i, 1);
    }
  }
}

function makeAudio(src: string, volume: number): HTMLAudioElement {
  const audio = new Audio(src);
  audio.volume = Math.min(1, Math.max(0, volume));
  audio.preload = "auto";
  return audio;
}

type PlayOptions = {
  volume?: number;
  loop?: boolean;
  /** Hard-cut the clip after this many ms (keeps intros, drops long tails). */
  maxDurationMs?: number;
};

/** Play a one-shot clip. Returns a stop handle. */
export function playSound(key: SoundKey, options?: PlayOptions): () => void {
  if (typeof window === "undefined") return () => undefined;
  unlock();
  pruneFinished();

  const audio = makeAudio(SOUND_PATHS[key], options?.volume ?? 0.55);
  audio.loop = Boolean(options?.loop);
  const entry: ActiveClip = { audio, key };
  active.push(entry);

  void audio.play().catch(() => {
    releaseClip(entry);
  });

  if (options?.maxDurationMs && options.maxDurationMs > 0) {
    entry.cutTimer = window.setTimeout(() => {
      releaseClip(entry);
    }, options.maxDurationMs);
  }

  return () => releaseClip(entry);
}

export function stopSound(key: SoundKey) {
  for (let i = active.length - 1; i >= 0; i -= 1) {
    if (active[i].key === key) {
      releaseClip(active[i]);
    }
  }
}

export function stopAllSounds() {
  stopTicks();
  for (let i = active.length - 1; i >= 0; i -= 1) {
    releaseClip(active[i]);
  }
}

/** Mix gunfire so consecutive hits rarely reuse the same sample. */
export function playGunshot(options?: { volume?: number }) {
  const pool =
    lastGunshot === null
      ? GUNSHOT_KEYS
      : GUNSHOT_KEYS.filter((key) => key !== lastGunshot);
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? "m4";
  lastGunshot = pick;
  return playSound(pick, { volume: options?.volume ?? 0.5 });
}

/**
 * Short cue — hear the "ready" sting, then hard-cut before the long pitido
 * tail in the source file keeps ringing through the minigame.
 */
export function playReady() {
  stopSound("ready");
  return playSound("ready", { volume: 0.82, maxDurationMs: 420 });
}

/**
 * CSGO bell — primary non-combat SUCCESS cue.
 * Use on: correct quiz/lineup answers, hold/coin/timing wins, training/win outcomes.
 */
export function playSoftSuccess(options?: PlayOptions) {
  stopSound("softSuccess");
  return playSound("softSuccess", {
    volume: options?.volume ?? 0.92,
    ...options,
  });
}

/**
 * Non-combat success. Always plays the CS bell.
 * Optional smoke/molotov kind layers the matching nade on top (flavor only).
 */
export function playUtilitySuccess(
  kindOrOptions?: UtilitySoundKind | PlayOptions,
  maybeOptions?: PlayOptions,
) {
  const kind =
    typeof kindOrOptions === "string" ? kindOrOptions : undefined;
  const options =
    typeof kindOrOptions === "string" ? maybeOptions : kindOrOptions;

  const stopBell = playSoftSuccess(options);

  if (kind === "smoke") {
    playSound("smoke", { volume: 0.55 });
  } else if (kind === "molotov") {
    playSound("molotov", { volume: 0.55 });
  }

  return stopBell;
}

/**
 * Soft miss / minigame loss sting.
 * Randomly mixes the error beep with the cut "Green" VO for variety.
 */
export function playSoftFail(options?: PlayOptions) {
  const useGrin = Math.random() < 0.5;
  if (useGrin) {
    stopSound("grinFail");
    return playSound("grinFail", {
      ...options,
      volume: options?.volume ?? 0.55,
      // Keep the opening "Green" sting; drop the rest of the VO.
      maxDurationMs: options?.maxDurationMs ?? 2500,
    });
  }
  return playSound("softFail", { volume: options?.volume ?? 0.45, ...options });
}

/** Store purchase sting. */
export function playCoinCollect(options?: PlayOptions) {
  return playSound("coinCollect", {
    volume: options?.volume ?? 0.5,
    ...options,
  });
}

/** Full length of the CS2 play-button sting (ms). */
export const PLAY_BUTTON_DURATION_MS = 2700;

/**
 * Navigate just before the sting ends so /play is visible as the audio tails out.
 */
export const PLAY_BUTTON_NAV_DELAY_MS = PLAY_BUTTON_DURATION_MS - 280;

/** Hero / career start (CS2 play button). */
export function playPlayButton(options?: PlayOptions) {
  stopSound("playButton");
  return playSound("playButton", {
    volume: options?.volume ?? 0.55,
    ...options,
  });
}

/**
 * Menu hover / focus sting (PlayStation-style option scan).
 * Restarts on every call so moving across cards feels snappy.
 */
export function playMenuClick(options?: PlayOptions) {
  stopSound("menuClick");
  return playSound("menuClick", {
    volume: options?.volume ?? 0.4,
    ...options,
  });
}

/** Outcome sting when the result card appears (win / fail / clutch). */
export function playOutcomeCue(
  kind: "win" | "fail" | "clutch" | "transfer" | "case" | "training" | "neutral",
) {
  // Bell for standard wins / training. Headshot stays for dramatic clutches.
  if (kind === "win" || kind === "training") {
    return playSoftSuccess({ volume: 0.95 });
  }
  if (kind === "clutch") {
    return playSound("headshot", { volume: 0.6 });
  }
  if (kind === "fail") {
    return playSoftFail({ volume: 0.55 });
  }
  if (kind === "case") {
    return playCaseOpen();
  }
  if (kind === "transfer") {
    return playSound("deagle", { volume: 0.4 });
  }
  // Neutral outcomes stay silent — ready is reserved for minigame starts.
  return () => undefined;
}

export function playCaseOpen() {
  stopSound("caseOpen");
  return playSound("caseOpen", { volume: 0.6 });
}

/**
 * Announcement only. The planted clip includes a long bomb tick after the VO;
 * we cut before that tail so it never keeps ticking under the minigame.
 */
export function playBombPlanted() {
  stopSound("ready");
  stopSound("bombPlanted");
  return playSound("bombPlanted", { volume: 0.55, maxDurationMs: 1650 });
}

export function playBombDefused() {
  stopSound("bombPlanted");
  return playSound("bombDefused", { volume: 0.55 });
}

function ensureTickContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!tickCtx) tickCtx = new Ctx();
  if (tickCtx.state === "suspended") void tickCtx.resume();
  return tickCtx;
}

function beepTick(progress: number) {
  const ctx = ensureTickContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 880 + progress * 220;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.055);
}

/**
 * Roulette-style tic-tac while a needle is spinning.
 * `getProgress` should return 0→1 over the animation; ticks slow near the end.
 */
export function startSpinTicks(getProgress: () => number) {
  stopTicks();
  unlock();

  const schedule = () => {
    const progress = Math.min(1, Math.max(0, getProgress()));
    if (progress >= 1) {
      tickTimer = null;
      return;
    }
    beepTick(progress);
    const delay = 70 + progress * progress * 280;
    tickTimer = window.setTimeout(schedule, delay);
  };

  schedule();
}

export function stopTicks() {
  if (tickTimer !== null) {
    window.clearTimeout(tickTimer);
    tickTimer = null;
  }
}

export function isAudioUnlocked() {
  return unlocked;
}
