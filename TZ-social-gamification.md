# TZ: Ijtimoiy + Gamifikatsiya moduli
## (Do'stlar · Medallar · Mukofot · Streak)

> Bu texnik topshiriqni boshqa ilova quruvchi AI'ga yoki dasturchiga to'g'ridan-to'g'ri bering.
> FOCUS AI'dagi real, ishlaydigan mantiqqa asoslangan.

---

## Umumiy tamoyillar
- **Offline-first:** hamma narsa avval `localStorage`da ishlaydi; internet bo'lsa bulutga (Supabase yoki shunga o'xshash) sinxronlanadi, bo'lmasa ham to'liq ishlaydi.
- **3 til (i18n):** har bir matn kaliti uz/ru/en'da bo'lsin (aks holda til aralashib ketadi). JS bilan yasalgan matnlarga ham tarjima kaliti bo'lsin.
- **Mustaqil modul:** bu 4 funksiya bir-biriga ulanadi (medal/streak do'stlarga ko'rinadi, tanga mukofotga sarflanadi), lekin asosiy ilovadan ajratilgan bo'lsin.

---

## 1) DO'STLAR (Social)

**Ma'lumot modeli (localStorage):**
- `myCode` — foydalanuvchining shaxsiy kodi. Format: **3 harf + 3 raqam** (masalan `ABC123`), regex `^[A-Z]{3}[0-9]{3}$`. Bir marta generatsiya qilinib, doim saqlanadi.
- `friends` — massiv: `[{ code, role, name }]`
  - `role: 'friend'` — teng do'st (bir-birini ko'radi)
  - `role: 'mentor'` — ustoz/ota-ona (MENI kuzatadi, men uni ham qo'sha olaman)
  - `name` — kod o'rniga ko'rsatiladigan ism (faqat lokalda, ixtiyoriy)
- `vis` — ko'rinish sozlamasi: `{ hours: bool, tasks: bool, notimer: bool }` — do'st/ustoz NIMANI ko'rishini foydalanuvchi o'zi belgilaydi.
- `hidden.<sana>` — o'sha kundagi bekitilgan yozuvlar ro'yxati (do'stga ko'rinmaydi).

**Amallar:**
- **Kod bilan qo'shish:** kod kiritiladi → tekshiriladi (o'zini qo'sha olmaydi, format to'g'ri bo'lsin, takror bo'lmasin) → `friends`ga qo'shiladi.
- **O'chirish / ism berish (rename).**
- **"Siz" bo'limi:** foydalanuvchi o'zi — bosilsa "do'stingiz/ustozingiz aynan NIMANI ko'radi" degan jonli oldindan ko'rish ochiladi + ko'rinish tugmalari (hours/tasks/notimer).
- **Reyting (leaderboard):** do'stlar statistikasi bo'yicha tartiblanadi (masalan fokus soati / sessiya soni).

**Bulut jadvallari (ixtiyoriy, Supabase):**
- `profiles(code, name)` — kod→ism
- `links(follower, target_code, kind)` — kim kimni kuzatadi
- `stats(code, d, ...)` — kunlik ko'rsatkichlar (faqat foydalanuvchi ruxsat bergani sinxronlanadi)
- **Xavfsizlik:** RLS yoqilgan bo'lsin; mahfiy kalitlar (service role) hech qachon klientda bo'lmasin. Bulutga faqat `vis`da ruxsat berilgan maydonlar yuboriladi.

---

## 2) MEDALLAR + DARAJA

**Medallar (ochilish shartlari):**

| Belgi | Nomi | Shart |
|---|---|---|
| 🌱 | Birinchi qadam | sessiya ≥ 1 |
| 🔥 | 10 nur | sessiya ≥ 10 |
| ⭐ | 50 nur | sessiya ≥ 50 |
| 🏆 | 100 nur | sessiya ≥ 100 |
| ⏳ | Marafon | fokus ≥ 10 soat |
| 🎯 | Maqsadli | maqsad ≥ 1 |
| 📅 | 3 kun | streak ≥ 3 |
| 💪 | Temir iroda | streak ≥ 7 |
| 🤝 | Jamoa | do'st ≥ 1 |

- Ochilmagan medal **kulrang** (grayscale) + ustida progress (`cur/need`, masalan `4/10`).
- Ochilgani rangli gradient bilan, "N / 9 medal" hisoblagich.
- Medal ochilganda bayram/animatsiya (konfetti) chiqishi mumkin.

**Daraja (fokus soati bo'yicha):**
- 🥉 Bronza (0) → 🥈 Kumush (10) → 🥇 Oltin (30) → 💠 Platina (70) → 👑 Olmos (150 soat)
- Keyingi darajagacha progress bari: `(hozirgi − pastki chegara) / (yuqori − pastki) × 100%`.
- Eng yuqori darajada: "Eng yuqori daraja! 👑".

---

## 3) TANGA (🪙) + OLMOS (💎) + MUKOFOTLAR

**Iqtisod (localStorage: `coins`, `diamonds`, `diamondsLifetime`):**
- **+1 🪙** — har tugatilgan sessiya/vazifa uchun.
- **+1 💎** — **mukammal kun** (kunning HAMMA vazifasi bajarilsa), kuniga bir marta (`diamondDay` sana bilan qulflanadi — bir kunda faqat bitta olmos).
- `diamondsLifetime` — prestij: sarflansa ham kamaymaydi (umrbod yig'indi).

**Mukofotlar (`rewards` massiv):**
- `[{ id, name, emoji, price, cur: 'coin'|'diamond' }]`
- Standart namunalar: 🎬 "Kino kechasi" — 150 🪙; 📚 "Yangi kitob" — 300 🪙.
- Foydalanuvchi o'z mukofotini qo'sha oladi (nom, emoji, narx, valyuta: tanga yoki olmos).
- **Sotib olish:** balans ≥ narx bo'lsa yashil "Sotib olish" tugmasi → balansdan yechiladi, `rewardsHistory`ga yoziladi. Aks holda "X 🪙 qoldi" (progress bari `bal/price`).
- Mukofot = **haqiqiy o'ziga sovg'a** (real hayotda: kino, kitob, dam). Ilova faqat hisobini yuritadi.

---

## 4) STREAK (ketma-ket kunlar)

- **Ta'rif:** faoliyat bo'lgan ketma-ket kunlar soni.
- **Hisoblash algoritmi:** bugundan orqaga qarab sanaladi; agar bugun hali faoliyat bo'lmasa — kechadan boshlanadi. Har bir "faol kun" = o'sha sanada kamida bitta sessiya (`dateIso`). Kun uzilishi bilan hisob to'xtaydi.
- 🔥 belgisi bilan ko'rsatiladi (`streak ≥ 2` da chiqadi).
- **Streak-freeze YO'Q** — halol, uzilsa noldan boshlanadi (bu qat'iy tanlov, foydalanuvchini aldamaslik uchun).

---

## Umumiy texnik talablar
- Har o'zgarishdan keyin darhol UI yangilanadi (render funksiyasi).
- O'chirishda **undo (bekor qilish)** imkoni bo'lsin (toast bilan).
- Barcha matnlar 3 tilda; JS bilan yasalgan matnlarga ham tarjima kaliti bo'lsin.
- Animatsiya faqat `transform`/`opacity` bilan (silliqlik uchun); `prefers-reduced-motion` hurmat qilinsin.
- Emojilar universal (mascot/gender-neytral); og'ir gradient/`backdrop-filter:blur` fon `position:fixed` elementlarda ishlatilmasin (mobil WebView muzlashi).
- Barcha holat `localStorage`da JSON sifatida; o'qishda `try/catch` va default qiymat bilan himoyalansin (buzilgan data ilovani yiqitmasin).

---

## Ekranlar ro'yxati (minimal)
1. **Do'stlar** — mening kodim, do'st qo'shish, ro'yxat + reyting, "Siz" (ko'rinish sozlamasi).
2. **Sovrinlar/Medallar** — daraja kartasi + medallar to'ri (ochilgan/qulflangan).
3. **Mukofotlar** — balans (🪙/💎), mukofot ro'yxati, qo'shish, sotib olish tarixi.
4. **Streak** — asosiy ekranda 🔥 hisoblagich (alohida ekran shart emas).
