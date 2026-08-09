# FOCUS AI — App Store'ga chiqish

Play Market qo'llanmasi: [PLAYSTORE.md](PLAYSTORE.md). Bu — iOS uchun.

**Tanlangan yo'l:** gibrid — PWA ilova ichida ishlaydi, ustiga haqiqiy native
qismlar qo'shiladi (bildirishnoma, uy ekrani widgeti, Screen Time qulfi, Apple
obunasi). Sabab pastda, "Nega sof veb-o'ram bo'lmaydi" bo'limida.

---

## 0. Eng muhim farq: Apple Google emas

Play Market'ga ilova **TWA** (saytni o'ragan qobiq) sifatida chiqdi va o'tdi.
App Store'da bu **o'tmaydi**. Apple'ning **4.2 "Minimum Functionality"** qoidasi
shunchaki saytni o'ragan ilovalarni rad etadi.

Shuning uchun iOS ilovasiga native qiymat qo'shiladi — quyida ro'yxat bor.

---

## 1. Akkaunt: Apple Developer Program

| | |
|---|---|
| Narx | **$99 / yil** (har yili qayta to'lanadi; Google'da $25 bir marta edi) |
| Qayerda | https://developer.apple.com/programs/ yoki iPhone'dagi **Apple Developer** ilovasi |
| Kerak | 2FA yoqilgan Apple ID, shaxsni tasdiqlovchi hujjat, xalqaro to'lov kartasi |
| Muddat | Odatda 1–2 kun; ba'zan uzoqroq |

**Individual (shaxsiy) yoki Organization (tashkilot)?**

- **Individual** — tezroq, D-U-N-S raqami kerak emas. App Store'da sotuvchi nomi
  sizning ismingiz bo'ladi.
- **Organization** — "Just AI It" nomi ko'rinadi, lekin **D-U-N-S raqami** kerak
  (bepul, ammo olish 1–2 hafta ketishi mumkin) va yuridik shaxs talab qilinadi.

Tavsiya: **Individual** bilan boshlang. Play'da ham "Nazokat" shaxsiy akkaunti
ishlatilgan — bir xil bo'ladi. Keyinchalik tashkilotga o'tkazish mumkin.

**To'lov haqida ogohlantirish:** O'zbekiston kartalari bilan Apple to'lovi ba'zan
rad etiladi. Play'dagi $25 to'lovi qaysi karta bilan o'tgan bo'lsa, avval o'shani
sinang. Rad etilsa: dollarli xalqaro karta (Visa/Mastercard) yoki
`Apple ID → To'lov usuli` ni oldindan tekshirib qo'ying.

**Diqqat:** Play akkauntida bo'lgani kabi, manzil va ism hujjatga **aynan** mos
bo'lsin — Play'da aynan shu narsa haftalab vaqt yegan edi
(vaqtinchalik propiska muddati tugagani sababli).

---

## 2. Akkaunt ochilgach — mendan nima kerak

Ro'yxatdan o'tgach menga faqat **bitta narsa** kerak: **App Store Connect API kaliti**.
U bilan build bulutdan avtomatik yuklanadi va **Mac sotib olish shart emas**.

Olish yo'li: App Store Connect → **Users and Access** → **Integrations** →
**App Store Connect API** → **+** → Access: `App Manager`.

Uch narsa chiqadi:

| Nima | Qayerda |
|---|---|
| `.p8` kalit fayli | Bir marta yuklanadi — **yo'qotmang** |
| Key ID | Kalit yonida |
| Issuer ID | Sahifa tepasida |

Bularni GitHub'ga **secret** sifatida qo'yamiz (kod ichiga YOZILMAYDI):
`APPSTORE_KEY_P8`, `APPSTORE_KEY_ID`, `APPSTORE_ISSUER_ID`.

⚠️ `.p8` faylini chatga tashlamang — GitHub secret oynasiga to'g'ridan-to'g'ri
qo'ying. Play keystore paroli bilan bir marta shunday xato bo'lgan
(log'ga tushib ketgan edi).

---

## 3. Ilovaning texnik tomoni (men qilaman)

Bulutli macOS serverida yig'iladi — Mac kerak emas, xuddi Play'dagi kabi.

- [x] iOS ilova qobig'i (Capacitor) — PWA ilova ichida ishlaydi
- [x] Bulutli build (GitHub Actions, macOS) — imzosiz kompilyatsiya tasdig'i
- [ ] Native bildirishnomalar (eslatmalar internetsiz ham ishlaydi)
- [ ] Uy ekrani widgeti (WidgetKit) — Android'dagisi kabi
- [ ] Screen Time qulfi (ilovalarni bloklash)
- [ ] Apple obunasi (StoreKit 2) — 7 kun bepul sinov
- [ ] Imzolangan build + App Store Connect'ga avtomatik yuklash

---

## 4. Screen Time (ilova qulflash) — alohida ariza

Ilovangizning asosiy funksiyasi — boshqa ilovalarni qulflash. iOS'da bu
**FamilyControls** ruxsatini talab qiladi va Apple uni **avtomatik bermaydi**:
alohida ariza to'ldirib, nima uchun kerakligini tushuntirish kerak.

- Ariza: https://developer.apple.com/contact/request/family-controls-distribution
- Javob bir necha hafta kutishi mumkin — **akkaunt ochilishi bilanoq yuboring**,
  qolgan ish parallel ketaveradi.
- Ruxsat berilmasa: ilova qulflash o'rniga "yumshoq" rejim qoladi
  (eslatma + hisobot), Android'dagi qattiq qulf iOS'da bo'lmaydi.

iOS Android'dan **kamroq** narsaga ruxsat beradi:

| | Android | iOS |
|---|---|---|
| Ilova ochilganini sezish | ✅ | ❌ |
| Ilovani bloklash | ✅ o'z ekranimiz bilan | ⚠️ faqat Apple'ning tizim ekrani |
| O'chirishni taqiqlash | ✅ | ❌ |

---

## 5. Obuna — Apple IAP majburiy

Play'da tanlangan model (bepul yuklab olish + 7 kun sinov → obuna) iOS'da ham
ishlaydi, **lekin** to'lov faqat Apple orqali o'tishi shart:

- Apple ulushi: birinchi yil **30%**, obunachi 1 yildan oshsa **15%**
- Tashqi to'lov havolasi qo'yish — **rad etish sababi**
- Bank/soliq ma'lumotlari App Store Connect → **Agreements, Tax, and Banking** da

---

## 6. Nega sof veb-o'ram bo'lmaydi

Apple 4.2 qoidasi: ilova saytdan farq qilmasa — rad etiladi. Gibrid yo'l aynan
shuni hal qiladi: ichida PWA ishlaydi, lekin ustida faqat ilovada bo'ladigan
narsalar bor (widget, bildirishnoma, Screen Time, Apple obunasi). Shu bilan birga
kod bazasi bitta qoladi — har yangilikni ikki marta yozish shart emas.

---

## 7. Tartib (qisqacha)

1. **Siz:** Apple Developer Program — $99, Individual
2. **Siz:** akkaunt ochilishi bilan FamilyControls arizasini yuboring (uzoq kutiladi)
3. **Siz:** App Store Connect API kaliti → GitHub secret
4. **Men:** native qismlar (bildirishnoma, widget, Screen Time, obuna)
5. **Men:** imzolangan build → TestFlight
6. **Siz + men:** App Store listing (matn/rasm — Play uchun tayyorlari qayta ishlatiladi)
7. **Yuborish** → Apple ko'rigi (odatda 1–3 kun)
