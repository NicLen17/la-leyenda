"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  playMenuClick,
  playReady,
  playSoftFail,
  playUtilitySuccess,
} from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";

type UtilityKind = "smoke" | "molotov" | "flash";

type Lineup = {
  id: string;
  map: string;
  utility: UtilityKind;
  from: string;
  to: string;
  /** Index into the aim grid (0 … COLS*ROWS-1). */
  pixel: number;
  landmark: string;
};

type LineupMemoryGameProps = {
  /** How long the lineup stays on screen (ms). */
  studyMs?: number;
  /** Correct answers needed to pass (of 3 checks). */
  required?: number;
  onComplete: (success: boolean) => void;
};

type Stage =
  | "idle"
  | "study"
  | "recallUtility"
  | "recallPixel"
  | "done";

const COLS = 4;
const ROWS = 3;
const CELL_COUNT = COLS * ROWS;

const UTILITY_META: Record<
  UtilityKind,
  { label: string; color: string; glow: string }
> = {
  smoke: {
    label: "Smoke",
    color: "#94a3b8",
    glow: "rgba(148,163,184,0.45)",
  },
  molotov: {
    label: "Molotov",
    color: "#f97316",
    glow: "rgba(249,115,22,0.5)",
  },
  flash: {
    label: "Flash",
    color: "#facc15",
    glow: "rgba(250,204,21,0.45)",
  },
};

const LINEUP_BANK: Lineup[] = [
  {
    id: "mirage-window",
    map: "Mirage",
    utility: "smoke",
    from: "T Spawn",
    to: "Window",
    pixel: 2,
    landmark: "antena del techo",
  },
  {
    id: "mirage-connector",
    map: "Mirage",
    utility: "smoke",
    from: "T Spawn",
    to: "Connector",
    pixel: 6,
    landmark: "borde del arco",
  },
  {
    id: "inferno-banana",
    map: "Inferno",
    utility: "molotov",
    from: "T Ramp",
    to: "Banana tip",
    pixel: 9,
    landmark: "borde de la pared",
  },
  {
    id: "inferno-coffin",
    map: "Inferno",
    utility: "molotov",
    from: "Apps",
    to: "Coffin",
    pixel: 5,
    landmark: "esquina del balcón",
  },
  {
    id: "dust2-flash-long",
    map: "Dust II",
    utility: "flash",
    from: "T Spawn",
    to: "Long doors",
    pixel: 1,
    landmark: "pico del edificio",
  },
  {
    id: "dust2-xbox",
    map: "Dust II",
    utility: "smoke",
    from: "Outside long",
    to: "Xbox",
    pixel: 7,
    landmark: "cable del poste",
  },
  {
    id: "nuke-outside",
    map: "Nuke",
    utility: "flash",
    from: "T Spawn",
    to: "Outside",
    pixel: 3,
    landmark: "borde del silo",
  },
  {
    id: "ancient-donut",
    map: "Ancient",
    utility: "smoke",
    from: "T Spawn",
    to: "Donut",
    pixel: 4,
    landmark: "relieve de la piedra",
  },
  {
    id: "anubis-bridge",
    map: "Anubis",
    utility: "molotov",
    from: "Mid",
    to: "Bridge",
    pixel: 10,
    landmark: "junta del muro",
  },
  {
    id: "cache-mid",
    map: "Cache",
    utility: "flash",
    from: "T Mid",
    to: "Mid boost",
    pixel: 0,
    landmark: "esquina del container",
  },
];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickLineup(): Lineup {
  return LINEUP_BANK[Math.floor(Math.random() * LINEUP_BANK.length)];
}

/**
 * Memory lineup: study a CS utility lineup, then recall utility and the aim
 * pixel. Destination recall is skipped — map callouts without a real map
 * aren't fair to ask.
 */
