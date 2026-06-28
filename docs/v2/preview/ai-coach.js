'use strict';
/**
 * Daywarden — AI murabbiy (intizom do'sti).
 * coach(ctx, {apiKey}) → kun yakuni uchun iliq, shaxsiy xabar.
 * Kalit bo'lsa — Gemini (bepul tier). Bo'lmasa/xatoda — fallback (shablon).
 * Shuning uchun ilova HECH QACHON buzilmaydi va pul ketmaydi.
 * UMD: Node (test) + brauzer (window.AICoach).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.AICoach = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  function fallbackMessage(c) {
    c = c || {};
    var done = c.done || 0, total = c.total || 0, streak = c.streak || 0;
    if (total === 0) return 'Bugun reja yo\'q edi. Ertaga bitta kichik maqsad qo\'ying — kichik qadam ham qadam.';
    var pct = (c.pct != null) ? c.pct : Math.round(done / total * 100);
    if (pct >= 100) return 'Zo\'r! Bugun ' + done + ' ishning hammasi bajarildi' + (streak > 1 ? ' — ' + streak + ' kun ketma-ket 🔥' : '') + '. Shu sur\'atda davom eting.';
    if (pct >= 50) return done + '/' + total + ' bajarildi — yaxshi kun. Qolganini ertaga ulaymiz, siz uddalaysiz.';
    if (pct > 0) return 'Boshlash eng qiyini edi — siz ' + done + ' ishni bajardingiz. Ertaga yana bir qadam tashlaymiz.';
    return 'Bugun og\'ir bo\'ldi, lekin taslim bo\'lmadingiz. Ertaga bitta kichik ishdan boshlang — men yoningizdaman.';
  }

  function buildPrompt(c) {
    c = c || {};
    return "Sen foydalanuvchining intizom do'stisan — iliq, do'stona mentor, hurmat bilan 'siz' shaklida gaplashasan. "
      + 'Bugungi natija: ' + (c.done || 0) + '/' + (c.total || 0) + ' vazifa bajarilgan, '
      + (c.focusH || 0) + ' soat fokus, streak ' + (c.streak || 0) + ' kun. '
      + "O'zbek tilida QISQA (1-2 jumla), iliq, rag'batlantiruvchi xabar yoz. "
      + 'Jazolamasdan qo\'llab-quvvatla. Faqat xabarning o\'zini yoz, izohsiz.';
  }

  function coach(c, opts) {
    // Kalit serverда yashirin — /api/coach proksisi orqali. Klientда kalit YO'Q.
    // Proksi bo'sh qaytarsa (kalit yo'q) yoki xato/offline bo'lsa — shablon (fallback).
    return fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c || {})
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { return (d && d.message && d.message.trim()) ? d.message.trim() : fallbackMessage(c); })
      .catch(function () { return fallbackMessage(c); });
  }

  return { fallbackMessage: fallbackMessage, buildPrompt: buildPrompt, coach: coach };
});
