import { SetupForm } from "@/components/game/setup-form";
import { ACTIVE_DUTY } from "@/lib/data/maps";
import { EVENT_COUNT } from "@/lib/game/events";
import { TEAMS } from "@/lib/data/teams";

const FEATURES = [
  {
    title: "Minijuegos reales",
    body: "Flicks, tiempo de reacción, control de spray y defuses a contrarreloj deciden tus clutches.",
  },
  {
    title: "Stats de CS2",
    body: "MR12, rating 2.1, ADR, KAST, HS%, clutches 1vX y aces calculados ronda por ronda.",
  },
  {
    title: "Mercado con sueldos reales",
    body: "Ofertas calculadas sobre presupuestos reales del circuito, con riesgo de banca incluido.",
  },
  {
    title: "Cajas y graffitis",
    body: "Abrí cajas con las probabilidades reales de Valve y ganá graffitis por jugadas icónicas.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 items-center gap-6 overflow-y-auto p-4 lg:overflow-hidden">
      <div className="hidden max-w-sm flex-col gap-4 lg:flex">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
            Counter-Strike 2
          </p>
          <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight">
            De la LAN de
            <br />
            tier 3 al
            <br />
            <span className="text-primary">Major</span>
          </h1>
          <p className="mt-2 text-sm leading-snug text-muted-foreground">
            Elegí tu rol, tu arquetipo y jugate cada decisión. Una carrera
            completa en cinco minutos: scrims, vestuario, mercado de pases y
            finales que se ganan con tu propio aim.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border/60 bg-card/40 p-2.5"
            >
              <p className="text-[12px] font-bold">{feature.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {feature.body}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 border-t border-border/50 pt-3 text-center">
          {[
            { value: TEAMS.length, label: "Orgs reales" },
            { value: ACTIVE_DUTY.length, label: "Mapas Active Duty" },
            { value: `${EVENT_COUNT}+`, label: "Situaciones" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1">
              <p className="text-xl font-black text-primary">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 justify-center">
        <SetupForm />
      </div>
    </div>
  );
}
