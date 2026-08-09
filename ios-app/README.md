# FOCUS AI — iOS (App Store)

App Store'ga chiqadigan versiya. To'liq qo'llanma: [../APPSTORE.md](../APPSTORE.md).

## Nima bu

PWA (`docs/v2/preview/`) iOS ilovasi **ichida** ishlaydi — Capacitor qobig'i bilan.
Fayllar ilova to'plamiga joylashadi, uzoq serverdan yuklanmaydi: shunda ilova
internetsiz ham ochiladi va Apple'ning 4.2 ("shunchaki sayt") qoidasiga tushmaydi.

Android'dagi TWA bilan farqi: TWA saytni brauzerda ko'rsatadi, bu esa fayllarni
ichiga oladi va ustiga native qismlar qo'shiladi.

## Repoda nima saqlanadi

| Fayl | Vazifasi |
|---|---|
| `capacitor.config.json` | Ilova nomi, `appId`, rang, splash |
| `package.json` | Capacitor va plaginlar |
| `prepare-www.js` | PWA -> `www/` (server kodi va keraksiz fayllarsiz) |

`www/`, `ios/`, `node_modules/` — **build paytida yaratiladi**, git'da yo'q
(bubblewrap/TWA bilan bir xil yondashuv).

## Mahalliy ishlatish (Mac kerak)

```bash
cd ios-app
node prepare-www.js
npm install
npx cap add ios      # birinchi marta; keyin: npx cap sync ios
npx cap open ios
```

Windows'da `npx cap add ios` ishlamaydi (CocoaPods macOS talab qiladi) — shuning
uchun build bulutda: `.github/workflows/ios-appstore.yml`.

## Tekshiruv

```bash
node --test tests/ios-prepare-www.test.js
```

## Keyingi qadamlar

Native qismlar (Apple 4.2 uchun ham, foydali bo'lgani uchun ham):

- [ ] Local notifications — eslatmalar internetsiz ham
- [ ] WidgetKit widgeti — Android'dagisi kabi (`twa/widget/` ga qarang)
- [ ] Screen Time / FamilyControls — ilova qulflash (Apple'dan alohida ruxsat kerak)
- [ ] StoreKit 2 — 7 kunlik sinov + obuna
