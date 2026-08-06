"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ROLES } from "@/lib/data/archetypes";
import { NATIONALITIES, REGIONS } from "@/lib/game/constants";
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

export function SetupForm() {
  const router = useRouter();

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

  function start(setup: CareerSetup) {
    const parsed = setupSchema.safeParse(setup);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }
    saveSetup(parsed.data);
    router.push("/play");
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
    const random = getRandomSetup();
    setRegion(random.region);
    setNationality(random.nationality);
    setRole(random.role);
    setNickname(random.nickname);
    toast.message("Arranque al azar listo");
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      {/* daily challenge */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent p-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">
            Carrera del día · cambia en {countdown}
          </p>
          <p className="truncate text-sm font-bold">
            {daily
              ? `${daily.nationality} · ${ROLES.find((entry) => entry.id === daily.role)?.label} · nick ${daily.nickname}`
              : "Cargando el desafío de hoy..."}
          </p>
        </div>
        <Button
          size="sm"
          disabled={!daily}
          className="shrink-0 bg-amber-500 text-black hover:bg-amber-400"
          onClick={() =>
            daily &&
            start({ ...daily, nickname: nickname.trim() || daily.nickname })
          }
        >
          Jugar la del día
        </Button>
      </div>

      {/* identity */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nickname" className="text-[11px] uppercase tracking-wider">
            Tu nick
          </Label>
          <Input
            id="nickname"
            placeholder="s1mple"
            value={nickname}
            maxLength={16}
            onChange={(event) => setNickname(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] uppercase tracking-wider">Región</Label>
          <Select
            value={region}
            onValueChange={(value) => {
              if (!value) return;
              const next = value as Region;
              setRegion(next);
              setNationality(NATIONALITIES[next][0]);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Región" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {REGIONS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.flag} {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-[11px] uppercase tracking-wider">
            Nacionalidad
          </Label>
          <Select
            value={nationality}
            onValueChange={(value) => value && setNationality(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Nacionalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {NATIONALITIES[region].map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* role */}
      <div>
        <Label className="mb-1.5 block text-[11px] uppercase tracking-wider">
          Tu rol en el server
        </Label>
        <div className="grid gap-2 sm:grid-cols-5">
          {ROLES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRole(item.id)}
              className={cn(
                "rounded-lg border p-2 text-left transition-all hover:-translate-y-0.5",
                role === item.id
                  ? "border-primary bg-primary/15"
                  : "border-border/60 bg-card/40 hover:border-primary/50",
              )}
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
                {item.tag}
              </p>
              <p className="text-[13px] font-bold leading-tight">{item.label}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={handleRandom}>
          🎲 Al azar
        </Button>
        <Button type="button" className="flex-1" size="lg" onClick={handleStart}>
          Empezar mi carrera
        </Button>
      </div>
    </div>
  );
}
