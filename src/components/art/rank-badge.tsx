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

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label={`Premier ${rating.toLocaleString("es-AR")} · ${meta.label}`}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={meta.color} stopOpacity="1" />
          <stop offset="100%" stopColor={meta.glow} stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id={`${id}-r`} cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Hexagonal Premier-style medal */}
      <path
        d="M24 3 42 13.5v21L24 45 6 34.5v-21Z"
        fill={`url(#${id}-g)`}
        stroke={meta.glow}
        strokeWidth="1.5"
      />
      <path
        d="M24 8 36 15v16L24 38 12 31V15Z"
        fill="none"
        stroke="#0a0a0a"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <circle cx="24" cy="22" r="9" fill="#0b0f14" fillOpacity="0.55" />
      <circle cx="24" cy="22" r="9" fill={`url(#${id}-r)`} />
      <text
        x="24"
        y="23"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={rating >= 10_000 ? 7.5 : 8.5}
        fontWeight="900"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fill="#ffffff"
      >
        {rating >= 1000
          ? `${Math.round(rating / 1000)}k`
          : String(rating)}
      </text>
      <text
        x="24"
        y="40"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="800"
        fill="#0b0f14"
        fillOpacity="0.75"
        letterSpacing="0.4"
      >
        PREMIER
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
      {/* Classic shield silhouette */}
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
      {/* Rank glyph: chevron stack */}
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
  const px = size === "md" ? 40 : 32;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      title={`Premier ${premierRating.toLocaleString("es-AR")} · ${og.label}`}
    >
      <div className="flex flex-col items-center gap-0.5">
        <PremierMedal rating={premierRating} band={band.id} size={px} />
        <span
          className="text-[8px] font-bold tabular-nums leading-none"
          style={{ color: band.color }}
        >
          {premierRating.toLocaleString("es-AR")}
        </span>
      </div>
      {showBoth && (
        <div className="flex flex-col items-center gap-0.5">
          <OgBadge rank={og.id} size={px} />
          <span
            className="max-w-[52px] truncate text-[8px] font-bold leading-none"
            style={{ color: og.color }}
          >
            {og.short}
          </span>
        </div>
      )}
    </div>
  );
}
