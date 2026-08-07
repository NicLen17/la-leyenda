"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Team } from "@/lib/types/game";

type TeamLogoProps = {
  team: Team;
  size?: number;
  className?: string;
  /** Adds the animated sheen used when a crest first appears. */
  animate?: boolean;
  /** Skip the brand-coloured plate (e.g. watermark usage). */
  bare?: boolean;
};

function hashOf(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function GeneratedCrest({
  team,
  size,
  className,
  animate,
}: TeamLogoProps) {
  const variant = hashOf(team.id) % 4;
  const gradientId = `crest-${team.id}`;
  const glowId = `crest-glow-${team.id}`;
  const initials = team.shortName.slice(0, 4).toUpperCase();
  const fontSize = initials.length >= 4 ? 15 : initials.length === 3 ? 18 : 22;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={`Escudo de ${team.name}`}
      className={cn("shrink-0", animate && "animate-crest-in", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={team.colors.primary} stopOpacity="0.95" />
          <stop offset="100%" stopColor={team.colors.secondary} stopOpacity="1" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={team.colors.primary} stopOpacity="0.55" />
          <stop offset="100%" stopColor={team.colors.primary} stopOpacity="0" />
        </radialGradient>
      </defs>

      {variant === 0 && (
        <path
          d="M32 3 58 13v22c0 14-11 22-26 26C17 57 6 49 6 35V13Z"
          fill={`url(#${gradientId})`}
          stroke={team.colors.primary}
          strokeWidth="2"
        />
      )}
      {variant === 1 && (
        <path
          d="M32 3 57 17v30L32 61 7 47V17Z"
          fill={`url(#${gradientId})`}
          stroke={team.colors.primary}
          strokeWidth="2"
        />
      )}
      {variant === 2 && (
        <rect
          x="6"
          y="6"
          width="52"
          height="52"
          rx="14"
          fill={`url(#${gradientId})`}
          stroke={team.colors.primary}
          strokeWidth="2"
        />
      )}
      {variant === 3 && (
        <path
          d="M32 4 60 32 32 60 4 32Z"
          fill={`url(#${gradientId})`}
          stroke={team.colors.primary}
          strokeWidth="2"
        />
      )}

      <rect x="0" y="0" width="64" height="64" fill={`url(#${glowId})`} />

      <path
        d="M10 40 54 22"
        stroke={team.colors.primary}
        strokeWidth="2.5"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />

      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="900"
        fontFamily="var(--font-display), system-ui, sans-serif"
        fill="#ffffff"
        stroke="rgba(0,0,0,0.55)"
        strokeWidth="0.6"
        letterSpacing="-0.5"
      >
        {initials}
      </text>
    </svg>
  );
}

/**
 * Prefers a real crest in /public/teams/real-logo (logoPath), then falls back
 * to a generated letter crest for orgs without artwork.
 */
export function TeamLogo({
  team,
  size = 44,
  className,
  animate,
  bare = false,
}: TeamLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = team.logoPath ?? `/teams/${team.id}.svg`;
  const pad = Math.max(4, Math.round(size * 0.12));

  if (failed) {
    return (
      <GeneratedCrest
        team={team}
        size={size}
        className={className}
        animate={animate}
      />
    );
  }

  if (bare) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        width={size}
        height={size}
        alt={`Logo de ${team.name}`}
        className={cn(
          "shrink-0 object-contain",
          animate && "animate-crest-in",
          className,
        )}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
        draggable={false}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border",
        animate && "animate-crest-in",
        className,
      )}
      style={{
        width: size,
        height: size,
        padding: pad,
        background: `linear-gradient(145deg, ${team.colors.secondary}f2 0%, ${team.colors.secondary} 55%, ${team.colors.primary}33 100%)`,
        borderColor: `${team.colors.primary}66`,
        boxShadow: `inset 0 0 0 1px ${team.colors.primary}22, 0 0 18px ${team.colors.primary}18`,
      }}
      title={team.name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Logo de ${team.name}`}
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
        draggable={false}
      />
    </span>
  );
}
