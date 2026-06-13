# brend Motion System

> Animatsiyalar — qisqa muddatli dopamin emas, **identitet shakllantirish**ga xizmat qiladi.

Cross-platform (React Native + react-native-web). Reanimated 3 worklet'lar UI thread'da
ishlaydi, web'da RAF orqali.

## Falsafa

1. **Calibrated restraint** — har animatsiya foydalanuvchining sodiqlik darajasiga moslashadi.
   Streak qancha katta bo'lsa, animatsiya shuncha sokin va kamtar bo'ladi.
2. **Identity over outcome** — *"Siz becoming"* > *"Siz erishdingiz"*.
3. **Calm beats exciting** — vazifa bajarish — kunlik valyuta, bayram emas.
4. **Animation never blocks UX** — har press 80ms ichida unblock bo'ladi.

## Reward Hierarchy

| Tier | Metafora | Qachon | ~Davomiylik | Chastota |
|---|---|---|---|---|
| **Micro** | shivirlash | Har vazifa | 200ms | ~3-5/kun |
| **Quiet** | bosh irg'atish | Kun yakuni | 600ms | ~1/kun |
| **Notable** | qo'l olishish | Streak 7, 30, 50; maqsad 50% | 1500ms | ~yiliga 12 marta |
| **Memorable** | mustahkam moment | Streak 100, 365; mukammal oy | 2500ms | ~yiliga 4-6 marta |
| **Cinematic** | quchoq | Maqsad tugadi, yil streak | 5-6s | ~yiliga 1-2 marta |

## Restraint Multiplier

Automatic intensity dampening:

| Holat | Multiplier |
|---|---|
| `streak >= 100` | 0.5 |
| `streak >= 30` | 0.7 |
| `streak >= 7` | 0.85 |
| `recovering` | 0.8 |
| boshlovchi | 1.0 |

User Setting (Settings → Celebration Intensity):
- **Minimal** × 0.55
- **Balanced** × 1.0 (default)
- **Energetic** × 1.25

## Quick start

```tsx
import {
  StreakCounter,
  QuietConfirm,
  DayClose,
  MilestoneMark,
  MotionDebugPanel,
  Intensity,
  type UserMotionState,
} from 'brend-motion';

function HomeScreen() {
  const motionState: UserMotionState = {
    streak: 43,
    recovering: false,
    intensity: 'balanced',
  };

  return <StreakCounter streak={43} motionState={motionState} />;
}
```

## Recovery experience

Recovery is a tier (not micro) — when user returns after >= 2 missed days:
identity message defaults to "Qaytdingiz. Yo'l davom etadi." (no shame, no celebration).
Set `motionState.recovering = true` and the system handles the rest.

## File map

```
src/
├── tokens.ts                    Design tokens + Tier/Intensity types
├── index.ts                     Public API
├── hooks/
│   ├── useReducedMotion.ts      a11y — matchMedia (web) + AccessibilityInfo (native)
│   └── useRestraintIntensity.ts auto-restraint multiplier
├── messages/
│   └── identity.ts              Identity message generator (uz)
├── primitives/
│   ├── QuietConfirm.tsx         Micro — every task
│   ├── DayClose.tsx             Quiet — daily complete
│   ├── MilestoneMark.tsx        Notable — streak milestones
│   └── StreakCounter.tsx        Integrated counter + AmbientPulse
└── debug/
    └── MotionDebugPanel.tsx     Manual tier trigger + intensity toggle
```

## Dependencies

```json
{
  "react-native-reanimated": "^3.6.0",
  "expo-haptics": "^12.0.0"
}
```

Web target requires `react-native-web` ≥ 0.19.

## Performance contract

- Only `transform` and `opacity` animated — GPU compositing thread.
- `useSharedValue` (worklets) — no React state per frame.
- Loops cancel on unmount via `cancelAnimation`.
- Particle counts tier-aware (low-end ≤ 6, mid 12, high 24) — not yet used; only burst primitives need this.
- Tab visibility hooks pause looping animations (StreakCounter AmbientPulse).
