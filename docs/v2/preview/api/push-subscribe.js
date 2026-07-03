/**
 * FOCUS AI — Push obunani + eslatmalarni saqlash (Supabase).
 * POST { code, subscription:{endpoint, keys:{p256dh, auth}}, reminders:[{time, body}], tz }
 *  - code     : foydalanuvchi qurilma kodi (Social.myCode)
 *  - tz       : UTC offset daqiqada (UZB = 300)
 *  - reminders: [{ time:"HH:MM", body:"..." }] — har sync'da to'liq almashtiriladi
 * Maxfiy kalit YO'Q (publishable anon kalit; jadvallar RLS o'chirilgan — SETUP-PUSH.md).
 */
const SB_URL = 'https://lnqgjkcmiyohbfxgbrfx.supabase.co';
const SB_KEY = 'sb_publishable_3JpMzsIiCfPCNnZ0qO73pg_v0ZQYIN0';
// RLS yoqilganda jadvalga yozish/o'qish uchun service_role (Vercel env). O'rnatilmasa anon (eski xatti-harakat, buzilmaydi).
const SRV = process.env.SUPABASE_SERVICE_ROLE || SB_KEY;
const H = { apikey: SRV, Authorization: 'Bearer ' + SRV, 'Content-Type': 'application/json' };

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://daywarden.vercel.app');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }

  let c = req.body || {};
  if (typeof c === 'string') { try { c = JSON.parse(c); } catch (e) { c = {}; } }
  const code = String(c.code || '').trim();
  const sub = c.subscription;
  const tz = (typeof c.tz === 'number') ? c.tz : 300;
  if (!code || !sub || !sub.endpoint) {
    res.status(400).json({ ok: false, reason: 'code va subscription kerak' });
    return;
  }

  try {
    // 1) Obunani upsert (PK = code)
    await fetch(SB_URL + '/rest/v1/push_subs?on_conflict=code', {
      method: 'POST',
      headers: Object.assign({}, H, { Prefer: 'resolution=merge-duplicates' }),
      body: JSON.stringify([{
        code: code,
        endpoint: sub.endpoint,
        p256dh: (sub.keys && sub.keys.p256dh) || '',
        auth: (sub.keys && sub.keys.auth) || '',
        tz: tz
      }])
    });
    // 2) Shu kod uchun eslatmalarni almashtirish (delete + insert)
    await fetch(SB_URL + '/rest/v1/reminders?code=eq.' + encodeURIComponent(code), { method: 'DELETE', headers: H });
    const rems = Array.isArray(c.reminders) ? c.reminders.filter(r => r && r.time && r.body) : [];
    if (rems.length) {
      await fetch(SB_URL + '/rest/v1/reminders', {
        method: 'POST',
        headers: H,
        body: JSON.stringify(rems.map(r => ({ code: code, time: String(r.time), body: String(r.body).slice(0, 200) })))
      });
    }
    res.status(200).json({ ok: true, count: rems.length });
  } catch (e) {
    res.status(200).json({ ok: false, reason: String(e && e.message || e) });
  }
};
