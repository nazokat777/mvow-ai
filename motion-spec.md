# brend Motion Design System

> Neuro-driven motion for long-term habit formation.  
> Every animation answers one question: "Does this help the user continue progressing toward their goal?"

# Behavioral Psychology Foundation

This system is built on **identity-based motivation**, not achievement-based reinforcement. Every animation, every line of copy, every haptic pulse exists to answer one question on the user's behalf: *"What kind of person am I becoming?"* — not *"What did I just earn?"*

---

## 1. Identity Over Achievement (Clear / Fogg)

James Clear (*Atomic Habits*, 2018) argues that durable behavior change happens at the **identity layer**, not the outcome layer. BJ Fogg (*Tiny Habits*, 2020) reinforces this: celebration after a behavior should encode *who you are*, not *what you did*. Neurologically, identity-aligned cues recruit the **vmPFC (ventromedial prefrontal cortex)** — the self-referential network — instead of the **nucleus accumbens** dopamine-spike loop that drives gambling and social-media compulsion (Berkman et al., *Trends in Cognitive Sciences*, 2017).

Translation: *"Good job!"* feeds a reward loop. *"You are becoming someone who keeps promises"* edits self-concept. Self-concept survives bad days; dopamine doesn't.

**Copy pairs — bad (achievement) vs. good (identity):**

```
BAD  (uz): "Zo'r! Bugun ham bajardingiz!"
GOOD (uz): "Siz so'zida turadigan odam bo'lib boryapsiz."
BAD  (en): "Great job today!"
GOOD (en): "You are becoming someone who keeps their word."

BAD  (uz): "5 kunlik streak! +50 ball!"
GOOD (uz): "Beshinchi kun. Bu endi tasodif emas."
BAD  (en): "5-day streak! +50 points!"
GOOD (en): "Five days. This is no longer chance."

BAD  (uz): "Vazifa bajarildi ✓"
GOOD (uz): "Bitta va'da — ushlandi."
BAD  (en): "Task complete ✓"
GOOD (en): "One promise — kept."

BAD  (uz): "Ajoyib! Davom eting!"
GOOD (uz): "Siz tanlagan yo'lda — yana bir qadam."
BAD  (en): "Awesome! Keep going!"
GOOD (en): "One more step on the road you chose."

BAD  (uz): "Bugun yutdingiz!"
GOOD (uz): "Bugun ham — o'sha odam."
BAD  (en): "You won today!"
GOOD (en): "Today — the same person again."

BAD  (uz): "Maqsadga yetdingiz!"
GOOD (uz): "Bu sizning odatingiz endi."
BAD  (en): "Goal reached!"
GOOD (en): "This is your habit now."
```

Note the absence of exclamation marks in the "good" column. Identity statements are **declarative**, not enthusiastic.

---

## 2. The 5-Level Reward Hierarchy

Each tier earns more motion budget. Below the table, **less is more** above the line — restraint is the signal.

| Tier | Fires When | Motion Ceiling | Haptic | Sound |
|------|------------|----------------|--------|-------|
| **Micro** | Tap, toggle, field focus | 120 ms opacity/transform, 4 px max | none | none |
| **Quiet** | Single task done | 240 ms, 8 px lift, accent glow 8 % | `[10]` ms | none |
| **Notable** | Day plan completed | 480 ms, scale 1.02, glow 18 % | `[15, 30, 15]` | none |
| **Memorable** | Week closed, first 7-day streak | 900 ms, layered fade-up, glow 28 % | `[20, 40, 20, 40, 20]` | none |
| **Cinematic** | First 30-day streak, monthly review | 1600 ms staged sequence, particle drift, full --accent | `[25, 60, 25, 60, 80]` | none |

**Sample copy by tier:**

```
Micro     (uz) — (no copy, motion only)
Quiet     (uz) "Ushlandi."                 (en) "Kept."
Notable   (uz) "Kun yopildi. Toza."        (en) "Day closed. Clean."
Memorable (uz) "Bir hafta — bir xil odam." (en) "One week — one person."
Cinematic (uz) "Bu endi xarakter."         (en) "This is now character."
```

Sound is **always none**. Mentors don't applaud — they nod.

---

## 3. Restraint Multiplier — Why Long Streaks Celebrate *Less*

This is the most counter-intuitive rule and the most important. Three forces converge:

1. **Hedonic adaptation** (Brickman & Campbell, 1971; Frederick & Loewenstein, 1999): repeated rewards of equal magnitude flatten in perceived value. Loud celebration on day 60 feels *smaller* than the same celebration on day 7.
2. **Intermittent reinforcement** (Skinner, 1957; reaffirmed in Schultz, *Nature Reviews Neuroscience*, 2016): variable, unpredictable, *quieter* rewards drive deeper persistence than predictable loud ones — the slot-machine principle inverted toward virtue.
3. **Prestige vs. novelty**: novel users need visible proof the app "works." Long-tenured users need proof they are *above* needing proof. Loud confetti at day 90 is insulting — it implies the user still needs convincing.

**Formula:**

```
celebration_amplitude = base * exp(-streak_days / 120)
```

Day 1: amplitude = 1.00 × base
Day 30: amplitude = 0.78 × base
Day 90: amplitude = 0.47 × base
Day 200: amplitude = 0.19 × base
Day 365: amplitude = 0.048 × base — near-silent

The exponential decay with τ = 120 days was chosen because it (a) keeps amplitude meaningful through the first month when habit consolidation is fragile (Lally et al., *EJSP*, 2010, found median habit-formation at 66 days), and (b) approaches zero by year-end, when identity is fully internalized and the app should feel like a quiet companion, not a cheerleader.

---

## 4. Recovery Without Guilt

Users *will* miss days. The app's response defines whether they return.

Guilt activates **avoidance circuitry** (amygdala + insula) — the user closes the app and doesn't come back. Compassionate reframing recruits **self-affirmation pathways** (Cascio et al., *SCAN*, 2016) which preserve engagement.

```
(uz) "Bugun — yangi imkoniyat. Streak emas, siz muhim."
(en) "Today is a new opportunity. You matter, not the streak."

(uz) "O'tgan kunlar joyida. Bugun — qaytish kuni."
(en) "Past days remain where they are. Today is the return."

(uz) "Yana shu yerdamiz. Birinchi qadam — yetarli."
(en) "Here again. One step is enough."
```

No "you broke your streak" language. Ever. The counter resets silently.

---

## 5. Ambient Pulse — Identity Without Reward Loop

At **streak ≥ 30**, a **2 % opacity radial glow** breathes behind the home screen at **~0.1 Hz** (one cycle per 10 s, matched to resting respiratory rhythm). It is below the **just-noticeable-difference threshold** (Weber-Fechner) for active attention but reliably detected by peripheral vision.

This bypasses the dopamine loop entirely. There is no event, no reward, no "moment." It is environmental — closer to the felt presence of a warm room than to a notification. Users report (in similar systems: Calm, Oak) that ambient sub-threshold cues create **trait-level identification** ("this app is *mine*") rather than **state-level engagement spikes**.

