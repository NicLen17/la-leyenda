/** Shared site identity for metadata, PWA manifest, and UI. */
export const SITE_NAME = "La Leyenda";
export const SITE_SHORT_NAME = "La Leyenda";
export const SITE_TAGLINE = "CS2 Career Simulator";
export const SITE_DESCRIPTION =
  "Simulador de carrera de Counter-Strike 2: de una LAN de tier 3 a campeón de Major. Entrená aim, jugá clutches, firmá contratos y subí en el ranking.";
export const SITE_KEYWORDS = [
  "La Leyenda",
  "CS2",
  "Counter-Strike 2",
  "simulador de carrera",
  "career simulator",
  "esports",
  "juego",
  "browser game",
  "PWA",
] as const;

export const THEME_COLOR = "#e8a317";
export const BACKGROUND_COLOR = "#12100e";

/**
 * Bump when replacing brand/icon assets so browsers + SW drop stale cache.
 */
export const BRAND_ASSET_VERSION = "4";

/** Versioned public path for brand/PWA media. */
export function brandAsset(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${clean}?v=${BRAND_ASSET_VERSION}`;
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
