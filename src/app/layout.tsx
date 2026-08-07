import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteHeader } from "@/components/game/site-header";
import { PwaRegister } from "@/components/pwa-register";
import { Toaster } from "@/components/ui/sonner";
import { GameProvider } from "@/lib/game/game-context";
import {
  BACKGROUND_COLOR,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  THEME_COLOR,
} from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "games",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_LA",
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
    startupImage: [
      {
        url: "/icons/apple-touch-icon.png",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR },
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* The whole game is designed to fit the viewport: no page-level scroll. */}
      <body
        className="flex h-dvh flex-col overflow-hidden bg-background text-foreground"
        style={{ backgroundColor: BACKGROUND_COLOR }}
      >
        <GameProvider>
          <SiteHeader />
          <main className="relative flex min-h-0 w-full flex-1 flex-col">
            {children}
          </main>
          <Toaster />
          <PwaRegister />
        </GameProvider>
      </body>
    </html>
  );
}