It says, without words: *you live here now.*

---

# Motion Tokens & Hierarchy

A disciplined motion system needs a vocabulary before it needs choreography. These tokens are the alphabet — every animation in brend is a sentence written from them. No one-off `transition: 0.3s ease` strings anywhere. Tokens or nothing.

---

## 1. Timing Scale

Seven durations, geometric-ish, each with a single job. Naming is intent-first ("celebrate", "ambient") rather than numeric ("dur-3"), so a future contributor reads the CSS and knows *why* the value is there.

| Token | Value | When to use it | Habit-app example |
|---|---|---|---|
| `--mvw-dur-instant` | **80ms** | Direct feedback. The user touched something — confirm it before they doubt their tap. Below ~100ms the brain reads it as physical, not animated. | Tap a habit checkbox. The box fills in 80ms. No "animation" felt, just response. |
| `--mvw-dur-quick` | **160ms** | Small interface state changes. Hover, focus ring, button press depress. Fast enough not to delay the next action. | Pressing the "Bajardim" (I did it) button — depress + accent glow scale-up in 160ms. |
| `--mvw-dur-normal` | **240ms** | The default for *everything* that isn't a reward or a system entrance. Panel open, sheet slide, value tween. | Today's task card sliding up from below when you open the day-flow screen. |
| `--mvw-dur-slow` | **400ms** | Deliberate transitions — the user should *notice* something is changing, not just have it appear. | Streak counter incrementing from 6 to 7 with the digit roll. The number is the point; let them watch it. |
| `--mvw-dur-celebrate` | **700ms** | The reward beat. Long enough to land emotionally, short enough not to interrupt flow. The "you kept your promise" pulse. | Finishing the last task of the day — the card pulses, glow expands, settles. 700ms total. |
| `--mvw-dur-cinematic` | **2800ms** | Memorable moments. Streak milestones, weekly review reveal, evening reflection opening. The user is *meant* to pause. | Day 30 streak banner — letters reveal one by one, glow blooms then exhales, total ~2.8s. |
| `--mvw-dur-ambient` | **6000ms** | Background life. Things that should breathe forever without ever stealing attention. Always paired with low opacity deltas (<0.1). | The horizon line behind the home screen "exhaling" — 6s in, 6s out, opacity 0.4 → 0.5 → 0.4. |

**Rule:** if you find yourself reaching for a value *between* these tokens (e.g. "I need 320ms"), you don't need a new token — pick the nearer one and adjust the easing instead. Seven is the cap.

---

## 2. Easing Curves

Five curves. Each one has a *felt quality* — a word a non-engineer could feel on their body.

```css
--mvw-ease-enter:     cubic-bezier(0.16, 0.84, 0.32, 1);    /* calm arrival */
--mvw-ease-exit:      cubic-bezier(0.4,  0,    1,    1);    /* fast departure */
--mvw-ease-celebrate: cubic-bezier(0.16, 1.04, 0.32, 1);    /* slight overshoot */
--mvw-ease-recovery:  cubic-bezier(0.25, 0.46, 0.45, 0.94); /* gentle return */
--mvw-ease-breath:    cubic-bezier(0.4,  0,    0.6,  1);    /* symmetric ambient */
```

### Felt-quality differences

**`--mvw-ease-enter`** — *calm arrival.*
Starts fast, decelerates into a soft landing. The curve rises sharply then flattens against the top. Feel: a hand placing a cup on a table — committed travel, then a quiet settle. Use it for almost every "appearing" thing. It's the workhorse.

**`--mvw-ease-exit`** — *fast departure.*
Starts gentle, accelerates *out*. Mirror-opposite of enter. Feel: something leaving the room — you don't want to watch the door close, you want it gone. Use it when dismissing sheets, hiding things the user already moved past. Pair with `--mvw-dur-quick`. Exits should never use `--mvw-dur-normal` or longer — the user already decided.

**`--mvw-ease-celebrate`** — *slight overshoot.*
The y-control point is `1.04` — past the endpoint. That's the trick. The animation reaches its target, briefly continues *past* it, then settles back. Feel: a held breath releasing into a smile. The overshoot is small (4%) on purpose — bigger overshoots feel like cartoons and undermine the mentor tone. Used only for reward tiers Notable and above.

**`--mvw-ease-recovery`** — *gentle return.*
The most "polite" curve — soft start, soft end, no overshoot. Feel: a leaf settling on water. Used when a celebration *ends* and the UI has to return to rest, or when reversing a state without drama (e.g. user un-checks a habit they checked by accident — the UI returns to unchecked using recovery, never exit, because exit would feel like punishment).

**`--mvw-ease-breath`** — *symmetric ambient.*
The only symmetric curve — the in and out are mirror images. Feel: actual breathing. The chest doesn't snap up and slow-fall; it rises and falls with the same shape. This is the *only* curve used with `--mvw-dur-ambient`, and the only curve allowed in `animation-direction: alternate` loops. Asymmetric easing on a loop creates visual rhythm that the eye locks onto and never lets go — disastrous for background motion.

**Mental model for picking:**
- Is something *appearing*? → `enter`
- Is something *leaving* (and the user is done with it)? → `exit`
- Is the app *rewarding* the user? → `celebrate`
- Is the app *returning to calm* after a reward (or after a user undo)? → `recovery`
- Is it a *loop* that should never end? → `breath`

---

## 3. Reward Hierarchy → Motion Token Mapping

Five tiers, escalating. Each tier is a complete recipe — duration, easing, glow, scale, haptic — no improvisation per-component.

| Tier | Duration | Easing | Glow opacity | Scale sequence | Haptic pattern |
|---|---|---|---|---|---|
| **Micro** | `--mvw-dur-quick` (160ms) | `--mvw-ease-enter` | `0.15` | `1.0 → 1.03 → 1.0` | `[10]` |
| **Quiet** | `--mvw-dur-normal` (240ms) | `--mvw-ease-enter` | `0.25` | `1.0 → 1.04 → 1.0` | `[20]` |
| **Notable** | `--mvw-dur-celebrate` (700ms) | `--mvw-ease-celebrate` | `0.4` | `1.0 → 1.08 → 1.0` | `[25, 40, 25]` |
| **Memorable** | `--mvw-dur-cinematic` (2800ms) | `--mvw-ease-celebrate` | `0.55` | `1.0 → 1.12 → 1.0` | `[40, 60, 40, 60]` |
| **Cinematic** | `--mvw-dur-cinematic × 2` (5600ms) | `--mvw-ease-celebrate` | `0.7` | full sequence (multi-stage) | `[50, 80, 50, 80, 50]` |

**When each tier fires:**

- **Micro** — every tap, every checkbox, every button press. So light the user doesn't consciously notice; they only notice its *absence* on a competitor's app.
- **Quiet** — completing a single task inside a routine. The acknowledgement is real but the work isn't done; don't oversell it.
- **Notable** — completing a full routine, or first task of the day. The user has cleared a meaningful chunk.
- **Memorable** — completing the entire day, hitting a 7-day streak, or first-ever goal set. These happen rarely; let them feel rare.
- **Cinematic** — 30-day streak, 100-day streak, goal achieved. Reserved. If you fire Cinematic more than once a month for any single user, the tier is broken.

