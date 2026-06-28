/**
 * Vercel serverless funksiya — AI murabbiy proksisi.
 * Gemini kaliti FAQAT shu yerda (process.env.GEMINI_KEY) — ilovada/kodда ko'rinmaydi.
 * Klient {done,total,focusH,streak,pct} yuboradi; server prompt yasab, Gemini'ga so'rab,
 * faqat tayyor xabarni qaytaradi. Kalit yo'q/xato bo'lsa — bo'sh qaytaradi (klient shablonga o'tadi).
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(200).json({ message: '' }); return; }

  const key = process.env.GEMINI_KEY;
  if (!key) { res.status(200).json({ message: '' }); return; } // env kalit yo'q → shablon

  try {
    let c = req.body || {};
    if (typeof c === 'string') { try { c = JSON.parse(c); } catch (e) { c = {}; } }

    const prompt =
      "Sen foydalanuvchining intizom do'stisan — iliq, do'stona mentor, hurmat bilan 'siz' shaklida gaplashasan. " +
      'Bugungi natija: ' + (c.done || 0) + '/' + (c.total || 0) + ' vazifa bajarilgan, ' +
      (c.focusH || 0) + ' soat fokus, streak ' + (c.streak || 0) + ' kun. ' +
      "O'zbek tilida QISQA (1-2 jumla), iliq, rag'batlantiruvchi xabar yoz. " +
      "Jazolamasdan qo'llab-quvvatla. Faqat xabarning o'zini yoz, izohsiz.";

    const gr = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    const d = await gr.json();
    const t = d && d.candidates && d.candidates[0] && d.candidates[0].content &&
      d.candidates[0].content.parts && d.candidates[0].content.parts[0] && d.candidates[0].content.parts[0].text;
    res.status(200).json({ message: (t || '').trim() });
  } catch (e) {
    res.status(200).json({ message: '' });
  }
};
