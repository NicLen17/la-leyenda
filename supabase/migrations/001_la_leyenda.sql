-- La Leyenda: careers, daily rankings, profiles

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  display_name text,
  total_careers integer not null default 0,
  best_rating numeric(4,2) not null default 0,
  best_score integer not null default 0,
  achievements text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  nickname text not null,
  role text not null,
  region text not null,
  nationality text not null,
  final_rating numeric(4,2) not null,
  trophies integer not null default 0,
  majors integer not null default 0,
  total_kills integer not null default 0,
  fame integer not null default 0,
  fame_level text not null,
  earnings integer not null default 0,
  years_played integer not null default 1,
  teams_played text[] not null default '{}',
  legend_comparison text not null,
  score integer not null,
  is_daily boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_rankings (
  id uuid primary key default gen_random_uuid(),
  career_id uuid not null references public.careers(id) on delete cascade,
  user_id uuid,
  score integer not null,
  rank_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists careers_score_idx on public.careers (score desc);
create index if not exists careers_created_at_idx on public.careers (created_at desc);
create index if not exists careers_is_daily_idx on public.careers (is_daily, created_at desc);
create index if not exists daily_rankings_date_score_idx on public.daily_rankings (rank_date, score desc);
create index if not exists daily_rankings_career_id_idx on public.daily_rankings (career_id);

alter table public.profiles enable row level security;
alter table public.careers enable row level security;
alter table public.daily_rankings enable row level security;

-- Public read for viral leaderboards; insert open for anon demo play.
create policy "Public read careers"
  on public.careers for select
  using (true);

create policy "Anon insert careers"
  on public.careers for insert
  with check (true);

create policy "Public read daily rankings"
  on public.daily_rankings for select
  using (true);

create policy "Anon insert daily rankings"
  on public.daily_rankings for insert
  with check (true);

create policy "Public read profiles"
  on public.profiles for select
  using (true);

create policy "Anon upsert profiles"
  on public.profiles for insert
  with check (true);
