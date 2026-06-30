/**
 * FOCUS AI — Eslatmalarni yuborish (Web Push). Cron tomonidan chaqiriladi.
 * cron-job.org (yoki Vercel cron) har ~15 daqiqada: GET /api/push-send?key=SECRET
 * Har eslatma vaqti kelganda (foydalanuvchi tz bo'yicha), o'sha kunda 1 marta push yuboradi.
 *
 * Vercel ENV kerak:
 *  - VAPID_PRIVATE   (majburiy) — push imzosi maxfiy kaliti
 *  - PUSH_TICK_SECRET (ixtiyoriy) — endpoint'ni himoyalash uchun ?key=...
 */
const webpush = require('web-push');

const SB_URL = 'https://lnqgjkcmiyohbfxgbrfx.supabase.co';
const SB_KEY = 'sb_publishable_3JpMzsIiCfPCNnZ0qO73pg_v0ZQYIN0';
const H = { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };
const VAPID_PUBLIC = 'BFc-v2pcQydO5oN02JF2zIH_1he1rPuYXg0sAH7qqQ0rXtfJHoCupTEJIr5JU8CuE4-_rnNmAiq3j9jndB7Wv4g';
const WINDOW_MIN = 30; // eslatma vaqtidan keyin shu daqiqa ichida yuboriladi (cron oralig'idan katta bo'lsin)

async function sbGet(path) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, { headers: H });
  return r.json();
}

module.exports = async (req, res) => {
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE || '';
  if (!VAPID_PRIVATE) { res.status(200).json({ ok: false, reason: 'VAPID_PRIVATE Vercel ENV yo\'q' }); return; }
  const secret = process.env.PUSH_TICK_SECRET || '';
  if (secret && ((req.query && req.query.key) || '') !== secret) { res.status(403).json({ ok: false }); return; }

  webpush.setVapidDetails('mailto:abduazizovanazokat@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

  try {
    const subs = await sbGet('push_subs?select=code,endpoint,p256dh,auth,tz');
    const rems = await sbGet('reminders?select=code,time,body,last_sent');
    const byCode = {};
    (Array.isArray(subs) ? subs : []).forEach(s => { byCode[s.code] = s; });
    const nowUtc = Date.now();
    let sent = 0, checked = 0;

    for (const r of (Array.isArray(rems) ? rems : [])) {
      const s = byCode[r.code];
      if (!s) continue;
      const tz = (typeof s.tz === 'number') ? s.tz : 300;
      const local = new Date(nowUtc + tz * 60000);
      const nowMin = local.getUTCHours() * 60 + local.getUTCMinutes();
      const today = local.toISOString().slice(0, 10);
      const m = String(r.time || '').match(/^(\d{1,2}):(\d{2})$/);
      if (!m) continue;
      const remMin = (+m[1]) * 60 + (+m[2]);
      checked++;
      if (nowMin < remMin || nowMin > remMin + WINDOW_MIN) continue; // vaqti emas
      if (r.last_sent === today) continue;                            // bugun yuborilgan
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: 'FOCUS AI', body: r.body, url: './home.html' })
        );
        await fetch(SB_URL + '/rest/v1/reminders?code=eq.' + encodeURIComponent(r.code) + '&time=eq.' + encodeURIComponent(r.time), {
          method: 'PATCH', headers: H, body: JSON.stringify({ last_sent: today })
        });
        sent++;
      } catch (e) {
        // o'lik obuna (410/404) — o'chiramiz
        if (e && (e.statusCode === 410 || e.statusCode === 404)) {
          try { await fetch(SB_URL + '/rest/v1/push_subs?code=eq.' + encodeURIComponent(r.code), { method: 'DELETE', headers: H }); } catch (e2) {}
        }
      }
    }
    res.status(200).json({ ok: true, sent: sent, checked: checked });
  } catch (e) {
    res.status(200).json({ ok: false, reason: String(e && e.message || e) });
  }
};
