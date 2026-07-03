# Web Push + Xavfsizlik sozlash

> ⚠️ Bu fayl endi web-deploy papkasidan TASHQARIda (repo ildizida) — internetdan o'qib bo'lmaydi.
> Maxfiy kalitlar bu yerga YOZILMAYDI. Ular faqat **Vercel → Environment Variables** da turadi.

## 0. VAPID kalitini ROTATSIYA qilish (BAJARILDI — kod tomoni)
Eski maxfiy kalit ochilib qolgani uchun yangi juftlik yaratildi:
- Yangi **public** kalit kodga yozildi (`push.js`, `api/push-send.js`, `api/praise.js`).
- Yangi **private** kalit → `VAPID_PRIVATE_NEW.txt` (repo ildizida, gitignore — commit qilinmaydi).

**Siz qiladigan ish:**
1. `VAPID_PRIVATE_NEW.txt` faylini oching, ичидаги qatorni nusxalang.
2. Vercel → Settings → Environment Variables → `VAPID_PRIVATE` ni **yangi qiymatga almashtiring** (Production) → Save.
3. Deployments → Redeploy.
4. `VAPID_PRIVATE_NEW.txt` faylini **o'chirib tashlang**.
> Rotatsiyadan keyin eski obunalar yaroqsiz bo'ladi — foydalanuvchilar ilovani ochganda avtomatik qayta obuna bo'ladi.

## 1. Supabase jadvallari (SQL Editor → RUN)
```sql
create table if not exists push_subs (code text primary key, endpoint text not null, p256dh text, auth text, tz int default 300, updated_at timestamptz default now());
create table if not exists reminders (id bigint generated always as identity primary key, code text not null, time text not null, body text not null, last_sent date);

-- XAVFSIZ: RLS YOQILADI (o'chirilmaydi). Bu jadvallarga faqat serverless funksiya (service_role) kiradi,
-- brauzer to'g'ridan-to'g'ri kira olmaydi (push endpoint/auth va shaxsiy eslatma matnlari himoyalanadi).
alter table push_subs enable row level security;
alter table reminders enable row level security;
-- (hech qanday policy qo'shilmaydi = anon bloklanadi)
```

## 2. service_role kaliti → Vercel (push jadvallariga yozish uchun)
Supabase → Settings → API → **service_role** (secret) kalitini nusxalang → Vercel env:
```
SUPABASE_SERVICE_ROLE = <service_role kaliti>   (Production)
```
> Kod avval `SUPABASE_SERVICE_ROLE` ni ishlatadi; o'rnatilmasa anon'ga tushadi (RLS yoqilgan bo'lsa ishlamaydi).
> **Tartib muhim:** avval bu env'ni qo'ying, KEYIN 1-banddagi RLS'ni yoqing.

## 3. push-send himoya kaliti (spam'ни to'xtatish)
Vercel env:
```
PUSH_TICK_SECRET = <o'zingiz o'ylab topgan uzun maxfiy so'z>
```
cron-job.org URL'ini yangilang:
```
https://daywarden.vercel.app/api/push-send?key=<yuqoridagi PUSH_TICK_SECRET>
```
> Bu bo'lmasa istalgan odam push tarqatishni ishga tushira oladi. Kod: kalit o'rnatilsa avtomatik talab qiladi.

## 4. Cron (har 15 daqiqa, bepul)
cron-job.org → Create cronjob → URL (3-banddagi ?key= bilan), Interval: 15 daqiqa.

---

## Chat hardening (ixtiyoriy — `messages` jadvalини yopish)
Hozir `messages` anon bilan HAMMAGA ochiq (istalgan odam barcha shaxsiy chatni o'qiy oladi).
Auth'siz to'liq yechim yo'q, lekin jadvalni yopib faqat funksiya orqali ochish mumkin.
> ✅ `social.js` allaqachon RPC'ni qo'llab-quvvatlaydi (RPC yo'q bo'lsa to'g'ridan-to'g'ri jadvalga tushadi).
> Faqat quyidagi SQL'ni ishga tushiring — chat ishlashда davom etadi (realtime jonli yangilanish o'chadi; xabarlar chat ochilганда yuklanadi).
```sql
alter table public.messages enable row level security;
drop policy if exists "m_all" on public.messages;
create or replace function public.send_msg(p_from text, p_to text, p_body text)
returns void language sql security definer set search_path=public as $$
  insert into public.messages(from_code,to_code,body) values (upper(p_from), upper(p_to), left(p_body,500));
$$;
create or replace function public.get_msgs(p_me text, p_with text)
returns setof public.messages language sql security definer set search_path=public as $$
  select * from public.messages
  where (from_code=upper(p_me) and to_code=upper(p_with)) or (from_code=upper(p_with) and to_code=upper(p_me))
  order by created_at;
$$;
grant execute on function public.send_msg, public.get_msgs to anon;
```
