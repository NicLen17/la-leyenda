import type { MetadataRoute } from "next";

import {
  BACKGROUND_COLOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_TAGLINE,
  THEME_COLOR,
} from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_SHORT_NAME,
    description: SITE_DESCRIPTION,
    lang: "es",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "any",
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    categories: ["games", "entertainment", "sports"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Jugar",
        short_name: "Jugar",
        description: "Empezar o continuar tu carrera",
        url: "/",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Ranking",
        short_name: "Ranking",
        description: "Ver el ranking global",
        url: "/ranking",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Perfil",
        short_name: "Perfil",
        description: "Tu historial y logros",
        url: "/profile",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
