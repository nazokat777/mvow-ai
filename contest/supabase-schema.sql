-- Daywarden — ijtimoiy backend sxemasi (Supabase)
-- Supabase → SQL Editor → New query → shuni joylang → "Run".

-- 1) Profiles: har foydalanuvchi + noyob do'st kodi
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  code text unique not null,
  name text,
  created_at timestamptz default now()
);

-- 2) Kunlik natija: fokus daqiqasi + bajarilgan odatlar (reyting/nazorat manbai)
create table if not exists public.daily_stats (
  user_id uuid references public.profiles(id) on delete cascade,
  d date not null,
  focus_mins int not null default 0,
  habits int not null default 0,
  updated_at timestamptz default now(),
  primary key (user_id, d)
);

-- 3) Bog'lanishlar: do'st (o'zaro musobaqa) yoki ustoz/ota-ona (nazorat)
create table if not exists public.links (
  follower uuid references public.profiles(id) on delete cascade,
  target_code text not null,
  kind text not null check (kind in ('friend','mentor')),
  created_at timestamptz default now(),
  primary key (follower, target_code, kind)
);

-- 4) Chat (2-bosqich): oddiy xabarlar
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  from_user uuid references public.profiles(id) on delete cascade,
  to_code text not null,
  body text not null,
  created_at timestamptz default now()
);

-- ── Row Level Security ──
alter table public.profiles    enable row level security;
alter table public.daily_stats enable row level security;
alter table public.links       enable row level security;
alter table public.messages    enable row level security;

-- Profiles: hamma (kirgan) o'qiydi (kod→foydalanuvchi); faqat o'zinikini yozadi
create policy "profiles_read"   on public.profiles    for select to authenticated using (true);
create policy "profiles_insert" on public.profiles    for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on public.profiles    for update to authenticated using (auth.uid() = id);

-- Kunlik natija: hamma o'qiydi (reyting + nazorat); faqat o'zinikini yozadi
create policy "stats_read"   on public.daily_stats    for select to authenticated using (true);
create policy "stats_insert" on public.daily_stats    for insert to authenticated with check (auth.uid() = user_id);
create policy "stats_update" on public.daily_stats    for update to authenticated using (auth.uid() = user_id);

-- Bog'lanishlar: faqat o'zinikini boshqaradi
create policy "links_all" on public.links for all to authenticated using (auth.uid() = follower) with check (auth.uid() = follower);

-- Chat: yuborgan o'zi yozadi; ishtirokchilar o'qiydi (oddiy MVP: kirganlar o'qiydi)
create policy "messages_read"   on public.messages for select to authenticated using (true);
create policy "messages_insert" on public.messages for insert to authenticated with check (auth.uid() = from_user);

-- Realtime (chat + jonli reyting uchun)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.daily_stats;
