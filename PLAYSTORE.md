# FOCUS AI — Google Play'ga chiqarish qo'llanmasi

Bu ilova PWA (daywarden.vercel.app) + TWA (Android o'ram, Bubblewrap). Quyida Play Console uchun barcha kerakli narsa.

## 0) Asosiy ma'lumot
- **Package name (o'zgarmaydi):** `com.justaiit.daywarden.twa`
- **Versiya:** appVersionName `1.0.0`, appVersionCode `1` (`twa/twa-manifest.json`da)
- **Domen:** daywarden.vercel.app
- **Privacy policy URL:** https://daywarden.vercel.app/privacy.html
- **$25:** bir martalik to'lov, keyin cheksiz ilova qo'yasiz.

## 1) DOIMIY imzo kaliti (ENG MUHIM — bir marta)
Har build yangi kalit yaratmasligi kerak, aks holda Play'da ilovani yangilab bo'lmaydi.
1. GitHub → **Actions** → **keystore-gen** → **Run workflow** (parolni bo'sh qoldiring — avtomatik yaratiladi).
2. Tugagach, o'sha run → **Artifacts** → `focusai-keystore` ni yuklab oling va **XAVFSIZ saqlang** (yo'qotmang!).
3. Run **log**idagi qiymatlarni GitHub → **Settings → Secrets and variables → Actions → New secret**:
   - `ANDROID_KEYSTORE_PASSWORD` = log'dagi parol
   - `ANDROID_KEYSTORE_B64` = `keystore.b64` artifaktidagi matn
4. SHA-256 (UPLOAD) ni eslab qoling (log'da).

## 2) AAB yasash (Play fayli)
GitHub → **Actions** → **Android (TWA) — APK + AAB** → **Run workflow**.
Tugagach: **Releases → apk-latest** dan `app-release-bundle.aab` ni yuklab oling. (Sinov uchun `.apk` ham bor.)

## 3) Play Console
1. https://play.google.com/console — akkaunt ochiladi ($25).
2. **Create app** → nomi "FOCUS AI", til uzbek, ilova (app), bepul (free).
3. **Production → Create release** → `app-release-bundle.aab` ni yuklang.
   - Google **Play App Signing** avtomatik yoqiladi (tavsiya) — Google o'z imzo kalitini yaratadi.
4. **App integrity → App signing key certificate → SHA-256** ni nusxalang.

## 4) assetlinks.json (URL chizig'ini yashirish)
`docs/v2/preview/.well-known/assetlinks.json` faylida:
- `REPLACE_WITH_PLAY_APP_SIGNING_SHA256` → 3-bosqichdagi Play SHA-256
- `REPLACE_WITH_UPLOAD_KEY_SHA256` → 1-bosqichdagi UPLOAD SHA-256
Keyin commit → push (Vercel deploy qiladi). Tekshirish: https://daywarden.vercel.app/.well-known/assetlinks.json ochilsin.
(SHA-256 ni `AA:BB:CC...` formatida qoldiring.)

## 5) Store listing (do'kon sahifasi)
**Nom (≤30):** FOCUS AI — intizom do'sti
**Qisqa tavsif (≤80):** Maqsadlaringizga intizom bilan yeting: AI murabbiy, fokus taymer, odatlar.
**To'liq tavsif:**
> FOCUS AI — sizning intizom do'stingiz. Katta maqsadlarni kunlik kichik odatlarga bo'lib, ularni bajarishga yordam beradi.
>
> • AI murabbiy — har kun iliq, shaxsiy rag'bat.
> • Fokus taymer (oddiy + Pomodoro) — chalg'imasdan ishlang.
> • Kunlik odatlar va maqsadlar — reja avtomatik tuziladi.
> • Do'st/ustoz/ota-ona bilan intizom musobaqasi (ixtiyoriy).
> • Tanga va olmos — bajarilgan ish uchun mukofot; AI kino/kitob tavsiyasi.
> • Uyqu nazorati, hisobot, shaxsiy shahar.
>
> Jazolamaydi — qo'llab-quvvatlaydi. Intizom — erkinlik yo'li.

**Ruscha nom:** FOCUS AI — друг дисциплины
**Ruscha qisqa:** Достигайте целей с дисциплиной: AI-коуч, фокус-таймер, привычки.
**Inglizcha nom:** FOCUS AI — discipline friend
**Inglizcha qisqa:** Reach your goals with discipline: AI coach, focus timer, habits.

## 6) Kerakli rasmlar (Play talab qiladi) — TAYYOR ✓
Hammasi `docs/v2/preview/assets/playstore/` da (yoki jonli: daywarden.vercel.app/assets/playstore/...):
- **Ilova ikonkasi:** 512×512 — `assets/mnsm-512.png` ✓
- **Feature graphic (1024×500):** `playstore/feature-graphic-1024x500.png` ✓
- **Telefon skrinshotlari (430×932):** `playstore/ss1-home.png`, `ss2-timer.png`, `ss3-dostlar.png`, `ss4-mukofot.png` ✓
Play Console'da shu fayllarni yuklaysiz (kamida 2 ta skrinshot shart — bizda 4 ta).

## 7) Play Console qo'shimcha bo'limlar
- **Privacy policy:** https://daywarden.vercel.app/privacy.html
- **Data safety:** ma'lumot to'plash — qurilma kodi (do'stlar), statistikangiz (server). Sotilmaydi.
- **Content rating:** so'rovnoma to'ldiriladi (odatda "Everyone").
- **Target audience:** 13+ (yoki mos yosh).

## 8) Har yangilanishda
1. `twa/twa-manifest.json` da `appVersionCode` ni +1 (masalan 2), `appVersionName` (masalan 1.0.1).
2. "Android (TWA)" workflow → yangi `.aab`.
3. Play Console → Production → yangi release → `.aab` yuklang.
(PWA kontent yangilanishlari APK/AAB'siz avtomatik keladi — faqat ikonka/paket o'zgarsa qayta build.)
