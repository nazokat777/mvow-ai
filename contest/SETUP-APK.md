# APK yasash (PWABuilder) — Play Market uchun

Daywarden PWA to'liq tayyor (manifest + SW + ikonka + maskable + HTTPS). APK ~5 daqiqada yasaladi.

## Qadamlar

**1. PWABuilder'ni oching**
- `pwabuilder.com` → o'rtadagi maydonga **`daywarden.vercel.app`** yozing → **Start**
- U PWA'ni tahlil qiladi (yuqori ball chiqadi — hammasi joyida)

**2. Android paketi**
- **Package For Stores** tugmasi → **Android** → **Google Play** variantini tanlang

**3. Sozlamalar**
- **Package ID:** `com.justaiit.daywarden`
- **App name:** Daywarden
- **App version:** 1.0.0
- **Signing key:** **"Create new"** (PWABuilder yangi kalit yaratadi)

**4. Generate → yuklab oling**
- **Download** → `.zip` fayl tushadi. Ichida:
  - `*.aab` — Google Play'ga yuklash uchun
  - `*-signed.apk` (test papkada) — telefonga to'g'ridan o'rnatib sinash uchun
  - **`signing.keystore` + kalit ma'lumotlari** — ⚠️ **ABADIY SAQLANG** (yo'qotsangiz, ilovani yangilab bo'lmaydi!)
  - `assetlinks.json` — ⬅️ **buni menga bering**

**5. Menga `assetlinks.json` ni bering**
- Men uni saytga qo'shaman (`/.well-known/assetlinks.json`) → ilova **to'liq ekran** ochiladi (yuqorida brauzer manzili ko'rinmaydi, haqiqiy ilova kabi)

**6. Sinash yoki nashr qilish**
- **Sinash (bepul):** `-signed.apk` ni Android telefonga o'rnating ("Noma'lum manbalardan o'rnatish"ni yoqing)
- **Nashr (Play Market):** Google Play Console (bir martalik $25 dev akkaunt) → yangi ilova → `.aab` ni yuklang → tavsif/skrinshot → yuborish

## iOS (App Store)
PWABuilder iOS paketini ham beradi, lekin App Store uchun Apple Developer akkaunt ($99/yil) + Mac kerak. Buni keyinroq.

---

**Eslatma:** Kalit faylini (keystore) yo'qotmang — har yangilanish o'sha kalit bilan imzolanishi shart.
