/**
 * Motion design tokens for the brend habit app.
 *
 * Philosophy: calibrated restraint. Animations serve identity, not excitement.
 * Numbers chosen to align with 60fps grid (multiples of 40ms / 16.67ms).
 */

// ─────────────────────────────────────────────────────────────
// Timing scale
// Smaller = service the user (fast feedback).
// Larger  = mark identity moments (presence, not noise).
// ─────────────────────────────────────────────────────────────
export const duration = {
  micro:        160,  // tap feedback, row state change
  quick:        200,  // small slides, brief crossfades
  standard:     280,  // default transitions
  emphasized:   400,  // notable state changes (DayClose ring)
  cinematic:    720,  // hero reveals (rare)
  ambient:    4_800,  // breathing loops (StreakCounter pulse)
} as const;

export type DurationKey = keyof typeof duration;

// ─────────────────────────────────────────────────────────────
// Easing curves (cubic-bezier coefficients).
// Tuples so they can be spread into Easing.bezier(...).
// ─────────────────────────────────────────────────────────────
export const ease = {
  linear:     [0, 0, 1, 1] as const,
  standard:   [0.2, 0, 0, 1] as const,            // default smooth
  emphasized: [0.2, 0, 0, 1.15] as const,         // subtle overshoot
  dramatic:   [0.85, 0, 0.15, 1] as const,        // cinematic
  exit:       [0.4, 0, 1, 1] as const,            // quick disappear
} as const;

export type EaseKey = keyof typeof ease;

// ─────────────────────────────────────────────────────────────
// Spring presets (Reanimated `withSpring` config).
// ─────────────────────────────────────────────────────────────
export const spring = {
  gentle:     { stiffness: 120, damping: 16, mass: 1 },       // ambient
  responsive: { stiffness: 200, damping: 20, mass: 1 },       // press
  bouncy:     { stiffness: 180, damping: 12, mass: 1 },       // ignition
  snappy:     { stiffness: 300, damping: 25, mass: 1 },       // snap close
  dramatic:   { stiffness: 100, damping:  8, mass: 1.2 },     // memorable+
} as const;

export type SpringKey = keyof typeof spring;

// ─────────────────────────────────────────────────────────────
// Color palette — brand-aligned (matches the PWA CSS variables).
// ─────────────────────────────────────────────────────────────
export const palette = {
  bg: {
    void:     '#04060B',
    elevated: '#11151E',
    surface:  '#1B2030',
  },
  accent: {
    primary: '#00E5D4',
    bright:  '#7AF5EC',
    glow:    'rgba(0,229,212,0.35)',
  },
  // Flame only ignites at milestones; color shifts with streak depth.
  flame: {
    novice: '#FFD166',    //  7–29 days
    steady: '#FF8E97',    // 30–99
    deep:   '#FF4757',    // 100+
    glow:   'rgba(255,142,151,0.45)',
  },
  text: {
    primary: '#F5F2EC',
    quiet:   '#B8BBC2',
    dim:     '#9CA0A8',
  },
  identity: '#F5F2EC', // identity text — always full clarity
} as const;

// ─────────────────────────────────────────────────────────────
// Reward tier (5-level hierarchy).
// ─────────────────────────────────────────────────────────────
export const Tier = {
  Micro:     'micro',      // every task — whisper
  Quiet:     'quiet',      // daily close — nod
  Notable:   'notable',    // 7 / 30 / 50 — handshake
  Memorable: 'memorable',  // 100, 365, perfect month — firm
  Cinematic: 'cinematic',  // goal complete, year — embrace
} as const;

export type Tier = typeof Tier[keyof typeof Tier];

// ─────────────────────────────────────────────────────────────
// User-controlled celebration intensity (Settings).
// ─────────────────────────────────────────────────────────────
export const Intensity = {
  Minimal:   'minimal',   // power users / mature streaks
  Balanced:  'balanced',  // default
  Energetic: 'energetic', // early users who want louder feedback
} as const;

export type Intensity = typeof Intensity[keyof typeof Intensity];

// ─────────────────────────────────────────────────────────────
// User motion state — driver for restraint multiplier.
// ─────────────────────────────────────────────────────────────
export interface UserMotionState {
  /** Current streak in days. */
  streak: number;
  /** True if user just returned after >= 2 missed days. */
  recovering: boolean;
  /** Per-user celebration intensity setting. */
  intensity: Intensity;
}

/**
 * Computes the restraint multiplier (0..~1.3).
 *
 * As streak grows, the user becomes identity-bound — they no longer need
 * loud encouragement. The number itself trends DOWN as the user matures.
 *
 * The user's `intensity` setting then scales the whole number up/down.
 */
export function computeRestraint(state: UserMotionState): number {
  let base: number;
  if (state.streak >= 100)      base = 0.5;
  else if (state.streak >= 30)  base = 0.7;
  else if (state.streak >= 7)   base = 0.85;
  else if (state.recovering)    base = 0.8;   // gentle return — never celebrate it
  else                          base = 1.0;

  const userScale: Record<Intensity, number> = {
    minimal:   0.55,
    balanced:  1.0,
    energetic: 1.25,
  };
  return base * userScale[state.intensity];
}

// ─────────────────────────────────────────────────────────────
// Glow strengths — for box-shadow / Skia / accent halos.
// ─────────────────────────────────────────────────────────────
export const glow = {
  subtle: { blur: 12, opacity: 0.25 },
  medium: { blur: 24, opacity: 0.45 },
  hero:   { blur: 48, opacity: 0.65 },
} as const;
