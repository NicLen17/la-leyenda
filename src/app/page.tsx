"use client";

import { useState } from "react";

import { BrandLogo } from "@/components/art/brand-logo";
import { HomeHeroArt } from "@/components/art/home-hero-art";
import { SetupForm } from "@/components/game/setup-form";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [launching, setLaunching] = useState(false);

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden",
        launching && "animate-career-zoom-out",
      )}
    >
      <HomeHeroArt />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[720px] flex-1 flex-col items-center overflow-y-auto overscroll-contain px-3 py-2 sm:justify-center sm:px-4 sm:py-4">
        <div className="flex w-full flex-col items-center gap-1.5 sm:gap-2">
          <div className="animate-hero-brand flex w-full shrink-0 flex-col items-center text-center">
            <BrandLogo
              size={72}
              priority
              className="shadow-[0_0_0_1px_rgba(232,163,23,0.16),0_0_24px_rgba(232,163,23,0.4),0_12px_40px_rgba(0,0,0,0.55)] sm:!h-24 sm:!w-24"
            />
            <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.42em] text-primary sm:mt-2 sm:text-[10px]">
              Counter-Strike 2
            </p>
            <h1 className="mt-0.5 text-[clamp(1.6rem,7vw,3.6rem)] font-black uppercase leading-[0.88] tracking-[0.06em] drop-shadow-[0_8px_40px_rgba(0,0,0,0.85)]">
              La Leyenda
            </h1>
            <p className="mt-1 hidden max-w-sm text-[12px] leading-snug tracking-normal text-muted-foreground sm:mt-1 sm:block sm:text-[13px]">
              De la LAN al Major. Elegí rol y jugá cada clutch.
            </p>
          </div>

          <div className="animate-card-in w-full [animation-delay:0.45s]">
            <SetupForm
              launching={launching}
              onLaunchStart={() => setLaunching(true)}
            />
          </div>
        </div>
      </div>

      {launching ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-50 bg-black/40"
        />
      ) : null}
    </div>
  );
}
