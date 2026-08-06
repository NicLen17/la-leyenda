"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "Cargando radar...",
  "Comprando utilidad...",
  "Calibrando sensibilidad...",
  "Revisando la economía del rival...",
  "Plantando la bomba...",
  "Leyendo el default...",
  "Warmup en el aim map...",
  "Analizando demos...",
  "Ajustando crosshair placement...",
  "Contando la plata del rival...",
];

/**
 * Themed transition screen: a radar sweep plus a defuse-style progress bar.
 * Shown between every phase change so screens never swap abruptly.
 */
export function GameLoader() {
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDots((current) => (current.length >= 3 ? "" : `${current}.`));
    }, 160);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/92 backdrop-blur-sm">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
        </svg>
        <svg viewBox="0 0 100 100" className="animate-radar-sweep absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="sweep" x1="0.5" y1="0.5" x2="1" y2="0.5">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M50 50 L96 50 A46 46 0 0 0 73 10 Z" fill="url(#sweep)" />
        </svg>
        <div className="animate-bomb-blink absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive shadow-[0_0_12px_var(--destructive)]" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {tip}
          <span className="inline-block w-4 text-left">{dots}</span>
        </p>
        <div className="h-1 w-52 overflow-hidden rounded-full bg-border">
          <div className="animate-bar-grow h-full w-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
