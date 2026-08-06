# Asset sources (La Leyenda)

## Maps (`/public/maps/`)

- **Source:** [MurkyYT/cs2-map-icons](https://github.com/MurkyYT/cs2-map-icons) radar PNGs (`de_*_radar_psd.png`).
- Mirrored CS2 depot radar overviews for Active Duty + reserve maps used in the game.
- Liquipedia Commons overview URLs returned 404 at download time; assets are stored locally (no hotlinking).
- UI uses `object-cover` / `object-fit: cover`. SVG radar in `MapArt` is fallback only.

## Teams (`/public/teams/`)

- HLTV CDN logos returned 403; Liquipedia hotlinks were unreliable.
- Tier-1 / notable orgs use **stylised brand-colour SVG crests** generated locally (`scripts/generate-team-svgs.mjs`).
- `TeamLogo` tries `/teams/{id}.svg` first, then the procedural letter crest.

## Store / UI (`/public/store/`, `/public/ui/`)

- Original SVG icons for shop items and outcome result badges (win / fail / clutch / etc.).

## Scenes (`/public/scenes/`)

- Reserved for optional photoreal stills; scene backdrops currently use stylised SVG in `MapArt`.
