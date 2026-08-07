"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RiskGaugeProps = {
  /** Success chance 0–100 (win zone size). */
  chance: number;
  label?: string;
  onComplete: (success: boolean) => void;
};

type Stage = "idle" | "spinning" | "done";

/**
 * Circular probability gauge inspired by trade-up / risk spinners.
 * Needle spins and lands inside (success) or outside (fail) the blue arc.
 */
export function RiskGauge({
  chance,
  label = "Jugada riesgosa",
  onComplete,
}: RiskGaugeProps) {
  const clamped = Math.min(72, Math.max(18, chance));
  const [stage, setStage] = useState<Stage>("idle");
  const [angle, setAngle] = useState(0);
  const [success, setSuccess] = useState<boolean | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const spin = () => {
    if (stage !== "idle") return;
    setStage("spinning");

    const willSucceed = Math.random() * 100 < clamped;
    const winSpan = (clamped / 100) * 360;
    const landInZone = willSucceed
      ? 6 + Math.random() * Math.max(10, winSpan - 12)
      : winSpan + 10 + Math.random() * Math.max(20, 360 - winSpan - 20);
    const spins = 4 + Math.floor(Math.random() * 3);
    const target = spins * 360 + landInZone;

    const start = performance.now();
    const duration = 2800 + Math.random() * 600;
    const from = angle;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setAngle(from + (target - from) * eased);
      if (t < 1) {
        frame.current = requestAnimationFrame(tick);
        return;
      }
      setSuccess(willSucceed);
      setStage("done");
      window.setTimeout(() => onComplete(willSucceed), 900);
    };

    frame.current = requestAnimationFrame(tick);
  };

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;
  const winSweep = (clamped / 100) * 360;
  const winPath = describeArc(cx, cy, r, 0, winSweep);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-sky-400">{clamped}% chance</span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border border-violet-500/30 bg-[radial-gradient(ellipse_at_center,#1a1030_0%,#07060c_70%)] p-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(168,85,247,0.35) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="relative">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-[0_0_24px_rgba(139,92,246,0.35)]"
          >
            <polygon
              points={octagonPoints(cx, cy, 98)}
              fill="none"
              stroke="rgba(167,139,250,0.55)"
              strokeWidth="2"
            />
            <polygon
              points={octagonPoints(cx, cy, 90)}
              fill="rgba(15,10,28,0.85)"
              stroke="rgba(99,102,241,0.4)"
              strokeWidth="1.5"
            />

            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
            />
            <path
              d={winPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="10"
              strokeLinecap="butt"
              className="drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]"
            />

            <g transform={`rotate(${angle} ${cx} ${cy})`}>
              <line
                x1={cx}
                y1={cy}
                x2={cx}
                y2={cy - r + 4}
                stroke="#f43f5e"
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-[0_0_6px_rgba(244,63,94,0.9)]"
              />
              <circle cx={cx} cy={cy} r="6" fill="#f43f5e" />
            </g>
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p
              className={cn(
                "text-3xl font-black tabular-nums tracking-tight",
                stage === "done"
                  ? success
                    ? "text-sky-300"
                    : "text-rose-400"
                  : "text-white",
              )}
            >
              {clamped.toFixed(1)}%
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-200/80">
              {stage === "done"
                ? success
                  ? "Buen resultado"
                  : "Mal resultado"
                : "Probabilidad"}
            </p>
          </div>
        </div>

        <p className="relative z-10 mt-3 max-w-xs text-center text-xs text-violet-100/70">
          {stage === "idle" &&
            "Girás la ruleta. La zona azul es el resultado bueno."}
          {stage === "spinning" && "La aguja está cayendo..."}
          {stage === "done" &&
            (success
              ? "La jugada sale a favor."
              : "La jugada se tuerce en tu contra.")}
        </p>

        {stage === "idle" && (
          <Button onClick={spin} className="relative z-10 mt-3" size="lg">
            Arriesgar
          </Button>
        )}
      </div>
    </div>
  );
}

function octagonPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 8) * (2 * i - 1);
    return `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`;
  }).join(" ");
}

/** 0° = top, clockwise. */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const toXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const start = toXY(startAngle);
  const end = toXY(endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}
