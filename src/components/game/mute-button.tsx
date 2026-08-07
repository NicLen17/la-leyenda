"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isMuted, setMuted, subscribeMute } from "@/lib/audio/sounds";
import { cn } from "@/lib/utils";

type MuteButtonProps = {
  className?: string;
  disabled?: boolean;
};

/** Persistent mute toggle for game SFX. Always available during play. */
export function MuteButton({ className, disabled }: MuteButtonProps) {
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    setAudioMuted(isMuted());
    return subscribeMute(setAudioMuted);
  }, []);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={disabled}
      aria-pressed={audioMuted}
      aria-label={audioMuted ? "Activar sonido" : "Silenciar juego"}
      title={audioMuted ? "Activar sonido" : "Silenciar juego"}
      className={cn(
        "size-9 shrink-0 border-white/15 bg-black/35 px-0 text-muted-foreground hover:bg-black/50 hover:text-foreground",
        className,
      )}
      onClick={() => setMuted(!audioMuted)}
    >
      {audioMuted ? (
        <VolumeX className="size-4" aria-hidden />
      ) : (
        <Volume2 className="size-4" aria-hidden />
      )}
    </Button>
  );
}
