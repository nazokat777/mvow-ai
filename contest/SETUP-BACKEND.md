# Ijtimoiy backend (Supabase) — sozlash

Supabase bepul (kartasiz). "anon" kaliti ochiq bo'lishi xavfsiz (RLS himoya qiladi).

## Qadamlar

**1. Loyiha yarating**
- `supabase.com` → **Start your project** → GitHub/Google bilan kiring
- **New project** → nom: `FOCUS AI` → **Database Password** o'ylab toping va **saqlang** → region: eng yaqin → **Create** (~2 daqiqa kutadi)

**2. Sxemani joylang**
- Chap menyu → **SQL Editor** → **New query**
- `contest/supabase-schema.sql` ichidagini to'liq nusxalab joylang → **Run** (yashil "Success")

**3. Anonim kirishni yoqing** (akkauntsiz ishlashi uchun)
- Chap menyu → **Authentication** → **Sign In / Providers** (yoki **Providers**)
- **Anonymous** ni toping → yoqing (toggle) → **Save**

**4. Kalitlarni oling va menga bering**
- Chap menyu → **Project Settings** (⚙️) → **API**
- Ikkitasini nusxalang:
  - **Project URL** (masalan: `https://abcd.supabase.co`)
  - **anon public** kaliti (uzun matn, `eyJ...` bilan boshlanadi)
- Menga **ikkalasini** tashlang → men ilovaga ulayman.

> anon kalit ochiq bo'lishi normal (Supabase shunday ishlaydi; ma'lumotni RLS qoidalari himoya qiladi).

## Keyin men nima qilaman

- `supabase-config.js` (URL + anon kalit) + Supabase klientini ulayman
- Anonim kirish → har qurilmaga profil + do'st kodi
- FOCUS AI kunlik natijani (fokus daqiqa + odat) serverga yozadi
- Do'stlar ekrani: real reyting + ustoz/ota-ona nazorati
- 2-bosqich: chat (realtime)