**Haptic note:** patterns are passed straight to `navigator.vibrate()`. Single-element arrays are one buzz; multi-element arrays alternate buzz/pause/buzz. Cinematic's five-element pattern (~310ms total) is the longest the app ever vibrates — anything longer reads as a notification, not a celebration.

**Hard rule:** a tier never bleeds into the next. If a button needs more than Micro, it's not a button — it's a moment, and it deserves its own design pass.

---

## 4. Token CSS — Drop into `motion.css`

```css
:root {
  /* ---------- Timing scale ---------- */
  --mvw-dur-instant:    80ms;
  --mvw-dur-quick:     160ms;
  --mvw-dur-normal:    240ms;
  --mvw-dur-slow:      400ms;
  --mvw-dur-celebrate: 700ms;
  --mvw-dur-cinematic: 2800ms;
  --mvw-dur-ambient:   6000ms;

  /* ---------- Easing curves ---------- */
  --mvw-ease-enter:     cubic-bezier(0.16, 0.84, 0.32, 1);
  --mvw-ease-exit:      cubic-bezier(0.4,  0,    1,    1);
  --mvw-ease-celebrate: cubic-bezier(0.16, 1.04, 0.32, 1);
  --mvw-ease-recovery:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --mvw-ease-breath:    cubic-bezier(0.4,  0,    0.6,  1);

  /* ---------- Reward tier: glow opacity ---------- */
  --mvw-glow-micro:     0.15;
  --mvw-glow-quiet:     0.25;
  --mvw-glow-notable:   0.4;
  --mvw-glow-memorable: 0.55;
  --mvw-glow-cinematic: 0.7;

  /* ---------- Reward tier: scale peak ---------- */
  --mvw-scale-micro:     1.03;
  --mvw-scale-quiet:     1.04;
  --mvw-scale-notable:   1.08;
  --mvw-scale-memorable: 1.12;
  --mvw-scale-cinematic: 1.18;

  /* ---------- Global intensity multipliers (set by user setting) ---------- */
  --mvw-intensity-amp:  1;    /* amplitude (scale/glow delta) */
  --mvw-intensity-dur:  1;    /* duration */
}

/* Reduced motion — non-negotiable override */
@media (prefers-reduced-motion: reduce) {
  :root {
    --mvw-dur-instant:    1ms;
    --mvw-dur-quick:      1ms;
    --mvw-dur-normal:     1ms;
    --mvw-dur-slow:       1ms;
    --mvw-dur-celebrate:  1ms;
    --mvw-dur-cinematic:  1ms;
    --mvw-dur-ambient:    1ms;
    --mvw-intensity-amp:  0;
  }
}
```

**Why intensity vars live in `:root`:** every animation reads them. A JS setter changes one custom property and the entire app re-tunes on the next frame — no re-render, no event bus, no animation library. The user toggle is two lines:

```js
document.documentElement.style.setProperty('--mvw-intensity-amp', amp);
document.documentElement.style.setProperty('--mvw-intensity-dur', dur);
```

---

## 5. Celebration Intensity — User Setting

Three modes. Default is `balanced`. Setting lives at `localStorage['mvow.celebrationIntensity']` to match the existing `mvow.streak` key convention.

| Mode | Amplitude multiplier | Duration multiplier | Tier skipping |
|---|---|---|---|
| **minimal** | `× 0.5` | `× 0.8` | On small triggers (single-task completion), Notable+ tiers downgrade to Quiet. |
| **balanced** *(default)* | `× 1.0` | `× 1.0` | None. |
| **energetic** | `× 1.3` | `× 1.1` | None. |

### What the multipliers actually touch

- **Amplitude** scales the *delta* from rest, not the rest value. A `1.0 → 1.08` Notable pulse at `amp × 0.5` becomes `1.0 → 1.04`. At `× 1.3` it becomes `1.0 → 1.104`. Glow opacity follows the same math.
- **Duration** scales every `--mvw-dur-*` token at runtime. At `minimal`, a 700ms Notable becomes 560ms — snappier, less dwell. At `energetic`, 770ms — slightly more luxurious.
- **Tier skipping** only applies to `minimal`. The rule: on completing a *single* task, never escalate above Quiet. Routine and day completions still hit their normal tier — minimal users still deserve the moments that matter, just stripped of mid-tier fanfare.

### Implementation pattern

```js
const INTENSITY = {
  minimal:   { amp: 0.5, dur: 0.8, skipSmallReward: true  },
  balanced:  { amp: 1.0, dur: 1.0, skipSmallReward: false },
  energetic: { amp: 1.3, dur: 1.1, skipSmallReward: false },
};

function applyIntensity(mode = 'balanced') {
  const cfg = INTENSITY[mode] ?? INTENSITY.balanced;
  const root = document.documentElement.style;
  root.setProperty('--mvw-intensity-amp', cfg.amp);
  root.setProperty('--mvw-intensity-dur', cfg.dur);
  localStorage.setItem('mvow.celebrationIntensity', mode);
}
```

In CSS, animations read intensity by multiplying the token:

```css
.task-complete-pulse {
  animation: pulse
    calc(var(--mvw-dur-celebrate) * var(--mvw-intensity-dur))
    var(--mvw-ease-celebrate);
}

@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(calc(1 + (var(--mvw-scale-notable) - 1) * var(--mvw-intensity-amp))); }
  100% { transform: scale(1); }
}
```

The `calc(1 + (peak - 1) * amp)` pattern is the only correct way — it scales the *delta*, not the whole value, so `amp: 0` collapses to no motion (perfect for reduced-motion users) and `amp: 1.3` exaggerates only the active portion.

### Where the user sets it

In `Sozlamalar` (Settings), under a section titled **Nishon (Celebration)** — three radio cards with one-line previews. The preview button on each card fires a Notable-tier pulse at that intensity *in place*, so the user feels the difference before committing. No words can describe these multipliers; the body has to feel them.

---

## Closing principle

Tokens are not constraints — they're vows. Every animation in brend will be readable as a sentence built from this alphabet, and every contributor adding motion will reach for tokens before reaching for numbers. The day someone writes `transition: 0.3s ease-in-out` in this codebase is the day the system starts dying.

---

# Performance & GPU Rules

Motion in *brend* must feel weightless on a Pixel 4a or iPhone SE 2020 — the floor of our user base. Every animation in this app is a contract: it will hold 60fps, or it will not ship. The rules below are not preferences. They are the boundary between "premium mentor" and "janky habit tracker."

---

## 1. Compositor-only properties — the only things you may animate

The browser has three pipelines: **layout → paint → composite**. Layout and paint run on the main thread and are catastrophically expensive when triggered every frame. The compositor runs on the GPU and can move pre-rendered layers at refresh rate without touching either.

**You may animate ONLY these:**

