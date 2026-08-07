"use client";

import type { JSX } from "react";

import { getMapById } from "@/lib/data/maps";

/**
 * Atmospheric in-game-style hero scenes (not radar overviews).
 * Each map gets a stylised environment that reads as a CS screenshot vibe.
 */

type AtmosphereProps = { mapId: string };

function Dust2Atmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="d2-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7eb0d8" />
          <stop offset="55%" stopColor="#c5a56a" />
          <stop offset="100%" stopColor="#8a6b3e" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#d2-sky)" />
      {/* sun haze */}
      <ellipse cx="120" cy="18" rx="34" ry="14" fill="#ffe6a8" fillOpacity="0.35" />
      {/* far buildings */}
      <rect x="0" y="34" width="48" height="40" fill="#c4a06a" />
      <rect x="38" y="28" width="36" height="46" fill="#b8925c" />
      <rect x="70" y="32" width="42" height="42" fill="#d2b07a" />
      <rect x="108" y="24" width="52" height="50" fill="#a88450" />
      {/* arched doorway */}
      <path d="M128 74 V48 Q140 34 152 48 V74 Z" fill="#6b5230" />
      <path d="M132 74 V50 Q140 40 148 50 V74 Z" fill="#3d2e18" />
      {/* street */}
      <path d="M0 68 L70 62 L160 70 L160 90 L0 90 Z" fill="#4a4550" />
      <path d="M0 72 L68 66 L160 74" fill="none" stroke="#c4c0b8" strokeWidth="1.2" strokeOpacity="0.5" />
      {/* curb stripes */}
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={8 + i * 14}
          y="66"
          width="7"
          height="2.2"
          fill={i % 2 === 0 ? "#e8e4dc" : "#c0392b"}
        />
      ))}
      {/* tires */}
      <ellipse cx="52" cy="72" rx="5" ry="3.5" fill="#1a1a1a" />
      <ellipse cx="58" cy="73" rx="5" ry="3.5" fill="#222" />
      <ellipse cx="55" cy="70" rx="5" ry="3.5" fill="#111" />
      {/* satellite dishes */}
      <ellipse cx="22" cy="30" rx="5" ry="2" fill="#ddd" fillOpacity="0.7" />
      <line x1="22" y1="30" x2="22" y2="34" stroke="#888" strokeWidth="0.8" />
      <ellipse cx="95" cy="28" rx="4" ry="1.8" fill="#ddd" fillOpacity="0.65" />
      {/* wires */}
      <path d="M10 26 Q50 18 90 28 Q120 36 150 22" fill="none" stroke="#2a2a2a" strokeWidth="0.5" strokeOpacity="0.5" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.18" />
    </svg>
  );
}

function MirageAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="mi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a7ab0" />
          <stop offset="100%" stopColor="#c9a66b" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#mi-sky)" />
      <rect x="0" y="40" width="160" height="50" fill="#b8955c" />
      {/* palace arches */}
      <rect x="10" y="22" width="50" height="48" fill="#8a6b45" />
      {[18, 32, 46].map((x) => (
        <path key={x} d={`M${x} 70 V40 Q${x + 6} 28 ${x + 12} 40 V70 Z`} fill="#5c4530" />
      ))}
      {/* mid market */}
      <rect x="70" y="36" width="40" height="34" fill="#a07a48" />
      <rect x="78" y="44" width="24" height="18" fill="#3a2a18" />
      {/* apartments */}
      <rect x="118" y="18" width="42" height="52" fill="#9b7d4d" />
      {[126, 138, 148].map((x) => (
        <rect key={x} x={x} y="28" width="6" height="8" fill="#2a4058" fillOpacity="0.7" />
      ))}
      <ellipse cx="90" cy="78" rx="55" ry="8" fill="#c8a26a" fillOpacity="0.5" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.2" />
    </svg>
  );
}

function InfernoAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="in-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3a28" />
          <stop offset="100%" stopColor="#b06239" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#in-sky)" />
      <rect x="0" y="30" width="55" height="50" fill="#7a3b1f" />
      <rect x="50" y="38" width="60" height="42" fill="#8a4524" />
      <rect x="105" y="26" width="55" height="54" fill="#5c2f18" />
      {/* banana corridor feel */}
      <path d="M40 90 Q70 50 95 90" fill="#3d2214" fillOpacity="0.55" />
      <rect x="20" y="48" width="10" height="14" fill="#2a1810" />
      <rect x="120" y="44" width="12" height="16" fill="#f0a15c" fillOpacity="0.25" />
      {/* warm lamps */}
      <circle cx="30" cy="42" r="3" fill="#f0a15c" fillOpacity="0.6" />
      <circle cx="130" cy="38" r="3" fill="#f0a15c" fillOpacity="0.5" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.28" />
    </svg>
  );
}

function NukeAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="nk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a38" />
          <stop offset="100%" stopColor="#3d5566" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#nk-sky)" />
      {/* cooling towers / silos */}
      <ellipse cx="40" cy="70" rx="22" ry="8" fill="#2b4a63" />
      <path d="M18 70 Q18 20 40 12 Q62 20 62 70" fill="#3d5566" stroke="#6fd3e8" strokeOpacity="0.3" />
      <ellipse cx="40" cy="14" rx="10" ry="4" fill="#8b9aa6" />
      <rect x="80" y="28" width="70" height="50" fill="#2b3a48" stroke="#6fd3e8" strokeOpacity="0.25" />
      <rect x="90" y="38" width="20" height="28" fill="#123047" />
      <rect x="118" y="38" width="20" height="28" fill="#123047" />
      {/* catwalk */}
      <rect x="70" y="48" width="20" height="3" fill="#6fd3e8" fillOpacity="0.35" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.3" />
    </svg>
  );
}

function AncientAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="an-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3a2c" />
          <stop offset="100%" stopColor="#4f7a52" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#an-sky)" />
      {/* jungle canopy */}
      <ellipse cx="20" cy="20" rx="30" ry="16" fill="#14532d" fillOpacity="0.7" />
      <ellipse cx="70" cy="14" rx="36" ry="18" fill="#166534" fillOpacity="0.65" />
      <ellipse cx="130" cy="22" rx="34" ry="16" fill="#14532d" fillOpacity="0.7" />
      {/* ruins */}
      <rect x="35" y="40" width="90" height="40" fill="#2f5a41" />
      <path d="M50 80 V50 Q80 34 110 50 V80 Z" fill="#1f4a37" />
      <rect x="70" y="55" width="20" height="25" fill="#0f291c" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.25" />
    </svg>
  );
}

function AnubisAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="au-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2a55" />
          <stop offset="100%" stopColor="#c9a44c" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#au-sky)" />
      <rect x="0" y="48" width="160" height="42" fill="#a88430" />
      {/* canals */}
      <path d="M0 60 Q40 48 80 62 Q120 74 160 58 L160 90 L0 90 Z" fill="#2c3f7a" fillOpacity="0.55" />
      {/* palace */}
      <rect x="95" y="22" width="50" height="40" fill="#6b5220" />
      <polygon points="95,22 120,8 145,22" fill="#ffd77a" fillOpacity="0.35" />
      <rect x="110" y="36" width="12" height="20" fill="#1e2a40" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.22" />
    </svg>
  );
}

function CacheAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="160" height="90" fill="#2a3540" />
      <rect x="0" y="0" width="160" height="35" fill="#1a222a" />
      {/* warehouse */}
      <rect x="20" y="28" width="70" height="48" fill="#3b4a56" stroke="#8fd0ff" strokeOpacity="0.2" />
      <rect x="100" y="32" width="50" height="44" fill="#4a5c6a" />
      {/* containers */}
      <rect x="30" y="50" width="24" height="14" fill="#1d4ed8" fillOpacity="0.7" />
      <rect x="58" y="52" width="24" height="12" fill="#b45309" fillOpacity="0.7" />
      <rect x="110" y="55" width="28" height="12" fill="#15803d" fillOpacity="0.65" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.28" />
    </svg>
  );
}

function OverpassAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="ov-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b8f72" />
          <stop offset="100%" stopColor="#3a4540" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#ov-sky)" />
      {/* overpass bridge */}
      <rect x="0" y="40" width="160" height="10" fill="#4a5544" />
      <rect x="20" y="50" width="8" height="30" fill="#3a4238" />
      <rect x="75" y="50" width="8" height="30" fill="#3a4238" />
      <rect x="130" y="50" width="8" height="30" fill="#3a4238" />
      <ellipse cx="100" cy="78" rx="40" ry="10" fill="#2a3530" fillOpacity="0.5" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.25" />
    </svg>
  );
}

function TrainAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="160" height="90" fill="#2c343d" />
      <rect x="0" y="55" width="160" height="35" fill="#1a2028" />
      {/* rails */}
      <line x1="0" y1="70" x2="160" y2="70" stroke="#555" strokeWidth="1.5" />
      <line x1="0" y1="78" x2="160" y2="78" stroke="#555" strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={6 + i * 13} y="68" width="8" height="12" fill="#3a4450" />
      ))}
      {/* train cars */}
      <rect x="25" y="38" width="50" height="28" rx="2" fill="#4a5560" stroke="#b9c6d1" strokeOpacity="0.3" />
      <rect x="85" y="40" width="50" height="26" rx="2" fill="#3a4450" stroke="#b9c6d1" strokeOpacity="0.25" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.3" />
    </svg>
  );
}

function VertigoAtmosphere() {
  return (
    <svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="ve-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87a0b8" />
          <stop offset="100%" stopColor="#3a4248" />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill="url(#ve-sky)" />
      {/* skyscraper edge */}
      <rect x="0" y="20" width="100" height="70" fill="#4a4239" />
      <rect x="10" y="30" width="16" height="12" fill="#87ceeb" fillOpacity="0.25" />
      <rect x="35" y="30" width="16" height="12" fill="#87ceeb" fillOpacity="0.2" />
      <rect x="60" y="30" width="16" height="12" fill="#87ceeb" fillOpacity="0.22" />
      {/* scaffolding */}
      <rect x="100" y="35" width="50" height="4" fill="#ffcf87" fillOpacity="0.5" />
      <rect x="110" y="35" width="3" height="40" fill="#a8a196" />
      <rect x="140" y="35" width="3" height="40" fill="#a8a196" />
      {/* drop */}
      <path d="M100 90 L160 90 L160 55 L100 70 Z" fill="#1a2030" fillOpacity="0.6" />
      <rect width="160" height="90" fill="#05070a" fillOpacity="0.22" />
    </svg>
  );
}

const ATMOSPHERES: Record<string, () => JSX.Element> = {
  dust2: Dust2Atmosphere,
  mirage: MirageAtmosphere,
  inferno: InfernoAtmosphere,
  nuke: NukeAtmosphere,
  ancient: AncientAtmosphere,
  anubis: AnubisAtmosphere,
  cache: CacheAtmosphere,
  overpass: OverpassAtmosphere,
  train: TrainAtmosphere,
  vertigo: VertigoAtmosphere,
};

export function MapAtmosphere({ mapId }: AtmosphereProps) {
  const Scene = ATMOSPHERES[mapId];
  const map = getMapById(mapId);

  if (Scene) {
    return (
      <div className="h-full w-full" role="img" aria-label={map ? `Escena de ${map.name}` : "Mapa"}>
        <Scene />
      </div>
    );
  }

  // Generic palette wash for unknown maps
  const palette = map?.palette;
  return (
    <div
      className="h-full w-full"
      style={{
        background: `linear-gradient(160deg, ${palette?.sky ?? "#1a2030"}, ${palette?.structure ?? "#0b0f14"} 55%, ${palette?.ground ?? "#3a3428"})`,
      }}
    />
  );
}
