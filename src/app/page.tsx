"use client";

import Image from "next/image";
import { useState } from "react";

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

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[720px] flex-1 flex-col items-center justify-center px-4 py-4">
        <div className="flex w-full flex-col items-center gap-2">
          <div className="animate-hero-brand text-center">
            <span className="mx-auto flex size-[clamp(4.5rem,14vw,7rem)] items-center justify-center rounded-full border border-primary/70 bg-black/30 p-[3px] shadow-[0_0_0_1px_rgba(232,163,23,0.12),0_0_24px_rgba(232,163,23,0.32),0_12px_40px_rgba(0,0,0,0.55)]">
              <Image
                src="/brand/logo.webp"
                alt="La Leyenda"
                width={112}
                height={112}
                priority
                className="size-full rounded-full object-cover object-center"
              />
            </span>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.42em] text-primary">
              Counter-Strike 2
            </p>
            <h1 className="mt-0.5 text-[clamp(2.2rem,6.5vw,3.6rem)] font-black uppercase leading-[0.88] tracking-[0.06em] drop-shadow-[0_8px_40px_rgba(0,0,0,0.85)]">
              La Leyenda
            </h1>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
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