| Property | Why it's safe |
|---|---|
| `transform: translate() / scale() / rotate()` | Pure GPU matrix multiplication on an existing layer. No layout, no paint. |
| `opacity` | A single alpha multiplier applied by the compositor to a finished texture. |
| `filter: blur() / drop-shadow() / brightness()` | Runs as a GPU shader pass over the composited layer. Cheap *if* the layer is already promoted. |

Everything else triggers layout or paint. Treat them as forbidden inside `@keyframes`, `transition`, or any per-frame JS update.

> Rule of thumb: if you cannot picture the property as "a transform applied to a finished snapshot of the element," it does not belong in motion code.

---

## 2. Forbidden properties — do / don't pairs

These look innocent. They will tank framerate on the SE 2020 every single time.

### Width / height — do not animate the box

```css
/* DON'T — triggers layout every frame, reflows every sibling */
.card {
  transition: width 320ms ease, height 320ms ease;
}
.card.expanded { width: 320px; height: 180px; }

/* DO — scale a fixed-size layer */
.card {
  width: 320px;
  height: 180px;
  transform: scale(0.85);
  transform-origin: top left;
  transition: transform 320ms cubic-bezier(.2,.7,.2,1);
}
.card.expanded { transform: scale(1); }
```

### Top / left / right / bottom — do not animate position

```css
/* DON'T — layout thrash on every parent */
.toast {
  position: fixed;
  bottom: -80px;
  transition: bottom 280ms ease;
}
.toast.in { bottom: 24px; }

/* DO — translate from rest */
.toast {
  position: fixed;
  bottom: 24px;
  transform: translateY(120%);
  transition: transform 280ms cubic-bezier(.2,.7,.2,1);
}
.toast.in { transform: translateY(0); }
```

### Margin / padding — do not animate spacing

```css
/* DON'T — every margin tween reflows the entire ancestor chain */
.streak-pill { transition: margin-top 240ms ease; }

/* DO — translate the element, leave spacing alone */
.streak-pill {
  transition: transform 240ms cubic-bezier(.2,.7,.2,1), opacity 240ms ease;
}
.streak-pill.enter { transform: translateY(-6px); opacity: 0; }
```

### Border-width — do not animate strokes

```css
/* DON'T — changes box size, triggers layout */
.cta { transition: border-width 200ms ease; }
.cta:hover { border-width: 3px; }

/* DO — use inset box-shadow at fixed size, fade opacity, OR scale a pseudo-element ring */
.cta { position: relative; }
.cta::after {
  content: '';
  position: absolute; inset: -2px;
  border: 2px solid var(--accent);
  border-radius: inherit;
  opacity: 0;
  transition: opacity 200ms ease;
  pointer-events: none;
}
.cta:hover::after { opacity: 1; }
```

### Box-shadow — never animate the shadow itself

`box-shadow` repaints the entire element bounds every frame, and the blur radius re-runs a Gaussian convolution. This is the single biggest cause of dropped frames in habit apps.

```css
/* DON'T — repaints on every frame, kills SE 2020 */
.streak-counter {
  box-shadow: 0 0 0 rgba(0,229,212,0);
  transition: box-shadow 600ms ease;
}
.streak-counter.celebrate {
  box-shadow: 0 0 48px rgba(0,229,212,0.6);
}

/* DO — fade the opacity of an absolutely-positioned glow layer */
.streak-counter { position: relative; }
.streak-counter .glow {
  position: absolute; inset: -24px;
  border-radius: inherit;
  background: radial-gradient(closest-side, rgba(0,229,212,0.55), transparent 70%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 600ms ease;
  will-change: opacity;
}
.streak-counter.celebrate .glow { opacity: 1; }
```

The glow layer is painted **once** at its full radius. We only tween its alpha — a compositor op.

---

## 3. `will-change` — apply late, remove immediately

`will-change` is not a "make it faster" hint. It tells the browser to promote the element to its own GPU layer, which costs memory and texture upload. Leaving it on permanently leaks layers and can actually *degrade* performance.

**Pattern: apply right before the animation, remove on `animationend`.**

```js
function withWillChange(el, props, fn) {
  el.style.willChange = props;          // promote layer
  // Force a frame so the browser commits the promotion before animating
  requestAnimationFrame(() => {
    fn();
    el.addEventListener('animationend', function clear() {
      el.style.willChange = '';          // release layer
      el.removeEventListener('animationend', clear);
    });
  });
}

// usage
withWillChange(streakEl, 'transform, opacity', () => {
  streakEl.classList.add('tick-celebrate');
});
```

Never put `will-change` in a stylesheet on a permanent selector. The only acceptable static use is on elements that genuinely animate continuously (we have none in *brend*).

---

## 4. Animation budget

**Hard cap: 3 simultaneously animating nodes on screen at any moment.**

This is the SE 2020 / Pixel 4a budget. Each animated node = one promoted compositor layer + per-frame work. Above 3, the GPU starts batching, frames drop, and the "premium" feeling dies.

Counting rules:
- A parent fade + child fade = 2 nodes, not 1.
- A `filter: blur()` animation counts as 1.5 (shader cost) — round up.
- Continuous loops (spinners, breathing glows) count permanently — avoid them.

Frame target: **60fps on Pixel 4a / iPhone SE 2020**. If you cannot hit it in DevTools throttled CPU 4×, the animation is wrong.

Forbidden in combination:
- `filter: blur(>8px)` while anything else animates.
- `box-shadow` with blur radius > 24px on any element (even static — it taxes paint on scroll).
- More than one element using `backdrop-filter` on screen.

---

## 5. Common pitfalls in habit apps

### Pitfall A — animating the whole list on streak tick

When the streak ticks and a new entry appears, do **not** re-render the list with a stagger animation across every row. That promotes N layers and shifts layout.

```js
// DON'T
list.innerHTML = '';
items.forEach(item => list.appendChild(renderRow(item)));
list.querySelectorAll('.row').forEach((r, i) => {
  r.style.animationDelay = (i * 40) + 'ms';
  r.classList.add('row-in');
});

// DO — only animate the new item, others stay still
const newRow = renderRow(newItem);
list.prepend(newRow);
runMicro(newRow, 'row-in', 280);
```

### Pitfall B — `background-image` crossfades

Animating `background-image` cannot be GPU-accelerated. The browser repaints the entire element every frame.

```css
/* DON'T */
.hero { transition: background-image 600ms ease; }

/* DO — stack two absolutely-positioned image layers, crossfade opacity */
.hero { position: relative; }
.hero .layer {
  position: absolute; inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 600ms ease;
}
.hero .layer.active { opacity: 1; }
```

### Pitfall C — expensive `::before` / `::after` with `backdrop-filter`

A pseudo-element with `backdrop-filter: blur(20px)` is a per-frame full-screen GPU pass. Combine it with any motion and the SE 2020 melts.

```css
/* DON'T */
.modal::before {
  content: '';
  position: fixed; inset: 0;
  backdrop-filter: blur(20px);
  transition: opacity 320ms ease;
}

/* DO — one static backdrop element, fade opacity only, blur radius does not change */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(4, 6, 11, 0.72);  /* solid scrim, no backdrop-filter */
  opacity: 0;
  transition: opacity 320ms ease;
}
.modal-backdrop.open { opacity: 1; }
```

