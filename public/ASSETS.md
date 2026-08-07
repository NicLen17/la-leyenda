# Asset sources (La Leyenda)

## Maps (`/public/maps/`)

- Radar PNGs remain on disk (MurkyYT/cs2-map-icons) as optional reference assets.
- **UI heroes** use stylised atmospheric SVG scenes in `MapAtmosphere` (street/site vibe), not top-down radars.

## Teams (`/public/teams/`)

- HLTV CDN logos returned 403; Liquipedia hotlinks were unreliable.
- Tier-1 / notable orgs use **stylised brand-colour SVG crests** generated locally (`scripts/generate-team-svgs.mjs`).
- `TeamLogo` tries `/teams/{id}.svg` first, then the procedural letter crest.

## Store / UI (`/public/store/`, `/public/ui/`)

- Original SVG icons for shop items and outcome result badges (win / fail / clutch / etc.).

## Scenes (`/public/scenes/`)

- Reserved for optional photoreal stills; scene backdrops currently use stylised SVG in `MapArt`.
