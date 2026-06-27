# Tests — Daywarden PWA sifat qalqoni

Dependency YO'Q. Node ichki test-runneri (`node:test`) + `vm` bilan ishlaydi.

## Ishga tushirish

```bash
node --test "tests/**/*.test.js"
```

(Node 18+ kerak. npm install shart emas.)

## Nimalar qamralgan

| Fayl | Tur | Tekshiradi |
|------|-----|-----------|
| `data.test.js` | UNIT | Biznes-mantiq: `parseDurMins`, `fmtHM`, `localDateIso`, `taskKey`, `getTaskState`/`setTaskState`, `getGoalProgress`. To'g'ri holat + CHEKKA holatlar (bo'sh/null/manfiy/0/yo'q). |
| `i18n.test.js` | i18n | Har ekrandagi `data-i18n` kaliti **uz/ru/en uchchalasida** mavjudligi (aralash-til bug'ini ushlaydi). |
| `smoke.test.js` | SMOKE / LINT | Har HTML ekranning inline JS sintaksisi toza; shared JS toza; `<style>` qavslari balansda. |
| `harness.js` | — | `data.js`/`i18n.js` ni Node'da brauzer-stub bilan yuklaydi (test infratuzilmasi). |

## QOIDA (sifat qalqoni)

1. **TDD:** yangi xususiyat/o'zgarish — avval test (qizil), keyin kod (yashil), keyin refactor.
2. **Har o'zgarishdan keyin** `node --test "tests/**/*.test.js"` ishlat.
3. **Biror test sinsa — commit/deploy QILMA.** Avval tuzat.
4. Yangi mantiq qo'shilsa — happy-path + xato-yo'l testlari ham yoziladi.
5. Test nomlari ma'noli + Arrange-Act-Assert uslubida.
