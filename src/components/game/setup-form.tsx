"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PLAY_BUTTON_NAV_DELAY_MS,
  isMuted,
  playMenuClick,
  playPlayButton,
  setMuted,
  subscribeMute,
} from "@/lib/audio/sounds";
import { ROLES } from "@/lib/data/archetypes";
import {
  NATIONALITIES,
  NATIONALITY_FLAGS,
  REGIONS,
} from "@/lib/game/constants";
import { getDailySetup, getRandomSetup } from "@/lib/game/setup";
import { useClientClock } from "@/lib/hooks/use-client-clock";
import { saveSetup } from "@/lib/game/storage";
import type { CareerSetup, Region, Role } from "@/lib/types/game";
import { cn } from "@/lib/utils";

const setupSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, "Poné un nick de al menos 2 caracteres")
    .max(16, "Máximo 16 caracteres"),
  realName: z.string().trim().min(1),
  nationality: z.string().min(1),
  region: z.enum([
    "south-america",
    "north-america",
    "europe",
    "cis",
    "asia",
  ]),
  role: z.enum(["entry", "awp", "igl", "lurker", "support"]),
  isDaily: z.boolean(),
});

function dailyCountdown(): string {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  const diff = next.getTime() - now.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

type SetupFormProps = {
  launching?: boolean;
  onLaunchStart?: () => void;
};

export function SetupForm({
  launching = false,
  onLaunchStart,
}: SetupFormProps) {
  const router = useRouter();
  const navTimer = useRef<number | null>(null);

  // The daily challenge depends on the current date, so it only resolves on the
  // client. During SSR the clock is null and we render a neutral placeholder.
  const clock = useClientClock();
  const daily = clock === null ? null : getDailySetup();
  const countdown = clock === null ? "--h --m" : dailyCountdown();

  const [nickname, setNickname] = useState("");
  const [region, setRegion] = useState<Region>("south-america");
  const [nationality, setNationality] = useState(
    NATIONALITIES["south-america"][0],
  );
  const [role, setRole] = useState<Role>("entry");
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    setAudioMuted(isMuted());
    return subscribeMute(setAudioMuted);
  }, []);

  useEffect(() => {
    return () => {
      if (navTimer.current !== null) {
        window.clearTimeout(navTimer.current);
      }
    };
  }, []);

  function start(setup: CareerSetup) {
    if (launching) return;

    const parsed = setupSchema.safeParse(setup);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    saveSetup(parsed.data);
    onLaunchStart?.();
    playPlayButton();

    // Hold on the zoom while the play sting plays; reveal /play as it tails out.
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reducedMotion ? 120 : PLAY_BUTTON_NAV_DELAY_MS;

    navTimer.current = window.setTimeout(() => {
      router.push("/play");
    }, delay);
  }

  function handleStart() {
    start({
      nickname,
      realName: nickname || "Jugador",
      nationality,
      region,
      role,
      isDaily: false,
    });
  }

  function handleRandom() {
    if (launching) return;
    const random = getRandomSetup();
    setRegion(random.region);
    setNationality(random.nationality);
    setRole(random.role);
    setNickname(random.nickname);
    toast.message("Arranque al azar listo");
  }

  const selectedRole = ROLES.find((entry) => entry.id === role);
  const selectedRegion = REGIONS.find((item) => item.id === region);
  const nationalityFlag = NATIONALITY_FLAGS[nationality] ?? "🏳️";

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      {/* daily challenge */}
      <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent px-3 py-2.5 sm:px-4">
        <div className="min-h-0 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">
            Del día · {countdown}
          </p>
          <p className="truncate text-[13px] font-bold sm:text-sm">
            {daily
              ? `${daily.nationality} · ${ROLES.find((entry) => entry.id === daily.role)?.label} · ${daily.nickname}`
              : "Cargando desafío..."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={launching}
            aria-pressed={audioMuted}
            aria-label={audioMuted ? "Activar sonido" : "Silenciar juego"}
            title={audioMuted ? "Activar sonido" : "Silenciar juego"}
            className="size-8 border-white/15 bg-black/35 px-0 text-muted-foreground hover:bg-black/50 hover:text-foreground"
            onClick={() => setMuted(!audioMuted)}
          >
            {audioMuted ? (
              <VolumeX className="size-4" aria-hidden />
            ) : (
              <Volume2 className="size-4" aria-hidden />
            )}
          </Button>
          <Button
            size="sm"
            disabled={!daily || launching}
            className="shrink-0 bg-amber-500 text-black hover:bg-amber-400"
            onClick={() =>
              daily &&
              start({ ...daily, nickname: nickname.trim() || daily.nickname })
            }
          >
            {launching ? "Entrando..." : "Jugar"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3 sm:gap-3.5 sm:p-4">
        {/* identity */}
        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="nickname"
              className="text-[11px] uppercase tracking-wider"
            >
              Nick
            </Label>
            <Input
              id="nickname"
              placeholder="s1mple"
              value={nickname}
              maxLength={16}
              disabled={launching}
              onChange={(event) => setNickname(event.target.value)}
              className="h-9 border-white/10 bg-black/35"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[11px] uppercase tracking-wider">
              Región
            </Label>
            <Select
              value={region}
              disabled={launching}
              onValueChange={(value) => {
                if (!value) return;
                playMenuClick();
                const next = value as Region;
                setRegion(next);
                setNationality(NATIONALITIES[next][0]);
              }}
            >
              <SelectTrigger className="h-9 w-full border-white/10 bg-black/35">
                <SelectValue placeholder="Región">
                  {selectedRegion ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-base leading-none" aria-hidden>
                        {selectedRegion.flag}
                      </span>
                      <span>{selectedRegion.label}</span>
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {REGIONS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-base leading-none" aria-hidden>
                          {item.flag}
                        </span>
                        <span>{item.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[11px] uppercase tracking-wider">
              País
            </Label>
            <Select
              value={nationality}
              disabled={launching}
              onValueChange={(value) => {
                if (!value) return;
                playMenuClick();
                setNationality(value);
              }}
            >
              <SelectTrigger className="h-9 w-full border-white/10 bg-black/35">
                <SelectValue placeholder="Nacionalidad">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-base leading-none" aria-hidden>
                      {nationalityFlag}
                    </span>
                    <span>{nationality}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {NATIONALITIES[region].map((item) => (
                    <SelectItem key={item} value={item}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-base leading-none" aria-hidden>
                          {NATIONALITY_FLAGS[item] ?? "🏳️"}
                        </span>
                        <span>{item}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* role */}
        <div>
          <div className="mb-1.5 flex items-end justify-between gap-3">
            <Label className="text-[11px] uppercase tracking-wider">Rol</Label>
            {selectedRole ? (
              <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                {selectedRole.description}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {ROLES.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.description}
                disabled={launching}
                onMouseEnter={() => {
                  if (launching) return;
                  playMenuClick();
                }}
                onClick={() => setRole(item.id)}
                className={cn(
                  "relative min-h-[5.5rem] overflow-hidden rounded-xl border text-center transition-all hover:-translate-y-0.5 sm:min-h-[6.75rem] disabled:pointer-events-none disabled:opacity-50",
                  role === item.id
                    ? "border-primary shadow-[0_0_24px_rgba(251,191,36,0.22)]"
                    : "border-white/10 hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 bg-cover bg-center opacity-55 transition-opacity"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/25",
                    role === item.id && "from-amber-950/90 via-black/55 to-amber-900/20",
                  )}
                />
                <span className="relative z-10 flex h-full min-h-[5.5rem] flex-col justify-end px-1 py-2 sm:min-h-[6.75rem] sm:px-1.5 sm:py-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary sm:text-[10px]">
                    {item.tag}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold leading-tight drop-shadow sm:text-[12px]">
                    {item.label}
                  </p>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={launching}
            onClick={handleRandom}
            className="w-full border-white/15 bg-black/25"
          >
            Al azar
          </Button>
          <Button
            type="button"
            className="w-full font-bold uppercase tracking-wide"
            size="lg"
            disabled={launching}
            onClick={handleStart}
          >
            {launching ? "Entrando..." : "Empezar carrera"}
          </Button>
        </div>
      </div>
    </div>
  );
}
