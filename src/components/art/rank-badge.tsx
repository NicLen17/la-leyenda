import { OG_RANKS, getOgRank, getPremierBand } from "@/lib/game/ranks";
import { cn } from "@/lib/utils";
import type { OgRankId, PremierBand } from "@/lib/types/game";

type RankBadgesProps = {
  premierRating: number;
  className?: string;
  size?: "sm" | "md";
  /** Show Premier + OG side by side (default). */
  showBoth?: boolean;
};

/**
 * CS2 Premier medal silhouette: vertically pointed hexagon (point-top /
 * point-bottom) with concentric rings — matches the in-game CS Rating badge.
 * clip-path mirror for non-SVG usage: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)
 */
export const PREMIER_MEDAL_CLIP =
  "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

/** Outer path of the CS2 Premier badge in a 48×56 viewBox (taller points). */
const PREMIER_OUTER =
  "M24 2 L42.5 12.5 V35.5 L24 46 L5.5 35.5 V12.5 Z";
const PREMIER_MID =
  "M24 7 L37 14.5 V33.5 L24 41 L11 33.5 V14.5 Z";
const PREMIER_INNER =
  "M24 11.5 L32.5 16.5 V31.5 L24 36.5 L15.5 31.5 V16.5 Z";

function PremierMedal({
  rating,
  band,
  size,
}: {
  rating: number;
  band: PremierBand;
  size: number;
}) {
  const meta = getPremierBand(rating);
  const id = `prem-${band}-${Math.round(rating)}`;
  const height = Math.round(size * 1.15);

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={height}
      role="img"
      aria-label={`Premier ${rating.toLocaleString("es-AR")} · ${meta.label}`}
      style={{ clipPath: PREMIER_MEDAL_CLIP }}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={meta.color} stopOpacity="1" />
          <stop offset="55%" stopColor={meta.glow} stopOpacity="0.95" />
          <stop offset="100%" stopColor={meta.color} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`${id}-r`} cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Pointed hexagon body (CS2 Premier silhouette) */}
      <path d={PREMIER_OUTER} fill={`url(#${id}-g)`} />
      <path
        d={PREMIER_OUTER}
        fill="none"
        stroke={`url(#${id}-edge)`}
        strokeWidth="1.6"
      />
      <path
        d={PREMIER_MID}
        fill="none"
        stroke="#0a0a0a"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      <path
        d={PREMIER_INNER}
        fill="#0b0f14"
        fillOpacity="0.5"
        stroke={meta.glow}
        strokeOpacity="0.65"
        strokeWidth="0.9"
      />
      <circle cx="24" cy="24" r="8.5" fill="#0b0f14" fillOpacity="0.55" />
      <circle cx="24" cy="24" r="8.5" fill={`url(#${id}-r)`} />
      <text
        x="24"
        y="24.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={rating >= 10_000 ? 7.2 : 8.2}
        fontWeight="900"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fill="#ffffff"
      >
        {rating >= 1000 ? `${Math.round(rating / 1000)}k` : String(rating)}
      </text>
    </svg>
  );
}

function OgBadge({ rank, size }: { rank: OgRankId; size: number }) {
  const meta = OG_RANKS.find((entry) => entry.id === rank) ?? getOgRank(0);

  const stars =
    meta.tier === "silver"
      ? 1
      : meta.tier === "gold"
        ? 2
        : meta.tier === "mg"
          ? 3
          : meta.tier === "eagle"
            ? 4
            : 5;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label={meta.label}
    >
      <defs>
        <linearGradient id={`og-${rank}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={meta.color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={meta.color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d="M24 4 40 10v14c0 10-7 16-16 20C15 40 8 34 8 24V10Z"
        fill={`url(#og-${rank})`}
        stroke="#0b0f14"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <path
        d="M24 8 35 12.5v11c0 7-5 12-11 15-6-3-11-8-11-15v-11Z"
        fill="#0b0f14"
        fillOpacity="0.28"
      />
      {Array.from({ length: Math.min(stars, 3) }, (_, i) => (
        <path
          key={i}
          d={`M17 ${18 + i * 5} L24 ${13 + i * 5} L31 ${18 + i * 5}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={1 - i * 0.12}
        />
      ))}
      {meta.tier === "eagle" || meta.tier === "elite" ? (
        <path
          d="M15 28c3-3 6-4 9-4s6 1 9 4"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : null}
      {meta.tier === "elite" ? (
        <circle cx="24" cy="32" r="2.2" fill="#ffffff" />
      ) : null}
      <text
        x="24"
        y="42"
        textAnchor="middle"
        fontSize="6"
        fontWeight="900"
        fill="#ffffff"
        letterSpacing="0.3"
      >
        {meta.short}
      </text>
    </svg>
  );
}

/** Premier medal + classic CS:GO rank badge shown next to the career board. */
export function RankBadges({
  premierRating,
  className,
  size = "sm",
  showBoth = true,
}: RankBadgesProps) {
  const band = getPremierBand(premierRating);
  const og = getOgRank(premierRating);
  const px = size === "md" ? 42 : 34;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      title={`Premier ${premierRating.toLocaleString("es-AR")} · ${og.label}`}
    >
      <div className="flex flex-col items-center gap-0.5">
        <PremierMedal rating={premierRating} band={band.id} size={px} />
        <span
          className="text-[9px] font-bold tabular-nums leading-none"
          style={{ color: band.color }}
        >
          {premierRating.toLocaleString("es-AR")}
        </span>
      </div>
      {showBoth && (
        <div className="flex flex-col items-center gap-0.5">
          <OgBadge rank={og.id} size={px} />
          <span
            className="max-w-[56px] truncate text-[9px] font-bold leading-none"
            style={{ color: og.color }}
          >
            {og.short}
          </span>
        </div>
      )}
    </div>
  );
}
