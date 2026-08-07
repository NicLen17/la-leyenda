"use client";

import { getMapById } from "@/lib/data/maps";

type AtmosphereProps = { mapId: string };

/**
 * Full-bleed CS2 map preview art (not radar overviews).
 */
export function MapAtmosphere({ mapId }: AtmosphereProps) {
  const map = getMapById(mapId);

  if (map?.imagePath) {
    return (
      <div
        className="relative h-full w-full"
        role="img"
        aria-label={`Vista de ${map.name}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={map.imagePath}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${map.palette.sky}33 0%, transparent 42%, ${map.palette.structure}55 100%)`,
          }}
        />
      </div>
    );
  }

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
