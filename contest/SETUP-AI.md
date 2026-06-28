# AI murabbiyni yoqish (kalit serverda yashirin)

AI murabbiy `/api/coach` serverless funksiyasi orqali ishlaydi. Gemini kaliti **faqat Vercel serverida** (`GEMINI_KEY` env variable) — ilova kodida hech qachon ko'rinmaydi.

> Kalit qo'shilmasa ham ilova ishlaydi — AI murabbiy aqlli **shablon** xabarlar beradi (natijaga moslashgan). Kalit qo'shilsa — haqiqiy Gemini yonadi.

## Qadamlar

**1. Yangi kalit yarating** (eski'si suhbatда ko'ringani uchun)
- `aistudio.google.com/apikey` → eski kalit yonida **"Delete key"** → keyin **"Create API key"** → yangi kalitni nusxa oling.

**2. Vercel'ga kalitni qo'ying**
- `vercel.com` ga kiring → loyihangiz (**mvow-ai** / daywarden).
- **Settings** → **Environment Variables**.
- Yangi o'zgaruvchi qo'shing:
  - **Key (Name):** `GEMINI_KEY`
  - **Value:** yangi Gemini kalitingiz
  - **Environments:** Production (va Preview) belgilang
  - **Save**.

**3. Qayta deploy**
- **Deployments** → eng yuqoridagi yonida **⋯** → **Redeploy** (yoki keyingi `git push` avtomatik deploy qiladi).

**4. Tekshirish**
- `daywarden.vercel.app/kechqurun.html` ni oching.
- AI murabbiy xabari shablondan farqli, "tirik" chiqsa — Gemini ishlayapti ✅.
- Chiqmasa — shablon ko'rinadi (ilova baribir ishlaydi); env variable to'g'ri yozilganini tekshiring.

## Texnik

- Server: `docs/v2/preview/api/coach.js` (Vercel serverless, CommonJS, global `fetch`).
- Klient: `ai-coach.js` → `POST /api/coach` (kalitsiz) → xabar yoki shablon.
- Klient faqat statistika ({done,total,focusH,streak,pct}) yuboradi; prompt serverда yasaladi (kalit + so'rov serverда).
