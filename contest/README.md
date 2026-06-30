# Focus AI — Daywarden

> Vaqtga asoslangan intizom va odat ilovasi.
> *"Vaqt — eng adolatli o'lchov. Har bir to'lgan jarayon — siz yetib borgan qadam."*

Konkurs ishi · Buyurtmachi: Shamsuddeen · "Just AI It" jamoasi

**Kod (repo):** https://github.com/nazokat777/mvow-ai
**Jonli ilova:** https://daywarden.vercel.app
**Mobil:** Android APK (native, `android/`) + iOS build (`ios/`) — bonus, cross-platform.

---

## Asosiy farq

Boshqa odat ilovalari *"qildim / qilmadim"* deb so'raydi. **Focus AI haqiqiy sarflangan vaqtni** o'lchaydi — taymerni bosasiz, jarayon paneli to'ladi, 100% bo'lganda — g'alaba. Bu — yadro.

## Asosiy funksiyalar

- **Majburiy ekranlar:** onboarding, kirish (mehmon rejimi), bosh ekran (dashboard), odat/maqsad qo'shish (nom·belgi·rang·soat), faol sessiya (taymer + progress ring), profil (til, yorug'/qorong'u).
- **Mustahkam taymer (TZ 4.1):** `setInterval` sanog'iga emas, **timestamp'larga** asoslangan. Ilova yopilsa, sahifa yangilansa yoki telefon uxlasa ham — vaqt aniq qoladi. Manfiy/oshib ketish bo'lmaydi.
- **Offline:** Service Worker bilan internetsiz ham ishlaydi; barcha ma'lumot telefonда (localStorage).
- **3 til:** o'zbek, rus, ingliz.
- **Yorug' / qorong'u** rejim.

## Kreativ funksiyalar (farqlovchi)

- 📵 **Telefon yuztuban = chuqur fokus** — akselerometr orqali aniqlanadi. Sessiya davomida telefonni yuztuban qo'ysangiz, "chuqur fokus" belgisi yonadi. Foydalanuvchini telefondan uzoqlashishga rag'batlantiradi. (Web qila olmaydi — mobil superkuch.)
- 🤖 **AI murabbiy** — kun yakunida sizning natijangizga qarab iliq, shaxsiy motivatsiya (bepul Google Gemini). Kalit bo'lmasa — shablon murabbiy ishlaydi (ilova hech qachon buzilmaydi).
- 📳 **Haptic + ovoz** — har muhim harakatda tebranish va yengil ovoz.
- ⏱️ **Timestamp-taymer** — yuqorida; texnik mustahkamlik.

## Texnologiya

- **Frontend:** Vanilla JS PWA — **0 dependency**, bepul, ochiq. (Flutter/RN kerak emas.)
- **Saqlash:** `localStorage` (offline).
- **AI (ixtiyoriy):** Google Gemini bepul tier.
- **APK:** PWABuilder (yoki Capacitor) bilan PWA → Android APK.

## Ishga tushirish

**Brauzerda (eng oson):**
```
https://daywarden.vercel.app
```

**Lokal:**
```bash
cd docs/v2/preview
python -m http.server 8080
# brauzerda: http://localhost:8080
```

## APK olish (Android)

1. Ilova internetda (`daywarden.vercel.app`).
2. [pwabuilder.com](https://www.pwabuilder.com) ga URL'ni kiriting → **Android** → **Download** → imzolangan APK.

## Testlar (sifat qalqoni)

Dependency yo'q — Node ichki test-runneri:
```bash
node --test "tests/**/*.test.js"
```
**109 test yashil** — biznes-mantiq (taymer, telefon-yuztuban, streak, AI fallback), i18n to'liqligi, har ekran sintaksisi. TDD: test avval, keyin kod.

## Tuzilma

```
docs/v2/preview/   — PWA (ilova)
  ├─ *.html        — ekranlar
  ├─ data.js       — biznes-mantiq (single source of truth)
  ├─ ai-coach.js   — AI murabbiy (Gemini + fallback)
  ├─ ai-config.js  — Gemini kaliti (ixtiyoriy)
  ├─ i18n.js       — 3 til
  └─ service-worker.js — offline
tests/             — 109 test (node:test)
contest/           — konkurs hujjatlari (README, tavsif, demo)
```
