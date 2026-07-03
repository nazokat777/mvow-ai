/**
 * FOCUS AI — Do'stlarga MAQTOV push (Duolingo uslubi).
 * Foydalanuvchi 3-7 vazifa bajarganда (klient throttle qiladi) chaqiriladi:
 *   POST { code, name, count, streak }
 * Bu foydalanuvchi bilan bog'langan (do'st/ustoz) hammaga push yuboradi:
 *   "{name} — {count} vazifa bajardi! 🎉"
 * SMS emas (PWA'da imkonsiz) — Web Push (do'st telefonida chiqadi).
 *
 * Vercel ENV: VAPID_PRIVATE (majburiy).
 */
const webpush = require('web-push');

const SB_URL = 'https://lnqgjkcmiyohbfxgbrfx.supabase.co';
const SB_KEY = 'sb_publishable_3JpMzsIiCfPCNnZ0qO73pg_v0ZQYIN0';
// RLS yoqilganda jadvalga kirish uchun service_role (Vercel env). O'rnatilmasa anon (eski holat).
const SRV = process.env.SUPABASE_SERVICE_ROLE || SB_KEY;
const H = { apikey: SRV, Authorization: 'Bearer ' + SRV, 'Content-Type': 'application/json' };
const VAPID_PUBLIC = 'BD2IfPLSgmwOr1EVcio5HMN6he4n8sbuN6dGgYV91tpaXWIK8bJIsrql94uj_rojqmjfyyzBcEA04phCNpINtWo';

async function sbGet(path) {
  const r = await fetch(SB_URL + '/rest/v1/' + path, { headers: H });
  return r.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://daywarden.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }

  const VAPID_PRIVATE = process.env.VAPID_PRIVATE || '';
  if (!VAPID_PRIVATE) { res.status(200).json({ ok: false, reason: 'VAPID_PRIVATE yo\'q' }); return; }

  let c = req.body || {};
  if (typeof c === 'string') { try { c = JSON.parse(c); } catch (e) { c = {}; } }
  const code = String(c.code || '').trim().toUpperCase();
  if (!/^[A-Z]{3}[0-9]{3}$/.test(code)) { res.status(400).json({ ok: false, reason: 'code' }); return; }
  const name = (String(c.name || '').trim().slice(0, 40)) || code;
  const count = parseInt(c.count, 10) || 0;

  webpush.setVapidDetails('mailto:abduazizovanazokat@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

  try {
    // Foydalanuvchi bilan bog'langan kodlar (ikki yo'nalish: u qo'shganlar + uni qo'shganlar)
    const links = await sbGet('links?or=(follower.eq.' + code + ',target_code.eq.' + code + ')&select=follower,target_code');
    const set = {};
    (Array.isArray(links) ? links : []).forEach(function (l) {
      if (l.follower && l.follower !== code) set[l.follower] = 1;
      if (l.target_code && l.target_code !== code) set[l.target_code] = 1;
    });
    const codes = Object.keys(set);
    if (!codes.length) { res.status(200).json({ ok: true, sent: 0, reason: 'no-links' }); return; }

    const subs = await sbGet('push_subs?select=code,endpoint,p256dh,auth&code=in.(' + codes.join(',') + ')');
    const body = count ? (name + ' — ' + count + ' vazifa bajardi! 🎉 Uni qo\'llab-quvvatlang')
      : (name + ' zo\'r ketyapti! 🎉');
    let sent = 0;
    for (const s of (Array.isArray(subs) ? subs : [])) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: 'FOCUS AI', body: body, url: './dostlar.html' })
        );
        sent++;
      } catch (e) {
        if (e && (e.statusCode === 410 || e.statusCode === 404)) {
          try { await fetch(SB_URL + '/rest/v1/push_subs?code=eq.' + encodeURIComponent(s.code), { method: 'DELETE', headers: H }); } catch (e2) {}
        }
      }
    }
    res.status(200).json({ ok: true, sent: sent });
  } catch (e) {
    res.status(200).json({ ok: false, reason: String(e && e.message || e) });
  }
};
