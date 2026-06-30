/**
 * Vercel serverless funksiya — AI proksisi (2 rejim).
 * Gemini kaliti FAQAT shu yerda (process.env.GEMINI_KEY) — ilovada/kodда ko'rinmaydi.
 *  - mode yo'q  → kun yakuni motivatsiyasi  → { message }
 *  - mode:'plan' → maqsadni bosqichlarga bo'lish → { steps: [...] }
 * Kalit yo'q/xato → bo'sh qaytaradi (klient shablonga/fallback'ga o'tadi).
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // Kalit — bir nechta keng tarqalgan nom qabul qilinadi (nom xatosiga chidamli)
  const key = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY
    || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  // Diagnostika: GET → kalit o'rnatilganmi? (kalitning O'ZI hech qachon qaytmaydi)
  if (req.method === 'GET') { res.status(200).json({ keySet: !!key, fn: 'v2' }); return; }
  if (req.method !== 'POST') { res.status(200).json({ message: '' }); return; }

  let c = req.body || {};
  if (typeof c === 'string') { try { c = JSON.parse(c); } catch (e) { c = {}; } }

  let _dbg = null;
  async function gemini(prompt) {
    const gr = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    const d = await gr.json();
    _dbg = { status: gr.status, body: d };
    return (d && d.candidates && d.candidates[0] && d.candidates[0].content &&
      d.candidates[0].content.parts && d.candidates[0].content.parts[0] && d.candidates[0].content.parts[0].text) || '';
  }

  // ── Maqsadni bosqichlarga bo'lish (AI rejalashtiruvchi) ──
  if (c.mode === 'plan') {
    if (!key) { res.status(200).json({ steps: [] }); return; }
    try {
      const langName = ({ uz: "o'zbek", ru: 'rus', en: 'ingliz' })[c.lang] || "o'zbek";
      const prompt = 'Foydalanuvchi maqsadi: "' + (c.goal || '') + '", muddat: ' + (c.duration || "1 oy") + '. '
        + "Bu maqsadga erishish uchun KETMA-KET, aniq, bajariladigan 5-6 ta KICHIK BOSQICH yoz. "
        + "Har bosqich qisqa (3-6 so'z), " + langName + " tilida. "
        + "Faqat bosqichlarni yoz — har birini yangi qatordan, raqamsiz va izohsiz.";
      const t = await gemini(prompt);
      const steps = (t || '').split('\n').map(function (s) { return s.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim(); }).filter(Boolean).slice(0, 7);
      res.status(200).json(c.debug ? { steps: steps, _dbg: _dbg } : { steps: steps });
    } catch (e) { res.status(200).json(c.debug ? { steps: [], _err: String(e && e.message || e), _dbg: _dbg } : { steps: [] }); }
    return;
  }

  // ── Kun yakuni motivatsiyasi ──
  if (!key) { res.status(200).json({ message: '' }); return; }
  try {
    const prompt =
      "Sen foydalanuvchining intizom do'stisan — iliq, do'stona mentor, hurmat bilan 'siz' shaklida gaplashasan. " +
      'Bugungi natija: ' + (c.done || 0) + '/' + (c.total || 0) + ' vazifa bajarilgan, ' +
      (c.focusH || 0) + ' soat fokus, streak ' + (c.streak || 0) + ' kun. ' +
      "O'zbek tilida QISQA (1-2 jumla), iliq, rag'batlantiruvchi xabar yoz. " +
      "Jazolamasdan qo'llab-quvvatla. Faqat xabarning o'zini yoz, izohsiz.";
    const t = await gemini(prompt);
    res.status(200).json({ message: (t || '').trim() });
  } catch (e) {
    res.status(200).json({ message: '' });
  }
};
