# La Leyenda — Counter-Strike Career Simulator

Simulador web de carrera inspirado en *El Ídolo*: partidas cortas, decisiones con impacto y un resumen shareable al retirarte.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (opcional) para rankings diarios y persistencia
- Motor de juego 100% client-side

## Scripts

```bash
npm install
npm run dev
npm run build
npm start
```

## Configurar Supabase (opcional)

1. Copiá `.env.example` a `.env.local`
2. Completá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Corré la migración en [`supabase/migrations/001_la_leyenda.sql`](supabase/migrations/001_la_leyenda.sql)

Sin Supabase, el juego funciona igual y guarda carreras/rankings en `localStorage`.

## Rutas

- `/` — setup de carrera + daily challenge
- `/play` — loop de eventos / splits / retiro
- `/ranking` — leaderboard del día
- `/profile` — historial local de carreras

## Gameplay

1. Elegí nick, región, nacionalidad y rol (Entry / AWP / IGL)
2. Resolvé eventos narrativos (200+)
3. Cada split cierra con un bloque de torneos simulado
4. Retirate y compará tu carrera con leyendas (s1mple, ZywOo, device, etc.)
