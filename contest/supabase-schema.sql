-- FOCUS AI ijtimoiy backend (SODDA versiya — auth'siz)
-- Supabase → SQL Editor → joylang → Run. Tamom.

create table if not exists public.profiles (
  code text primary key,
  name text,
  created_at timestamptz default now()
);

create table if not exists public.daily_stats (
  code text not null,
  d date not null,
  focus_mins int not null default 0,
  habits int not null default 0,
  updated_at timestamptz default now(),
  primary key (code, d)
);

create table if not exists public.links (
  follower text not null,
  target_code text not null,
  kind text not null check (kind in ('friend','mentor')),
  created_at timestamptz default now(),
  primary key (follower, target_code, kind)
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  from_code text not null,
  to_code text not null,
  body text not null,
  created_at timestamptz default now()
);

-- RLS: anon kalit bilan ochiq kirish (MVP — fokus statistikasi maxfiy emas)
alter table public.profiles    enable row level security;
alter table public.daily_stats enable row level security;
alter table public.links       enable row level security;
alter table public.messages    enable row level security;

create policy "p_all" on public.profiles    for all to public using (true) with check (true);
create policy "s_all" on public.daily_stats for all to public using (true) with check (true);
create policy "l_all" on public.links       for all to public using (true) with check (true);
create policy "m_all" on public.messages    for all to public using (true) with check (true);

-- Realtime (chat + jonli reyting)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.daily_stats;
