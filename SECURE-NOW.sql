-- ============================================================
-- FOCUS AI — RLS xavfsizlik (bir marta ishga tushiring)
-- Supabase -> SQL Editor -> New query -> BU FAYLNI joylashtiring -> RUN
--
-- ⚠️ TARTIB MUHIM: AVVAL Vercel'ga SUPABASE_SERVICE_ROLE + PUSH_TICK_SECRET
-- qo'ying va Redeploy qiling. KEYIN bu SQL'ni ishga tushiring.
-- (Aks holda push vaqtincha ishlamay qoladi.)
-- ============================================================

-- 1) push_subs + reminders: faqat server (service_role) kiradi; brauzer O'QIMAYDI
--    (push endpoint/kalit va shaxsiy eslatma matnlari himoyalanadi)
alter table public.push_subs  enable row level security;
alter table public.reminders  enable row level security;
-- (hech qanday policy qo'shilmaydi = anon bloklanadi; serverless funksiya service_role bilan ishlaydi)

-- 2) messages (shaxsiy chat): jadval yopiladi, faqat RPC orqali
--    (social.js allaqachon send_msg/get_msgs RPC'ni qo'llab-quvvatlaydi)
alter table public.messages enable row level security;
drop policy if exists "m_all" on public.messages;

create or replace function public.send_msg(p_from text, p_to text, p_body text)
returns void language sql security definer set search_path = public as $$
  insert into public.messages (from_code, to_code, body)
  values (upper(p_from), upper(p_to), left(p_body, 500));
$$;

create or replace function public.get_msgs(p_me text, p_with text)
returns setof public.messages language sql security definer set search_path = public as $$
  select * from public.messages
  where (from_code = upper(p_me)   and to_code = upper(p_with))
     or (from_code = upper(p_with) and to_code = upper(p_me))
  order by created_at;
$$;

grant execute on function public.send_msg(text, text, text) to anon;
grant execute on function public.get_msgs(text, text)       to anon;

-- Eslatma: daily_stats / links / profiles reyting uchun anon o'qishni talab qiladi —
-- ularni to'liq yopish uchun Supabase anonim Auth kerak (keyingi bosqich).