If you absolutely need a blurred backdrop, render it **once** and only animate its opacity. Never change the blur radius mid-animation.

---

## 6. Vanilla JS animation lifecycle — the canonical pattern

Every micro-animation in *brend* goes through this function. It enforces `prefers-reduced-motion`, promotes the layer, listens for `animationend`, cleans up, and has a safety-net timeout in case `animationend` never fires (which happens on backgrounded tabs and some Safari edge cases).

```js
function runMicro(el, cls, durMs) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
  el.style.willChange = 'transform, opacity, filter';
  el.classList.add(cls);
  return new Promise(res => {
    const done = () => {
      el.classList.remove(cls);
      el.style.willChange = '';
      el.removeEventListener('animationend', done);
      res();
    };
    el.addEventListener('animationend', done);
    setTimeout(done, durMs + 200); // safety net
  });
}
```

Why each line matters:
- **`prefers-reduced-motion` short-circuit** — returns a resolved Promise so callers can `await` without branching.
- **`willChange` set before class add** — gives the compositor one frame to promote the layer before the keyframes start.
- **Promise return** — lets callers chain (`await runMicro(...)` then trigger the next thing).
- **`animationend` cleanup** — removes the class and releases `will-change` so the layer is destroyed.
- **`setTimeout(done, durMs + 200)`** — safety net. If the tab is backgrounded mid-animation, `animationend` never fires; without this, the element stays stuck with the animation class applied and `will-change` leaks forever.

Usage:

```js
await runMicro(streakEl, 'streak-tick', 480);
await runMicro(nextEl, 'fade-in', 280);
```

Never call `el.classList.add('some-animation-class')` directly without going through `runMicro` (or a sibling helper for transitions). Direct calls bypass reduced-motion handling and leak `will-change`.

---

## 7. Service worker — precache motion assets at the same version

`motion.css` and `motion.js` are app shell. They must be in the precache `ASSETS` list, and the SW version must bump whenever either file changes. If they fall out of sync — e.g., a new motion.css with classes the old motion.js does not handle — users get broken or invisible animations until the SW updates.

```js
// sw.js
const VERSION = 'v18.8';                    // BUMP when motion.css/js changes
const CACHE = `mvow-${VERSION}`;
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/motion.css',                            // <- add
  '/app.js',
  '/motion.js',                             // <- add
  // ...rest of shell
];
```

Checklist on every motion-related commit:
1. Bumped `VERSION` in `sw.js`.
2. `motion.css` and `motion.js` present in `ASSETS`.
3. Tested on a hard-reload (DevTools → Application → Service Workers → Update on reload) that the new motion is live.

Skipping the version bump = users see stale motion code for hours or days, depending on SW update timing. This is the single most common motion-deployment bug — treat it as part of the animation, not a separate concern.

---

## Summary — the four laws

1. **Compositor-only.** `transform`, `opacity`, `filter`. Nothing else animates.
2. **Three nodes max.** Hit 60fps on SE 2020 or cut the animation.
3. **Promote late, release fast.** `will-change` lives only for the duration of the animation.
4. **Ship motion atomically.** CSS + JS + SW version bump in the same commit.

Break any of these and the app stops feeling like a mentor. It starts feeling like an app.

---

## Why this section exists

A motion system without accessibility is a liability dressed as a feature. brend's identity is "intizom do'sti" — a friend who respects you. A friend doesn't trigger your migraine, strand your keyboard, or yell over a screen reader. Every primitive in this document is built to honor user control first, then aesthetic intent. If those two conflict, control wins.

This section is the contract. No celebration ships without passing these seven gates.

---

## 1. `prefers-reduced-motion` — the master switch

This is the OS-level signal that a user has told their device "I do not want movement." It is not optional, it is not a polish item, it is the law. iOS Settings → Accessibility → Motion. Android Settings → Accessibility → Remove animations. macOS System Settings → Accessibility → Display → Reduce motion. Windows Settings → Accessibility → Visual effects → Animation effects off.

When the flag is on, brend animations do not "play slower." They do not exist. The visual end-state appears instantly. The streak number changes. The card swaps. The dialog is present. No keyframes, no fades, no scale, no translate — instant.

### CSS-level gate (primitive level)

