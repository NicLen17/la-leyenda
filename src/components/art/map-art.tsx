"use client";

import { MapAtmosphere } from "@/components/art/map-atmosphere";
import { cn } from "@/lib/utils";
import type { SceneKind } from "@/lib/types/game";

type MapArtProps = {
  mapId?: string;
  scene?: SceneKind;
  className?: string;
};

/* ------------------------------ scene backdrops ---------------------------- */

function LockerRoom() {
  return (
    <svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="100" height="88" fill="#141a22" />
      {[8, 26, 44, 62, 80].map((x) => (
        <g key={x}>
          <rect x={x} y="16" width="14" height="46" rx="2" fill="#1e2733" stroke="#2c3846" strokeWidth="0.6" />
          <rect x={x + 3} y="20" width="8" height="2" rx="1" fill="#3d4c5c" />
          <circle cx={x + 11} cy="40" r="1" fill="#f59e0b" fillOpacity="0.7" />
        </g>
      ))}
      <rect y="62" width="100" height="6" fill="#0f141b" />
      <rect y="0" width="100" height="10" fill="#0b0f14" />
      <rect x="0" y="10" width="100" height="1" fill="#f59e0b" fillOpacity="0.35" />
      <rect width="100" height="88" fill="#05070a" fillOpacity="0.3" />
    </svg>
  );
}

function Arena() {
  return (
    <svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="arena-glow" cx="50%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0b1220" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width="100" height="88" fill="url(#arena-glow)" />
      <rect x="26" y="26" width="48" height="28" rx="2" fill="#0a0f18" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="0.8" />
      <rect x="30" y="30" width="40" height="20" rx="1" fill="#123047" fillOpacity="0.8" />
      {Array.from({ length: 40 }, (_, i) => (
        <circle
          key={i}
          cx={4 + (i % 20) * 5}
          cy={i < 20 ? 68 : 78}
          r="1.6"
          fill="#facc15"
          fillOpacity={0.15 + ((i * 7) % 10) / 22}
        />
      ))}
      <rect width="100" height="88" fill="#05070a" fillOpacity="0.24" />
    </svg>
  );
}

function Bootcamp() {
  return (
    <svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="100" height="88" fill="#10161e" />
      {[6, 30, 54, 78].map((x, index) => (
        <g key={x}>
          <rect x={x} y={22 + index * 2} width="18" height="11" rx="1" fill="#0b1018" stroke="#22c55e" strokeOpacity="0.45" strokeWidth="0.6" />
          <rect x={x + 2} y={24 + index * 2} width="14" height="7" fill="#14532d" fillOpacity="0.7" />
          <rect x={x + 3} y={40 + index * 2} width="12" height="3" rx="1" fill="#1e2733" />
        </g>
      ))}
      <rect y="52" width="100" height="4" fill="#0a0e14" />
      <rect width="100" height="88" fill="#05070a" fillOpacity="0.32" />
    </svg>
  );
}

function StreamRoom() {
  return (
    <svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="100" height="88" fill="#150f22" />
      <rect x="18" y="14" width="64" height="38" rx="2" fill="#0d0918" stroke="#a855f7" strokeOpacity="0.5" strokeWidth="0.8" />
      <rect x="22" y="18" width="56" height="30" fill="#2a1a45" fillOpacity="0.8" />
      <circle cx="50" cy="33" r="7" fill="#a855f7" fillOpacity="0.35" />
      <path d="M47 29v8l7-4z" fill="#e9d5ff" />
      <rect x="30" y="58" width="40" height="4" rx="2" fill="#a855f7" fillOpacity="0.4" />
      <rect x="34" y="66" width="32" height="3" rx="1.5" fill="#6b21a8" fillOpacity="0.5" />
      <rect width="100" height="88" fill="#05070a" fillOpacity="0.28" />
    </svg>
  );
}

function Presser() {
  return (
    <svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="100" height="88" fill="#0e1520" />
      {Array.from({ length: 24 }, (_, i) => (
        <rect
          key={i}
          x={2 + (i % 8) * 12.5}
          y={4 + Math.floor(i / 8) * 14}
          width="10"
          height="10"
          rx="1"
          fill="#1b2634"
          fillOpacity="0.8"
        />
      ))}
      <rect x="24" y="52" width="52" height="24" rx="2" fill="#111a26" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="0.7" />
      {[32, 44, 56, 68].map((x) => (
        <circle key={x} cx={x} cy="60" r="2.4" fill="#f8fafc" fillOpacity="0.18" />
      ))}
      <rect width="100" height="88" fill="#05070a" fillOpacity="0.3" />
    </svg>
  );
}

function MarketFloor() {
  return (
    <svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="100" height="88" fill="#0b1220" />
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={i}
          x={4 + i * 7}
          y={70 - (8 + ((i * 13) % 46))}
          width="4.5"
          height={8 + ((i * 13) % 46)}
          rx="1"
          fill={i % 3 === 0 ? "#22c55e" : "#1d4ed8"}
          fillOpacity="0.55"
        />
      ))}
      <path d="M0 62 L18 48 L34 56 L52 34 L70 42 L88 22 L100 28" fill="none" stroke="#22c55e" strokeWidth="1.2" strokeOpacity="0.8" />
      <rect y="70" width="100" height="18" fill="#080d16" />
      <rect width="100" height="88" fill="#05070a" fillOpacity="0.2" />
    </svg>
  );
}

function CaseScene() {
  return (
    <svg viewBox="0 0 100 88" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="case-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#0b0f16" />
        </linearGradient>
      </defs>
      <rect width="100" height="88" fill="url(#case-bg)" />
      <rect x="30" y="30" width="40" height="30" rx="3" fill="#b8860b" stroke="#facc15" strokeWidth="1" />
      <rect x="30" y="30" width="40" height="8" rx="3" fill="#8a6508" />
      <rect x="44" y="36" width="12" height="10" rx="2" fill="#3f2f04" stroke="#facc15" strokeWidth="0.7" />
      <path d="M50 40 l3.5 2.4 -1.3 4.1h-4.4l-1.3-4.1z" fill="#facc15" />
      <circle cx="50" cy="52" r="2.4" fill="#1f2937" stroke="#facc15" strokeWidth="0.6" />
      <rect width="100" height="88" fill="#05070a" fillOpacity="0.18" />
    </svg>
  );
}

const SCENES: Record<Exclude<SceneKind, "map">, () => React.JSX.Element> = {
  lockerRoom: LockerRoom,
  arena: Arena,
  bootcamp: Bootcamp,
  stream: StreamRoom,
  presser: Presser,
  market: MarketFloor,
  case: CaseScene,
};

export function MapArt({ mapId, scene = "map", className }: MapArtProps) {
  const content =
    scene === "map" && mapId ? (
      <MapAtmosphere mapId={mapId} />
    ) : scene !== "map" ? (
      SCENES[scene]()
    ) : (
      <Arena />
    );

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {content}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,0,0,0.1)_3px,rgba(0,0,0,0.1)_4px)] opacity-30" />
    </div>
  );
}
