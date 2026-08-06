/**
 * Generates stylised brand-coloured SVG crests for tier-1 orgs when CDN
 * downloads (HLTV/Liquipedia) are unavailable. Not official trademarks —
 * TeamLogo still falls back to the procedural crest if a file is missing.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const teams = [
  { id: "falcons", primary: "#0BDA51", secondary: "#04150c", mark: "F" },
  { id: "vitality", primary: "#FFE500", secondary: "#111111", mark: "V" },
  { id: "spirit", primary: "#E8362A", secondary: "#101010", mark: "S" },
  { id: "navi", primary: "#FFE500", secondary: "#1a1a1a", mark: "N" },
  { id: "faze", primary: "#E43D30", secondary: "#141414", mark: "FZ" },
  { id: "mouz", primary: "#E4002B", secondary: "#0d0d0d", mark: "M" },
  { id: "g2", primary: "#F5003B", secondary: "#101010", mark: "G2" },
  { id: "liquid", primary: "#0043FF", secondary: "#0b0f1a", mark: "TL" },
  { id: "furia", primary: "#111111", secondary: "#2b2b2b", mark: "FU" },
  { id: "mongolz", primary: "#C8102E", secondary: "#101010", mark: "MZ" },
  { id: "astralis", primary: "#E4002B", secondary: "#111827", mark: "A" },
  { id: "aurora", primary: "#7C3AED", secondary: "#120b1f", mark: "AU" },
  { id: "eternal-fire", primary: "#F97316", secondary: "#160c04", mark: "EF" },
  { id: "pain", primary: "#DF2A34", secondary: "#0f0f0f", mark: "PN" },
  { id: "virtus", primary: "#F97316", secondary: "#141414", mark: "VP" },
  { id: "heroic", primary: "#00B2A9", secondary: "#0c1a19", mark: "H" },
  { id: "nip", primary: "#0EA5E9", secondary: "#0b1220", mark: "NP" },
  { id: "complexity", primary: "#1D4ED8", secondary: "#0a0f1f", mark: "CO" },
  { id: "9z", primary: "#7C3AED", secondary: "#0f0a1c", mark: "9z" },
  { id: "imperial", primary: "#22D3EE", secondary: "#08161a", mark: "IM" },
];

const dir = join(process.cwd(), "public", "teams");
mkdirSync(dir, { recursive: true });

for (const team of teams) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${team.primary}"/>
      <stop offset="100%" stop-color="${team.secondary}"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="12" fill="${team.secondary}"/>
  <path d="M32 6 54 16v20c0 12-9 19-22 22C19 55 10 48 10 36V16Z" fill="url(#g)" opacity="0.95"/>
  <circle cx="32" cy="30" r="14" fill="${team.secondary}" opacity="0.55"/>
  <text x="32" y="31" text-anchor="middle" dominant-baseline="central"
    font-family="Arial Black, system-ui, sans-serif" font-size="${team.mark.length > 1 ? 16 : 20}"
    font-weight="900" fill="#ffffff">${team.mark}</text>
  <rect x="0" y="0" width="64" height="64" rx="12" fill="none" stroke="${team.primary}" stroke-width="2" opacity="0.7"/>
</svg>
`;
  writeFileSync(join(dir, `${team.id}.svg`), svg);
  console.log("wrote", team.id);
}