Every primitive's animation block is wrapped or paired with a reduced-motion override that zeroes durations. Put this block once at the top of the motion stylesheet so it is global:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }

  /* Glow primitives become static: keep the end-state, remove the pulse. */
  .glow-pulse,
  .accent-breath,
  .hourglass-grain {
    animation: none !important;
    opacity: var(--glow-rest, 0.22);
  }
}
```

`0.001ms` is preferred over `0s` because some browsers fire `animationend` more reliably when a duration exists, and primitives that hand off state on `animationend` keep working.

### JS-level gate (logic level)

CSS handles visual suppression. JS handles things CSS cannot — confetti canvas loops, `requestAnimationFrame` timelines, audio cues, sequenced reveals. Centralize the check so every primitive reads from one source:

```js
// motion-prefs.js
export const motionPrefs = (() => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = mq.matches;
  const listeners = new Set();

  mq.addEventListener('change', (e) => {
    reduced = e.matches;
    listeners.forEach((fn) => fn());
  });

  return {
    get reduced() { return reduced; },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();

// Usage inside a celebration primitive:
import { motionPrefs } from './motion-prefs.js';

function celebrateStreak(node, newCount) {
  node.textContent = newCount;
  if (motionPrefs.reduced) return; // instant state change, done.
  runConfettiTimeline(node);
}
```

The listener matters. Users toggle this setting mid-session. A primitive that read `mq.matches` once at page load and cached it will betray the user thirty minutes later. Always read through `motionPrefs.reduced`.

---

## 2. Celebration Intensity — user-level granularity

OS reduced-motion is binary. Many users want *some* motion — they like the streak counter ticking up — but find a full confetti burst overstimulating. brend gives them a dial.

**Storage key:** `mvow.motion.intensity`
**Values:** `'minimal' | 'balanced' | 'energetic'`
**Default:** `'balanced'`
**Override:** if `prefers-reduced-motion: reduce` is on, the effective value is forced to `'minimal'` regardless of the stored setting. The stored value is preserved so that turning the OS flag off restores the user's choice.

### Tier definitions

| Tier | Streak tick | Day-complete | Week milestone | Hourglass intro |
|------|-------------|--------------|----------------|-----------------|
| minimal | text swap, no count-up | check icon fade-in | static badge | skipped, end-state only |
| balanced | count-up 600ms | check + soft glow pulse 1× | badge slides in 400ms, glow breath 2× | full play, replay disabled |
| energetic | count-up 800ms + accent flash | check + glow pulse 2× + particle dust | badge + sustained breath + grain shimmer | full play, replay on tap |

### Read helper

```js
// intensity.js
import { motionPrefs } from './motion-prefs.js';

const KEY = 'mvow.motion.intensity';
const VALID = ['minimal', 'balanced', 'energetic'];

export function getIntensity() {
  if (motionPrefs.reduced) return 'minimal';
  const stored = localStorage.getItem(KEY);
  return VALID.includes(stored) ? stored : 'balanced';
}

export function setIntensity(value) {
  if (!VALID.includes(value)) return;
  localStorage.setItem(KEY, value);
  document.documentElement.dataset.motion = value; // lets CSS branch too
  window.dispatchEvent(new CustomEvent('motion:intensity', { detail: value }));
}

// Call once on app boot:
export function initIntensity() {
  document.documentElement.dataset.motion = getIntensity();
  motionPrefs.onChange(() => {
    document.documentElement.dataset.motion = getIntensity();
  });
}
```

CSS can now branch declaratively without JS touching individual nodes:

```css
[data-motion="minimal"] .glow-pulse { animation: none; opacity: 0.18; }
[data-motion="balanced"] .glow-pulse { animation: glowBreath 2400ms ease-in-out 2; }
[data-motion="energetic"] .glow-pulse { animation: glowBreath 2000ms ease-in-out infinite; }
```

### Settings UI — pill segmented control

A radio group is the semantically correct primitive (one of three exclusive choices), but visually rendered as a segmented pill that matches brend's calm aesthetic. Place this in `settings.html` under a "Harakat" / "Motion" group:

```html
<fieldset class="motion-intensity" role="radiogroup" aria-labelledby="motion-label">
  <legend id="motion-label" class="settings-label">
    Bayram jadalligi
    <span class="settings-hint">Tabriklarning kuchi</span>
  </legend>

  <div class="pill-segment">
    <input type="radio" name="motion" id="motion-min" value="minimal">
    <label for="motion-min">Yumshoq</label>

    <input type="radio" name="motion" id="motion-bal" value="balanced" checked>
    <label for="motion-bal">Muvozanat</label>

    <input type="radio" name="motion" id="motion-energ" value="energetic">
    <label for="motion-energ">Jonli</label>
  </div>
</fieldset>
```

```css
.pill-segment {
  display: inline-flex;
  background: var(--void-soft);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 999px;
  padding: 4px;
  gap: 2px;
}
.pill-segment input { position: absolute; opacity: 0; pointer-events: none; }
.pill-segment label {
  padding: 10px 18px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  color: var(--text-mid);
  font: 14px/1 Inter, sans-serif;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease;
}
.pill-segment input:checked + label {
  background: rgba(0, 229, 212, 0.12);
  color: var(--text);
  box-shadow: inset 0 0 0 1px rgba(0, 229, 212, 0.35);
}
.pill-segment input:focus-visible + label {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

```js
import { getIntensity, setIntensity } from './intensity.js';

const group = document.querySelector('.motion-intensity');
const current = getIntensity();
group.querySelector(`input[value="${current}"]`).checked = true;
group.addEventListener('change', (e) => {
  if (e.target.name === 'motion') setIntensity(e.target.value);
});
```

The user sees their choice reflect live — pulse the streak number once on change so the setting *demonstrates itself*. That is the brand promise: identity over abstraction.

---

## 3. `:focus-visible` — keyboard parity

Every interactive element — buttons, links, radios, custom `[role="button"]` divs, the streak card if it is tappable — must show a focus ring under keyboard navigation. The ring is **2px solid var(--accent), offset 2px**. It is suppressed for mouse so pointer users do not see a halo on every click.

Set this once globally and never override per-component:

```css
/* Hide the native ring only when the browser is confident the input is not keyboard. */
:focus:not(:focus-visible) {
  outline: none;
}

/* Universal keyboard focus ring. Override per component ONLY to change offset, never to remove. */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px; /* helps when the element itself has no radius */
}

/* For elements on top of glow — bump contrast with a dark halo behind the ring. */
.on-glow:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(4, 6, 11, 0.85);
}
```

Custom interactive nodes (`<div role="button">`) must also be reachable: `tabindex="0"` and a keydown handler for Enter/Space. If a primitive disables pointer events during a celebration animation, it must also block focus traversal — otherwise the user tabs into an invisible element.

---

## 4. Contrast — glow is never the only signal

WCAG 2.2 SC 1.4.11 (Non-text Contrast, AA) requires UI components and meaningful graphics to hit 3:1 against their adjacent color. brend's accent at 15–25% opacity over `#04060B` does not hit 3:1 by itself. A pulsing glow that conveys "this task is now complete" is therefore a WCAG failure if it is the only change.

**Rule:** every state communicated by a glow must be paired with at least one non-glow signal:

- a text change ("Bajarildi" replacing "Davom etyapsiz")
- an icon swap (outline check → filled check)
- a shape/position change (the card moves to the "done" column)
- an opacity change on a solid element (not just the glow halo)

Concrete example for the day-complete primitive:

```html
<!-- BAD: glow is the only signal -->
<div class="task done"><span class="glow"></span>Ertalabki mashq</div>

<!-- GOOD: glow accompanies a text + icon change -->
<div class="task done" aria-label="Bajarildi: Ertalabki mashq">
  <svg class="icon-check-filled" aria-hidden="true">...</svg>
  <span class="task-title">Ertalabki mashq</span>
  <span class="task-status">Bajarildi</span>
  <span class="glow" aria-hidden="true"></span>
</div>
```

Solid text and icon colors used for state — not the glow — must themselves clear 4.5:1 for body and 3:1 for large text or icons against `--void`. `--text` (#F5F2EC) on `--void` (#04060B) is ~17.5:1, safe. `--text-dim` (#9CA0A8) on `--void` is ~7.8:1, safe for body. `--accent` (#00E5D4) on `--void` is ~10.5:1, safe for icons and large text but **do not** drop accent below ~60% opacity for any element that carries meaning.

---

## 5. Vestibular safety — motion that triggers nausea is banned

Vestibular disorders affect ~35% of adults at some point. Triggers are large translations (>40px), rotation around the Z axis, parallax with high disparity, and rapid scale through >1.5x. These are forbidden in any primitive that fires more than once per week.

**Forbidden in repeat-fire primitives** (streak tick, task complete, day complete, weekly review, every settings save, etc.):

- `translateY` or `translateX` magnitude > 40px
- `rotate(...)`, `rotateZ(...)`, `rotate3d(...,...,1,...)`
- `scale(...)` above 1.3x or below 0.7x
- `perspective(...)` + Z translation combinations
- screen-shake patterns of any kind

**Allowed in repeat-fire primitives:**

- opacity 0 → 1
- scale 0.96 → 1.0 (subtle pop)
- translateY ≤ 8px (sub-card lift)
- color/background fades
- single-direction glow breathing within the rest range

### Hourglass cinematic exception

The hourglass intro is the one place brend allows cinematic motion — large vertical translation, slow rotateZ of grain particles, depth. It earns the exception because:

1. It fires **once on first onboarding**, never on returning sessions unless the user opts back in.
2. It carries a persistent, visible "O'tkazib yuborish" (Skip intro) affordance from the first frame.
3. A settings toggle `mvow.hourglass.replay` defaults to `false`. The user must actively opt in to see it again.
4. With `prefers-reduced-motion: reduce`, the cinematic is bypassed entirely and the end-state hero composition appears instantly — the user never sees a frame of forbidden motion.

```js
import { motionPrefs } from './motion-prefs.js';

function playHourglassIntro() {
  if (motionPrefs.reduced) {
    renderHourglassEndState();
    return;
  }
  const replayAllowed = localStorage.getItem('mvow.hourglass.replay') === 'true';
  const hasSeen = localStorage.getItem('mvow.hourglass.seen') === 'true';
  if (hasSeen && !replayAllowed) {
    renderHourglassEndState();
    return;
  }
  showSkipAffordance(); // visible, focusable, ≥44×44, top-right
  runCinematic().then(() => localStorage.setItem('mvow.hourglass.seen', 'true'));
}
```

The Skip button gets `autofocus` so a keyboard user can dismiss it in one keystroke.

---

## 6. Touch targets — 44×44 minimum, no exceptions

Any element that hosts a tap-to-confirm animation — the streak card, a task checkbox, a "Bajardim" button, an intensity pill, a Skip-intro chip — must have a hit area of at least 44×44 CSS pixels. This is WCAG 2.2 SC 2.5.5 (Target Size, AAA, but treat as floor) and Apple HIG guidance.

A visual element can be smaller than 44×44 as long as the **hit area** clears the floor. Use padding, not margin, to grow the hit area. Use `::before` pseudo-elements to extend invisible touch zones around small icons:

```css
.task-checkbox {
  position: relative;
  width: 24px;
  height: 24px;
  /* Visible box stays 24×24; hit zone is 44×44 via ::before. */
}
.task-checkbox::before {
  content: "";
  position: absolute;
  inset: -10px; /* expands hit area to 44×44 */
}

.intensity-pill label {
  min-height: 44px;
  min-width: 44px;
  padding: 10px 18px; /* yields ≥44×44 even with short labels */
}
```

Two adjacent tap targets must have at least 8px of clear space between hit areas. The tap-to-confirm animation runs on the hit area, not the visible glyph — so a small icon still gets a comfortable celebration zone.

---

## 7. Screen readers — animations are decorative, milestones are announced

A screen-reader user gets nothing from a pulsing glow. They get noise — or worse, repeated announcements — from a poorly marked-up celebration. Two rules:

### Rule A: pure decoration is hidden

Any element that exists only to carry motion or color — `.glow-pulse`, `.accent-breath`, particle canvases, the hourglass grain layer, confetti — gets `aria-hidden="true"`. No screen reader will announce it, no AT will tab to it.

```html
<canvas class="confetti-layer" aria-hidden="true"></canvas>
<span class="glow" aria-hidden="true"></span>
<div class="hourglass-grain" aria-hidden="true"></div>
```

### Rule B: meaningful milestones are announced, once, politely

When a celebration carries information ("7 kunlik silsila", "Hafta yakunlandi", "Maqsad bajarildi"), that text lives in a dedicated live region. Use `aria-live="polite"` (never `assertive` — brend does not interrupt) and `aria-atomic="true"` so the full message reads, not just a diff.

```html
<!-- Single live region near the root of the page. Place once, reuse. -->
<div id="celebration-announcer"
     role="status"
     aria-live="polite"
     aria-atomic="true"
     class="sr-only"></div>
```

```css
/* Visually hidden but read by AT. */
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}
```

```js
function announce(message) {
  const node = document.getElementById('celebration-announcer');
  // Clear then set on next frame so identical consecutive messages re-announce.
  node.textContent = '';
  requestAnimationFrame(() => { node.textContent = message; });
}

// Inside the streak primitive:
function onStreakIncrement(newCount) {
  updateStreakVisually(newCount);
  announce(`Silsila: ${newCount} kun. Davom etmoqdasiz.`);
}
```

The streak number element itself should **not** be `aria-live`. Live regions on persistent UI re-announce on every minor change, including layout reflows in some screen readers. Keep the visible number normal markup, and route the message through the dedicated announcer.

For the visible streak number, mirror the count-up's end-state for AT: set `aria-label` to the final value as soon as the increment starts, so even if a user reads the node mid-animation, they get the truth, not "0… 1… 2…".

```js
streakNode.setAttribute('aria-label', `${newCount} kun`);
runCountUp(streakNode, oldCount, newCount); // visual only
```

---

## Acceptance checklist (every primitive must pass before ship)

- [ ] OS reduced-motion: end-state visible instantly, no animation frames played
- [ ] `mvow.motion.intensity = 'minimal'`: matches reduced-motion behavior
- [ ] Keyboard: element reachable by Tab, focus ring visible, Enter/Space activates
- [ ] Mouse: no focus ring on click
- [ ] Glow change is paired with a text or icon change (1.4.11)
- [ ] No translateY > 40px, no rotateZ, no scale > 1.3x (unless exempt hourglass)
- [ ] Hit area ≥ 44×44, 8px gap from neighbors
- [ ] Decorative nodes carry `aria-hidden="true"`
- [ ] Meaningful milestones route through `#celebration-announcer` with `aria-live="polite"`
- [ ] Contrast: every meaningful color clears 4.5:1 (text) or 3:1 (icons/large text/UI)

A primitive that fails any one of these does not ship. The brand promise — "intizom do'sti" — does not have an asterisk.

---

# Primitives Reference

## QuietConfirm — Micro tier
**Purpose:** Renders a near-silent checkmark stroke and breath of accent glow on a just-completed task, confirming the action without rewarding it loudly.  
**Trigger context:** session-reflection.html on the "Bajardim" button click; routine.html when a routine row is checked off; kechqurun.html when a tomorrow-plan task is marked done; bajarish.html on per-step completion. Fires dozens of times per day across the discipline loop.  
**Duration:** 280ms  

**Psychological rationale:** QuietConfirm is engineered for hedonic adaptation resistance: because task completion fires dozens of times daily, any louder reward (bounce, chime, confetti) would extinguish itself within a week and train users to expect a dopamine hit rather than internalize the identity ("I am someone who keeps promises"). A ~280ms stroke-draw with a barely-visible accent breath sits just above the perceptual floor — the user registers "it counted" without consciously attending to it, which is exactly the regime that supports automaticity and habit consolidation (Lally et al.). The cubic-bezier(0.65, 0, 0.35, 1) draw easing mimics a hand finishing a tick mark — a physical-craft cue that reinforces the "forge / harvest" brand metaphor and frames completion as quiet workmanship rather than performance.

**Usage:**
```html
none
```
```js
MVOW_MOTION.quietConfirm(targetEl);
```

## MilestoneMark — Notable tier
**Purpose:** Reveal a streak milestone (7 / 30 / 100 / 365 days) with a brief overshoot pulse of the number and a soft halo, immediately followed by an identity line, so the moment lands as proof of who the user is becoming rather than a cheer.  
**Trigger context:** home.html DOMContentLoaded — after #streakN is populated, if the current streak value is a milestone (7, 30, 100, 365) AND the day-key flag 'mvow.milestone.shown.YYYY-MM-DD' is not yet set for today's date. Also fires from session-reflection.html on the "Bajardim" handler the first time a streak crosses a milestone threshold (curStreak+1 === 7 || 30 || 100 || 365), before navigating home.  
**Duration:** 700ms  

**Psychological rationale:** MilestoneMark is built around identity formation (James Clear / Festinger): the overshoot-then-settle curve mimics a heartbeat — a body signal — so the streak number registers as proof of self ("Men so'zida turadigan odamman") rather than a score increment, and the identity copy line that fades in afterward names that self explicitly while the pulse is still resolving. The restraint multiplier dims the halo at 30 / 100 / 365 to actively resist hedonic adaptation: each milestone gets quieter, not louder, which prevents the brain from re-baselining on celebration intensity and protects long-horizon adherence. The 700ms total with overshoot easing sits in the "felt but not theatrical" band — long enough to be encoded as a discrete memory marker (~600ms is the lower bound for episodic salience), short enough to stay inside the mentor frame the brand has chosen over warden-style fanfare.

**Usage:**
```html
none
```
```js
MVOW_MOTION.milestoneMark(targetEl);
```

## DayClose — Quiet tier
**Purpose:** A slow exhale transition that closes the day with a single horizon line, framing the evening as completed punctuation rather than a celebration.  
**Trigger context:** kechqurun.html — fires on the "Xayrli tun" CTA (#saveBtn) click before navigation to home.html. Also acceptable on session-reflection.html when the last task of the day is closed (when window.MVOW_STATE?.isLastTaskOfDay === true).  
**Duration:** 1600ms  

**Psychological rationale:** DayClose leans on the Zeigarnik-closure principle: an unfinished day keeps cognitive tabs open and bleeds into sleep onset, so the horizon line acts as an externalized "period at the end of the sentence" that gives the mind permission to release the day's open loops. The 400ms bottom-up exhale matches the natural duration of a relaxed out-breath (parasympathetic cueing), and the 1.2s ease-in-out horizon — appearing softly, holding, then fading — mimics ritual punctuation rather than reward, which protects against hedonic adaptation (a celebratory flash every night would dull within a week, but a calm closing gesture stays meaningful because it carries no escalation). Together they reinforce identity over achievement: "I am someone whose days have shape and end deliberately," not "I won today."

**Usage:**
```html
none
```
```js
MVOW_MOTION.dayClose(targetEl);
```

## AmbientPulse — Ambient tier
**Purpose:** A slow, persistent breathing glow anchored at the bottom of the home screen that turns the interface itself into living evidence of an unbroken 30+ day streak.  
**Trigger context:** home.html — fires on DOMContentLoaded when parseInt(localStorage['mvow.streak']) >= 30. Self-mounts a fixed background element behind all content; persists for the entire visit to the home screen and is the only Ambient-tier effect on that route.  
**Duration:** 12000ms  

**Psychological rationale:** AmbientPulse weaponizes identity formation and hedonic-adaptation resistance: at 30 days the streak has crossed the habit-consolidation threshold (Lally et al.), so the reward must shift from explicit praise ("good job") to environmental signal ("the room itself knows you"). The user does not see a notification — they notice the interface breathing, and attribute it to who they have become, not what they just did, which is the exact mechanism behind durable identity-based behavior change (Clear, Aronson's self-perception). The 12s cycle and breath easing (4-6 breaths/min) deliberately match resting parasympathetic respiration, so the screen entrains calm rather than excitement — countering hedonic adaptation by being *quieter* than the celebration tiers above it, which preserves the contrast that makes Memorable+ moments still hit.

**Usage:**
```html
<!-- AmbientPulse is pure-JS-injected. No markup required on home.html. -->
<!-- To wire it up, add ONE line before </body> on home.html: -->
<!-- <script>window.MVOW_MOTION.AmbientPulse.autoMount();</script> -->

<!-- If you prefer declarative mounting instead of injection, this is the element it creates: -->
<div class="mvw-ambientpulse-glow" aria-hidden="true" data-mvw-motion="ambientpulse"></div>
```
```js
MVOW_MOTION.ambientPulse(targetEl);
```

## RecoveryMoment — Recovery tier
**Purpose:** A slow, judgment-free welcome moment that greets returning users after a multi-day absence with an identity-affirming line, reframing the gap as a fresh opportunity rather than a failure.  
**Trigger context:** home.html DOMContentLoaded — fired once when (Date.now() - parseInt(localStorage['mvow.lastStreakDate'])) >= 172800000 (2 days) AND sessionStorage['mvow.recoveryShown'] is unset. Auto-dismisses after 3500ms or on tap/click anywhere on the overlay.  
**Duration:** 3500ms  

**Psychological rationale:** RecoveryMoment exploits the fresh-start effect (Dai, Milkman & Riis, 2014): people are more likely to re-engage with goals when a temporal landmark — even a self-declared one — separates the lapsed self from the present self. By reframing the absence as "yangi imkoniyat" instead of "you broke your streak," the primitive blocks the shame-spiral pathway that typically causes the "what-the-hell effect" (abandonment after a single slip, Polivy & Herman, 2002) and instead reinforces identity-based motivation: the user is still "someone who shows up," merely returning. The deliberately slow 3.5s pacing with --mvw-ease-out (decelerating) and a 1.4s text fade-rise is calibrated below the threshold of "interruption" but above the threshold of "registered as ritual" — long enough for the parasympathetic response to register safety, short enough to never feel like a guilt-trip lecture; the blur-to-clarity easing physically embodies the mental shift from disorientation to renewed focus.

**Usage:**
```html
none
```
```js
MVOW_MOTION.recoveryMoment(targetEl);
```

## OpeningHourglass — Cinematic tier
**Purpose:** A first-launch identity cinematic that introduces the brand as a "discipline friend" by visualizing time (hourglass), purpose (goal/habit/achievement glyphs), and the wordmark — establishing the user's becoming-self before they ever touch a button.  
**Trigger context:** welcome.html (or whichever screen is the new install entry) on DOMContentLoaded, gated by localStorage 'mvow.motion.introSeen' !== '1'. Also replayable from settings.html via a "Boshlang'ich animatsiyani qayta ko'rish" row that clears the flag and calls window.MVOW_MOTION.openingHourglass() directly.  
**Duration:** 3200ms  

**Psychological rationale:** This primitive seeds identity formation (James Clear / Festinger self-perception): before the user types a goal, the brand visually declares what kind of person uses it — someone whose time (hourglass), practice (book), aim (target), and arrival (sun) are sacred. The 200ms dark hold + 600ms glow rise leverages the orienting reflex so attention is captured without startle, and the 1200ms sand fall is long enough to register as meaningful time passing (chronoception research: ~1s is the threshold where motion reads as "deliberate" vs "twitch"). Total ~3.2s sits in the cinematic-but-not-tedious window that protects against hedonic adaptation on relaunch — the one-shot localStorage flag means this awe-moment is never diluted by repetition, preserving its identity-anchoring weight for the single moment it matters most.

**Usage:**
```html
none
```
```js
MVOW_MOTION.openingHourglass(targetEl);
```