export function LineupMemoryGame({
  studyMs = 3200,
  required = 2,
  onComplete,
}: LineupMemoryGameProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [pickedUtility, setPickedUtility] = useState<UtilityKind | null>(null);
  const [pickedPixel, setPickedPixel] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [studyLeft, setStudyLeft] = useState(studyMs);
  // Only utility + pixel remain; never ask for more checks than exist.
  const checksNeeded = Math.min(required, 2);

  const utilities = useMemo(
    () => shuffle<UtilityKind>(["smoke", "molotov", "flash"]),
    // Rebuild options each new lineup round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lineup?.id],
  );

  useEffect(() => {
    if (stage !== "study" || !lineup) return;
    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = studyMs - (Date.now() - started);
      setStudyLeft(Math.max(0, left));
      if (left <= 0) {
        window.clearInterval(tick);
        setStage("recallUtility");
      }
    }, 40);
    return () => window.clearInterval(tick);
  }, [lineup, stage, studyMs]);

  const begin = () => {
    const next = pickLineup();
    setLineup(next);
    scoreRef.current = 0;
    setScore(0);
    setPickedUtility(null);
    setPickedPixel(null);
    setFailed(false);
    setStudyLeft(studyMs);
    setStage("study");
    playReady();
  };

  const bumpScore = (hit: boolean) => {
    const next = scoreRef.current + (hit ? 1 : 0);
    scoreRef.current = next;
    setScore(next);
    return next;
  };

  const failOut = () => {
    setFailed(true);
    window.setTimeout(() => onComplete(false), 700);
  };

  const chooseUtility = (value: UtilityKind) => {
    if (!lineup || pickedUtility || failed) return;
    playMenuClick();
    setPickedUtility(value);
    const hit = value === lineup.utility;
    if (!hit) {
      playSoftFail({ volume: 0.4 });
      bumpScore(false);
      failOut();
      return;
    }
    playUtilitySuccess(value, { volume: 0.92 });
    bumpScore(true);
    window.setTimeout(() => setStage("recallPixel"), 450);
  };

  const choosePixel = (index: number) => {
    if (!lineup || pickedPixel !== null || failed) return;
    playMenuClick();
    setPickedPixel(index);
    const hit = index === lineup.pixel;
    if (!hit) {
      bumpScore(false);
      playSoftFail({ volume: 0.45 });
      failOut();
      return;
    }
    const nextScore = bumpScore(true);
    setStage("done");
    playUtilitySuccess(lineup.utility, { volume: 0.95 });
    window.setTimeout(() => onComplete(nextScore >= checksNeeded), 700);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>Memoria de lineup</span>
        {stage !== "idle" && (
          <span className="tabular-nums">
            {score}/{checksNeeded} · recordá el pixel
          </span>
        )}
      </div>

      <p className="rounded-md border border-border/50 bg-card/50 px-3 py-1.5 text-center text-xs text-muted-foreground">
        Necesitás{" "}
        <span className="font-semibold text-foreground">{checksNeeded}</span>{" "}
        respuestas correctas · un fallo y termina.
      </p>

      {stage === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-border/60 bg-card p-4">
          <p className="max-w-sm text-center text-sm text-muted-foreground">
            En CS2 los lineups se ganan de memoria. Vas a ver smoke, molotov o
            flash unos segundos: memorizá la utilidad y el pixel del crosshair.
          </p>
          <Button size="lg" onClick={begin}>
            Estudiar lineup
          </Button>
        </div>
      )}

      {stage === "study" && lineup && (
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 rounded-lg border border-amber-500/35 bg-[#0c121a] p-2 sm:gap-2 sm:p-3">
          <div className="flex items-center justify-between gap-2">
            <UtilityBadge utility={lineup.utility} />
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Memorizá · {(studyLeft / 1000).toFixed(1)}s
            </p>
          </div>
          <p className="text-center text-sm font-black uppercase tracking-tight sm:text-base">
            {lineup.map} · {lineup.from} → {lineup.to}
          </p>
          <p className="hidden text-center text-xs text-muted-foreground sm:block">
            Aim en la {lineup.landmark}
          </p>
          <AimWall
            highlight={lineup.pixel}
            utility={lineup.utility}
            interactive={false}
          />
          <div className="h-1 overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-amber-400 transition-[width] duration-75"
              style={{ width: `${(studyLeft / studyMs) * 100}%` }}
            />
          </div>
        </div>
      )}

      {stage === "recallUtility" && lineup && (
        <RecallShell
          title="¿Qué utilidad tirabas?"
          subtitle="Smoke, molotov o flash — como en la demo."
        >
          <div className="grid grid-cols-3 gap-2">
            {utilities.map((utility) => {
              const revealed = pickedUtility !== null;
              const correct = utility === lineup.utility;
              const chosen = utility === pickedUtility;
              return (
                <Button
                  key={utility}
                  variant="secondary"
                  disabled={revealed}
                  onClick={() => chooseUtility(utility)}
                  className={cn(
                    "flex h-auto flex-col gap-1 py-3",
                    revealed && correct && "border-primary bg-primary/20",
                    revealed && chosen && !correct && "border-destructive bg-destructive/20",
                  )}
                >
                  <UtilityBadge utility={utility} compact />
                  {UTILITY_META[utility].label}
                </Button>
              );
            })}
          </div>
        </RecallShell>
      )}

      {(stage === "recallPixel" || stage === "done") && lineup && (
        <RecallShell
          title={
            stage === "done"
              ? score >= checksNeeded
                ? "Lineup clavado"
                : "Te olvidaste el pixel"
              : "¿Dónde iba el crosshair?"
          }
          subtitle={
            stage === "done"
              ? failed
                ? "Un fallo y se cortó el execute"
                : `${score} correctas · necesitabas ${checksNeeded}`
              : `Apuntá a la ${lineup.landmark}`
          }
        >
          <AimWall
            highlight={stage === "done" ? lineup.pixel : null}
            picked={pickedPixel}
            utility={lineup.utility}
            interactive={stage === "recallPixel" && pickedPixel === null}
            onPick={choosePixel}
          />
        </RecallShell>
      )}
    </div>
  );
}

function RecallShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-lg border border-border/60 bg-card p-3">
      <div className="text-center">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function UtilityBadge({
  utility,
  compact,
}: {
  utility: UtilityKind;
  compact?: boolean;
}) {
  const meta = UTILITY_META[utility];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-black uppercase tracking-wider text-black",
        compact ? "size-7 text-[10px]" : "px-2 py-0.5 text-[10px]",
      )}
      style={{ backgroundColor: meta.color, boxShadow: `0 0 12px ${meta.glow}` }}
    >
      {compact ? meta.label.slice(0, 2) : meta.label}
    </span>
  );
}

function AimWall({
  highlight,
  picked,
  utility,
  interactive,
  onPick,
}: {
  highlight: number | null;
  picked?: number | null;
  utility: UtilityKind;
  interactive: boolean;
  onPick?: (index: number) => void;
}) {
  const meta = UTILITY_META[utility];

  return (
    <div className="relative mx-auto w-full max-w-md flex-1 overflow-hidden rounded-md border border-border/50 bg-[#1a2430]">
      {/* Stylised facade so the grid reads as a CS aim wall */}
      <svg
        viewBox="0 0 160 100"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        aria-hidden
      >
        <rect width="160" height="100" fill="#243041" />
        <rect x="8" y="10" width="144" height="70" fill="#2c3b4f" />
        <rect x="18" y="18" width="28" height="22" fill="#15202c" />
        <rect x="58" y="18" width="44" height="34" fill="#15202c" />
        <rect x="114" y="18" width="28" height="22" fill="#15202c" />
        <path
          d="M70 18 V8 H90 V18"
          fill="none"
          stroke="#8b9bb0"
          strokeWidth="2"
        />
        <circle cx="80" cy="6" r="2.5" fill="#c5d0dc" />
        <rect x="0" y="82" width="160" height="18" fill="#1a222c" />
      </svg>

      <div
        className="relative grid h-full min-h-[120px] flex-1 gap-1 p-1.5 sm:min-h-[160px] sm:p-2"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: CELL_COUNT }, (_, index) => {
          const isTarget = highlight === index;
          const isPicked = picked === index;
          const wrongPick = isPicked && highlight !== null && picked !== highlight;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              aria-label={`Pixel ${index + 1}`}
              onClick={() => onPick?.(index)}
              className={cn(
                "relative rounded-sm border transition",
                interactive
                  ? "border-white/15 bg-black/20 hover:border-amber-300/70 hover:bg-amber-400/10"
                  : "border-transparent bg-transparent",
                isTarget && "border-amber-300/80 bg-amber-400/25",
                wrongPick && "border-destructive/80 bg-destructive/30",
                isPicked && isTarget && "border-primary bg-primary/30",
              )}
            >
              {isTarget && (
                <span
                  className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                  style={{
                    borderColor: meta.color,
                    boxShadow: `0 0 10px ${meta.glow}`,
                    backgroundColor: meta.color,
                  }}
                />
              )}
              {isPicked && !isTarget && (
                <span className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
