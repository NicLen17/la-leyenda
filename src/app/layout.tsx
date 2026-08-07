import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteHeader } from "@/components/game/site-header";
import { Toaster } from "@/components/ui/sonner";
import { GameProvider } from "@/lib/game/game-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Leyenda | CS2 Career Simulator",
  description:
    "Simulador de carrera de Counter-Strike 2: de una LAN de tier 3 a campeón de Major, con memoria de lineups, aim, clutches y mercado de pases real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* The whole game is designed to fit the viewport: no page-level scroll. */}
      <body className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
        <GameProvider>
          <SiteHeader />
          <main className="relative flex min-h-0 w-full flex-1 flex-col">
            {children}
          </main>
          <Toaster />
        </GameProvider>
      </body>
    </html>
  );
}
