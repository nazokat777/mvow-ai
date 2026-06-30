# Web Push eslatmalari — sozlash (1 marta, ~10 daqiqa)

## 1. Supabase jadvallari  (SQL Editor -> RUN)
create table if not exists push_subs (code text primary key, endpoint text not null, p256dh text, auth text, tz int default 300, updated_at timestamptz default now());
create table if not exists reminders (id bigint generated always as identity primary key, code text not null, time text not null, body text not null, last_sent date);
alter table push_subs disable row level security;
alter table reminders disable row level security;

## 2. VAPID maxfiy kalit -> Vercel (Gemini kabi)
Vercel -> Settings -> Environment Variables -> Add:
  VAPID_PRIVATE = RjbbelW02CPn9nZOZnskJqQ12gPpKv-VmYfm3K2ZAJQ
  (Environment: Production)  -> Save -> Deployments -> Redeploy

## 3. Cron (har 15 daqiqa, bepul)
cron-job.org -> Create cronjob:
  URL: https://daywarden.vercel.app/api/push-send
  Interval: 15 daqiqa
