/*
 * brend Motion System — v1.0
 * Primitive API surface under window.MVOW_MOTION
 */
(function () {
  window.MVOW_MOTION = window.MVOW_MOTION || {};

  // Intensity helper — read user preference
  window.MVOW_MOTION._getIntensity = function () {
    try {
      const v = localStorage.getItem('mvow.motion.intensity');
      if (v === 'minimal' || v === 'balanced' || v === 'energetic') return v;
    } catch {}
    return 'balanced';
  };

  // Reduced motion check
  window.MVOW_MOTION._reducedMotion = function () {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  };

  // Streak helper
  window.MVOW_MOTION._getStreak = function () {
    try { return parseInt(localStorage.getItem('mvow.streak') || '0', 10) || 0; } catch { return 0; }
  };

  // Days since last streak date (for RecoveryMoment)
  window.MVOW_MOTION._daysSinceStreak = function () {
    try {
      const d = localStorage.getItem('mvow.lastStreakDate');
      if (!d) return 0;
      const last = new Date(d + 'T00:00:00');
      const today = new Date();
      const diff = Math.floor((today - last) / 86400000);
      return Math.max(0, diff);
    } catch { return 0; }
  };

  // ===== QuietConfirm (Micro) =====
  /**
   * QuietConfirm — Micro tier
   * Plays a near-silent check + accent breath on the given element.
   *
   * @param {HTMLElement} target  Element to host the confirmation (e.g. the Bajardim button or task row).
   * @param {Object} [opts]
   * @param {boolean} [opts.autoExit=true]  Fade the mark out after a brief hold.
   * @param {number}  [opts.holdMs=520]     How long to hold the mark before exit (only if autoExit).
   * @returns {Promise<void>} Resolves when the motion (including optional exit) completes.
   */
  window.MVOW_MOTION.quietConfirm = function (target, opts) {
    opts = opts || {};
    var autoExit = opts.autoExit !== false;
    var holdMs = typeof opts.holdMs === 'number' ? opts.holdMs : 520;

    return new Promise(function (resolve) {
      if (!target || !(target instanceof Element)) { resolve(); return; }

      var intensity = (window.MVOW_MOTION._getIntensity && window.MVOW_MOTION._getIntensity()) || 'balanced';
      var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Tier policy:
      // - Micro tier: NEVER skipped entirely. Reduced-motion still shows a static accent dot
      //   (handled in CSS via @media), so the user sees confirmation without animation.
      // - 'minimal' intensity skip rule only applies to Notable+ tiers — Micro still plays.

      // GPU hint
      target.style.willChange = 'transform, opacity, filter';

      // Inject the mark (single <span> wrapping an inline SVG)
      var mark = document.createElement('span');
      mark.className = 'mvw-quietconfirm-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.innerHTML =
        '<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
          '<path d="M3.5 9.5 L7.5 13.5 L14.5 5.5" />' +
        '</svg>';

      target.classList.add('mvw-quietconfirm-host');
      target.appendChild(mark);

      var done = false;
      var safetyTimer = null;
      var exitTimer = null;

      function cleanup() {
        if (done) return;
        done = true;
        if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
        if (exitTimer)   { clearTimeout(exitTimer);   exitTimer   = null; }
        // Remove injected DOM + class state
        if (mark && mark.parentNode === target) {
          target.removeChild(mark);
        }
        target.classList.remove('mvw-quietconfirm-host');
        target.classList.remove('mvw-quietconfirm-leaving');
        target.style.willChange = '';
        resolve();
      }

      function startExit() {
        if (done) return;
        // Trigger fade-out via class — listens to animationend on the mark
        target.classList.add('mvw-quietconfirm-leaving');

        var onExitEnd = function (e) {
          if (e.target !== mark) return;
          mark.removeEventListener('animationend', onExitEnd);
          cleanup();
        };
        mark.addEventListener('animationend', onExitEnd);

        // Safety net: longest possible exit ~ micro duration + 80ms slack
        safetyTimer = setTimeout(cleanup, 280 + 80);
      }

      // Wait for the draw-in to finish (animationend on the mark's path or container)
      var onEnterEnd = function (e) {
        // The mark itself has the fade animation; path has the draw. Either one ending is fine,
        // but we wait for the mark container (the slower of the two) to ensure both are done.
        if (e.target !== mark) return;
        mark.removeEventListener('animationend', onEnterEnd);

        if (!autoExit) {
          // Leave the mark visible — caller will clean up manually via mvw-quietconfirm-leaving
          cleanup();
          return;
        }

        // Hold briefly, then exit
        exitTimer = setTimeout(startExit, holdMs);
      };
      mark.addEventListener('animationend', onEnterEnd);

      // Safety net: draw is ~280ms; allow extra slack for slow devices
      safetyTimer = setTimeout(function () {
        if (done) return;
        mark.removeEventListener('animationend', onEnterEnd);
        if (autoExit) {
          exitTimer = setTimeout(startExit, Math.max(0, holdMs - 40));
        } else {
          cleanup();
        }
      }, 280 + 120);

      // Reduced-motion shortcut: CSS already shows static state.
      // Resolve quickly so callers (e.g. row-removal) don't stall.
      if (prefersReduce) {
        if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
        mark.removeEventListener('animationend', onEnterEnd);
        exitTimer = setTimeout(function () {
          // Mirror the visual: brief static hold, then remove
          if (mark && mark.parentNode === target) target.removeChild(mark);
          target.classList.remove('mvw-quietconfirm-host');
          target.style.willChange = '';
          if (!done) { done = true; resolve(); }
        }, autoExit ? 140 : 0);
      }
    });
  };

  // ===== MilestoneMark (Notable) =====
  /**
   * MilestoneMark — Notable tier
   * Streak milestone reveal: number overshoot pulse + halo + identity line.
   *
   * @param {HTMLElement} numberEl  The element showing the streak number (e.g. #streakN).
   * @param {Object} [opts]
   * @param {number} [opts.streak]         The streak count just reached (7|30|100|365).
   * @param {string} [opts.identityCopy]   Identity sentence rendered below the number.
   * @param {HTMLElement} [opts.identityMount]  Optional explicit mount for the identity line;
   *                                            defaults to inserting after numberEl's parent.
   * @returns {Promise<void>}              Resolves when motion has fully settled (or skipped).
   */
  window.MVOW_MOTION.milestoneMark = function milestoneMark(numberEl, opts) {
    opts = opts || {};
    const TIER = 'Notable';
    const DURATION = 700;       // pulse + halo
    const IDENTITY_DELAY = 360; // matches CSS animation-delay
    const IDENTITY_DUR = 420;
    const SAFETY_MS = DURATION + IDENTITY_DELAY + IDENTITY_DUR + 120; // buffer for animationend miss

    if (!numberEl || !(numberEl instanceof HTMLElement)) {
      return Promise.resolve();
    }

    // ── Skip rules ────────────────────────────────────────────────────────────
    const intensity = (window.MVOW_MOTION._getIntensity && window.MVOW_MOTION._getIntensity()) || 'balanced';
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 'minimal' intensity skips all Notable+ motion entirely.
    if (intensity === 'minimal') {
      return Promise.resolve();
    }

    // Notable tier still flashes a static end-state under reduced-motion (does NOT skip entirely
    // — that rule applies to Memorable+). CSS @media block handles the static reveal.

    // ── Restraint multiplier (hedonic adaptation resistance) ─────────────────
    const streak = (typeof opts.streak === 'number' && opts.streak) ||
                   parseInt((localStorage.getItem('mvow.streak') || '0'), 10);
    let restraint = 1;
    if (streak >= 365)      restraint = 0.35;
    else if (streak >= 100) restraint = 0.50;
    else if (streak >= 30)  restraint = 0.75;
    else                    restraint = 1.00; // 7-day

    // ── Build DOM (wrap number, inject halo, inject identity) ────────────────
    // Preserve original parent so cleanup can fully restore.
    const originalText = numberEl.textContent;
    const host = document.createElement('span');
    host.className = 'mvw-milestonemark-host';

    const pulse = document.createElement('span');
    pulse.className = 'mvw-milestonemark-pulse';
    pulse.textContent = originalText;

    const halo = document.createElement('span');
    halo.className = 'mvw-milestonemark-halo';
    halo.setAttribute('aria-hidden', 'true');
    if (restraint < 1) {
      halo.setAttribute('data-restraint', '');
      halo.style.setProperty('--mvw-mm-restraint', String(restraint));
    }

    host.appendChild(halo);
    host.appendChild(pulse);

    // Swap the number content for the host (keep the parent layout intact).
    numberEl.textContent = '';
    numberEl.appendChild(host);

    // Identity line — mounts after numberEl's nearest block parent unless an
    // explicit mount is given.
    const identityCopy = (opts.identityCopy || '').trim();
    let identityEl = null;
    if (identityCopy) {
      identityEl = document.createElement('div');
      identityEl.className = 'mvw-milestonemark-identity';
      identityEl.textContent = identityCopy;
      const mount = opts.identityMount || numberEl.parentElement;
      if (mount && mount.parentElement) {
        mount.parentElement.insertBefore(identityEl, mount.nextSibling);
      } else if (mount) {
        mount.appendChild(identityEl);
      }
    }

    // ── will-change before, remove after ─────────────────────────────────────
    pulse.style.willChange = 'transform';
    halo.style.willChange  = 'opacity, filter';
    if (identityEl) identityEl.style.willChange = 'opacity, transform';

    return new Promise((resolve) => {
      let settled = false;
      let pulseDone = false;
      let identityDone = !identityEl;

      const cleanup = () => {
        if (settled) return;
        settled = true;
        // Drop will-change to release the compositor layer.
        pulse.style.willChange = '';
        halo.style.willChange  = '';
        if (identityEl) identityEl.style.willChange = '';

        // Restore the original number element to a plain text node — leave the
        // identity line in place (it's now permanent screen content) unless the
        // caller asked us to inject + remove it. We keep it; callers that want
        // it transient can remove via opts.identityMount handling.
        try {
          numberEl.textContent = originalText;
        } catch (_) { /* node may have been detached by navigation */ }

        resolve();
      };

      const tryFinish = () => {
        if (pulseDone && identityDone) cleanup();
      };

      const onPulseEnd = (e) => {
        if (e.target !== pulse) return;
        pulse.removeEventListener('animationend', onPulseEnd);
        pulseDone = true;
        tryFinish();
      };
      const onIdentityEnd = (e) => {
        if (!identityEl || e.target !== identityEl) return;
        identityEl.removeEventListener('animationend', onIdentityEnd);
        identityDone = true;
        tryFinish();
      };

      pulse.addEventListener('animationend', onPulseEnd);
      if (identityEl) identityEl.addEventListener('animationend', onIdentityEnd);

      // Safety net — guarantees resolution even if animationend never fires
      // (tab backgrounded, element removed mid-flight, etc.).
      setTimeout(cleanup, SAFETY_MS);

      // Under reduced motion the CSS skips the animation entirely → no
      // animationend will fire. Resolve on the next frame so callers aren't
      // stuck waiting on the safety net.
      if (reduced) {
        requestAnimationFrame(() => {
          pulseDone = true;
          identityDone = true;
          tryFinish();
        });
      }
    });
  };

  // ===== DayClose (Quiet) =====
  window.MVOW_MOTION.dayClose = function dayClose(opts) {
    opts = opts || {};
    var target = opts.target || document.querySelector('.wrap') || document.body;
    var TIER = 'Quiet';

    return new Promise(function (resolve) {
      var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var intensity = (window.MVOW_MOTION._getIntensity && window.MVOW_MOTION._getIntensity()) || 'balanced';

      // Quiet tier: never skipped by reduced-motion (only Memorable+ skips entirely)
      // Quiet tier: never skipped by 'minimal' intensity (only Notable+ skips entirely)
      // Both modes still render the static closed state for the line.

      var horizon = document.createElement('div');
      horizon.className = 'mvw-dayclose-horizon';
      horizon.setAttribute('aria-hidden', 'true');

      var settled = { viewport: false, horizon: false };
      var safetyTimer = null;
      var resolved = false;

      function cleanup() {
        if (resolved) return;
        resolved = true;
        if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
        target.classList.remove('mvw-dayclose-viewport');
        target.style.willChange = '';
        if (horizon && horizon.parentNode) {
          horizon.parentNode.removeChild(horizon);
        }
        resolve();
      }

      function maybeFinish() {
        if (settled.viewport && settled.horizon) cleanup();
      }

      // Prep GPU hint up-front
      target.style.willChange = 'opacity, transform';
      target.classList.add('mvw-dayclose-viewport');
      document.body.appendChild(horizon);

      if (prefersReduced) {
        // Reduced-motion fallback: show closed state, then fade horizon out.
        settled.viewport = true;
        setTimeout(function () {
          horizon.classList.add('mvw-dayclose-horizon--fade');
          horizon.addEventListener('transitionend', function onEnd() {
            horizon.removeEventListener('transitionend', onEnd);
            settled.horizon = true;
            maybeFinish();
          }, { once: true });
          safetyTimer = setTimeout(function () {
            settled.horizon = true;
            maybeFinish();
          }, 900);
        }, 350);
        return;
      }

      function onViewportEnd(e) {
        if (e.animationName !== 'mvw-dayclose-exhale') return;
        target.removeEventListener('animationend', onViewportEnd);
        settled.viewport = true;
        maybeFinish();
      }
      function onHorizonEnd(e) {
        if (e.animationName !== 'mvw-dayclose-horizon') return;
        horizon.removeEventListener('animationend', onHorizonEnd);
        settled.horizon = true;
        maybeFinish();
      }

      target.addEventListener('animationend', onViewportEnd);
      horizon.addEventListener('animationend', onHorizonEnd);

      // Safety net — total motion budget is 1600ms; give 1000ms buffer.
      safetyTimer = setTimeout(cleanup, 2600);
    });
  };

  // ===== AmbientPulse (Ambient) =====
  window.MVOW_MOTION.AmbientPulse = (function () {
  const TIER = 'Ambient';
    const STREAK_THRESHOLD = 30;
    const DURATION_MS = 12000;
    const GLOW_CLASS = 'mvw-ambientpulse-glow';
    const ACTIVE_CLASS = 'is-active';

    function getStreak() {
      try {
        return parseInt(localStorage.getItem('mvow.streak') || '0', 10) || 0;
      } catch (e) {
        return 0;
      }
    }

    function getIntensity() {
      if (window.MVOW_MOTION && typeof window.MVOW_MOTION._getIntensity === 'function') {
        return window.MVOW_MOTION._getIntensity();
      }
      return 'balanced';
    }

    function prefersReducedMotion() {
      try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) {
        return false;
      }
    }

    function mountGlow() {
      let el = document.querySelector('.' + GLOW_CLASS);
      if (!el) {
        el = document.createElement('div');
        el.className = GLOW_CLASS;
        el.setAttribute('aria-hidden', 'true');
        el.dataset.mvwMotion = 'ambientpulse';
        // Insert at the very top of <body> so it sits behind everything
        if (document.body.firstChild) {
          document.body.insertBefore(el, document.body.firstChild);
        } else {
          document.body.appendChild(el);
        }
      }
      return el;
    }

    function cleanup(el) {
      if (!el) return;
      el.classList.remove(ACTIVE_CLASS);
      el.style.willChange = 'auto';
      if (el.dataset.mvwMotion === 'ambientpulse' && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }

    /**
     * Run AmbientPulse.
     * Returns a Promise that resolves when motion completes (one full breath cycle)
     * or when the primitive is skipped / cleaned up.
     *
     * @param {Object} [opts]
     * @param {boolean} [opts.persistent=true]  Loop indefinitely while on screen.
     * @param {HTMLElement} [opts.container]    Optional mount target (defaults to <body>).
     */
    function run(opts) {
      opts = opts || {};
      const persistent = opts.persistent !== false;

      return new Promise(function (resolve) {
        // --- Guard 1: streak threshold ---
        if (getStreak() < STREAK_THRESHOLD) {
          resolve({ ran: false, reason: 'streak-below-threshold' });
          return;
        }

        const intensity = getIntensity();
        const reduced = prefersReducedMotion();

        // --- Guard 2: intensity = minimal ---
        // Rule: skip entirely if intensity is 'minimal' AND tier is Notable+.
        // Ambient is below Notable, so we still mount a static, dim glow.
        // We honor the brand request explicitly: "MUST disable on ... celebrationIntensity = minimal."
        if (intensity === 'minimal') {
          resolve({ ran: false, reason: 'intensity-minimal' });
          return;
        }

        // --- Guard 3: reduced motion ---
        // Rule: skip entirely if reduced-motion AND tier is Memorable+.
        // Ambient < Memorable, so we mount a static glow (no animation) as a quiet presence.
        const el = mountGlow();

        if (reduced) {
          // Static state only — CSS @media already neutralizes animation.
          // We still resolve immediately; the glow stays as a static backdrop.
          resolve({ ran: true, reduced: true, static: true });
          return;
        }

        // Dial opacity ceiling down for 'energetic' = leave default; for 'balanced' = default.
        // (No upward push — Ambient must remain unobtrusive.)
        if (intensity === 'energetic') {
          el.style.setProperty('--mvw-ambientpulse-peak', '0.16');
        }

        // Apply will-change BEFORE animation starts
        el.style.willChange = 'transform, opacity, filter';

        // Kick off animation on next frame so will-change is honored
        requestAnimationFrame(function () {
          el.classList.add(ACTIVE_CLASS);
        });

        let settled = false;
        function settle(reason) {
          if (settled) return;
          settled = true;
          if (!persistent) {
            el.removeEventListener('animationend', onEnd);
            cleanup(el);
          } else {
            // Persistent: drop will-change after first cycle to free GPU memory,
            // but leave the element + animation running.
            el.style.willChange = 'auto';
          }
          resolve({ ran: true, reason: reason });
        }

        function onEnd() {
          settle('animationend');
        }

        el.addEventListener('animationend', onEnd, { once: !persistent });

        // Safety net: resolve after one full cycle even if animationend never fires
        // (e.g. tab backgrounded, infinite animation, browser quirk).
        setTimeout(function () {
          settle('timeout-safety');
        }, DURATION_MS + 500);
      });
    }

    // Self-mount: when home.html loads, call AmbientPulse.run() automatically.
    function autoMount() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { run(); }, { once: true });
      } else {
        run();
      }
    }

    return {
      tier: TIER,
      durationMs: DURATION_MS,
      run: run,
      autoMount: autoMount,
      _cleanup: function () {
        const el = document.querySelector('.' + GLOW_CLASS);
        cleanup(el);
      }
    };
  })();

  // Auto-mount on home screen only (caller can also invoke manually):
  //   window.MVOW_MOTION.AmbientPulse.autoMount();

  // ===== RecoveryMoment (Recovery) =====
  window.MVOW_MOTION.recoveryMoment = function (opts) {
    opts = opts || {};
    var lang = opts.lang || (document.documentElement.lang || 'uz').toLowerCase().slice(0, 2);

    var COPY = {
      uz: { title: 'Xush kelibsiz.', sub: 'Bugun yangi imkoniyat',  hint: 'Davom etish uchun bosing' },
      ru: { title: 'С возвращением.', sub: 'Сегодня новая возможность', hint: 'Нажмите, чтобы продолжить' },
      en: { title: 'Welcome back.',   sub: 'Today is a new opportunity', hint: 'Tap to continue' }
    };
    var copy = COPY[lang] || COPY.uz;

    return new Promise(function (resolve) {
      // Recovery tier: never blocked by intensity gates (it is emotional, not decorative)
      // Reduced-motion: tier is Recovery (< Memorable), so we still show static state.
      var intensity = (window.MVOW_MOTION._getIntensity && window.MVOW_MOTION._getIntensity()) || 'balanced';

      // Build DOM
      var overlay = document.createElement('div');
      overlay.className = 'mvw-recoverymoment-overlay';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');

      var line = document.createElement('div');
      line.className = 'mvw-recoverymoment-line';

      var title = document.createElement('h2');
      title.className = 'mvw-recoverymoment-title';
      title.textContent = copy.title + ' ' + copy.sub.split(' ').slice(0, 0).join('');
      // Keep two-part copy: italic line + small label
      title.textContent = copy.title;

      var sub = document.createElement('p');
      sub.className = 'mvw-recoverymoment-sub';
      sub.textContent = copy.sub;

      var hint = document.createElement('p');
      hint.className = 'mvw-recoverymoment-hint';
      hint.textContent = copy.hint;

      overlay.appendChild(line);
      overlay.appendChild(title);
      overlay.appendChild(sub);
      overlay.appendChild(hint);
      document.body.appendChild(overlay);

      // will-change applied via CSS classes already; ensure GPU promotion
      overlay.style.willChange = 'opacity';
      title.style.willChange = 'opacity, transform, filter';
      sub.style.willChange = 'opacity, transform';

      var TOTAL_MS = 3500;
      var EXIT_MS  = 450;
      var resolved = false;
      var dismissTimer = null;
      var safetyTimer  = null;

      function cleanup() {
        if (resolved) return;
        resolved = true;
        if (dismissTimer) clearTimeout(dismissTimer);
        if (safetyTimer)  clearTimeout(safetyTimer);
        overlay.removeEventListener('click', onTap);
        overlay.removeEventListener('touchstart', onTap);
        overlay.removeEventListener('animationend', onExitEnd);

        // strip will-change before removal
        overlay.style.willChange = 'auto';
        title.style.willChange   = 'auto';
        sub.style.willChange     = 'auto';

        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve();
      }

      function onExitEnd(e) {
        if (e.target !== overlay) return;
        if (e.animationName === 'mvw-recoverymoment-overlay-exit') cleanup();
      }

      function dismiss() {
        // Trigger exit animation
        overlay.classList.add('mvw-recoverymoment-exit');
        overlay.addEventListener('animationend', onExitEnd);
        // Safety net in case animationend never fires (reduced-motion, bg tab)
        safetyTimer = setTimeout(cleanup, EXIT_MS + 200);
      }

      function onTap() {
        if (resolved) return;
        if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
        dismiss();
      }

      overlay.addEventListener('click', onTap);
      overlay.addEventListener('touchstart', onTap, { passive: true });

      // Auto-dismiss timer
      dismissTimer = setTimeout(dismiss, TOTAL_MS);

      // Mark shown so we don't re-fire on this session
      try { sessionStorage.setItem('mvow.recoveryShown', String(Date.now())); } catch (_) {}
    });
  };

  // ===== OpeningHourglass (Cinematic) =====
  window.MVOW_MOTION.openingHourglass = function openingHourglass(opts) {
    opts = opts || {};
    var FORCE = opts.force === true;
    var FLAG_KEY = 'mvow.motion.introSeen';

    return new Promise(function (resolve) {
      // Settings gate (skip if already seen, unless force-replay from settings)
      try {
        if (!FORCE && localStorage.getItem(FLAG_KEY) === '1') { resolve('skipped:seen'); return; }
      } catch (e) { /* localStorage may be unavailable */ }

      // Intensity gate — Cinematic is highest tier, but 'minimal' still skips.
      var intensity = 'balanced';
      try {
        if (typeof window.MVOW_MOTION._getIntensity === 'function') {
          intensity = window.MVOW_MOTION._getIntensity() || 'balanced';
        }
      } catch (e) {}
      if (intensity === 'minimal') {
        try { localStorage.setItem(FLAG_KEY, '1'); } catch (e) {}
        resolve('skipped:minimal');
        return;
      }

      // Reduced motion: Cinematic = Memorable+, so skip entirely (per spec)
      var prefersReduced = false;
      try {
        prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) {}
      if (prefersReduced) {
        try { localStorage.setItem(FLAG_KEY, '1'); } catch (e) {}
        resolve('skipped:reduced-motion');
        return;
      }

      // ---------- Build DOM ----------
      var stage = document.createElement('div');
      stage.className = 'mvw-openinghourglass-stage';
      stage.setAttribute('role', 'img');
      stage.setAttribute('aria-label', 'brend — sizning intizom do\'stingiz');

      var frame = document.createElement('div');
      frame.className = 'mvw-openinghourglass-frame';

      // Glowing hourglass SVG (inline, no external assets)
      var glow = document.createElement('div');
      glow.className = 'mvw-openinghourglass-glow';
      glow.innerHTML = [
        '<svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
          '<path d="M14 8 H66 M14 92 H66" stroke="#d4af37" stroke-width="3" stroke-linecap="round"/>',
          '<path d="M18 8 L40 50 L18 92 Z" stroke="#d4af37" stroke-width="2.2" stroke-linejoin="round" fill="rgba(212,175,55,0.06)"/>',
          '<path d="M62 8 L40 50 L62 92 Z" stroke="#d4af37" stroke-width="2.2" stroke-linejoin="round" fill="rgba(212,175,55,0.06)"/>',
          '<circle cx="40" cy="50" r="1.6" fill="#d4af37"/>',
        '</svg>'
      ].join('');
      frame.appendChild(glow);

      // Sand particles (6 dots)
      var SAND_COUNT = 6;
      var sands = [];
      for (var i = 0; i < SAND_COUNT; i++) {
        var s = document.createElement('div');
        s.className = 'mvw-openinghourglass-sand';
        s.setAttribute('data-i', String(i));
        // tiny horizontal jitter so the stream feels organic
        var jitterX = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3));
        s.style.marginLeft = jitterX + 'px';
        frame.appendChild(s);
        sands.push(s);
      }

      // 3 icon ghosts — target / book / sun (goals / habits / achievements)
      var ghosts = document.createElement('div');
      ghosts.className = 'mvw-openinghourglass-ghosts';

      var iconSVGs = [
        // target — goals
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>' +
          '<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.6"/>' +
          '<circle cx="12" cy="12" r="1.6" fill="currentColor"/>' +
        '</svg>',
        // book — habits
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<path d="M4 5 C8 4 11 5 12 6 C13 5 16 4 20 5 V19 C16 18 13 19 12 20 C11 19 8 18 4 19 Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
          '<path d="M12 6 V20" stroke="currentColor" stroke-width="1.2"/>' +
        '</svg>',
        // sun — achievements
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/>' +
          '<path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M4.9 19.1 L7 17 M17 7 L19.1 4.9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
        '</svg>'
      ];

      for (var g = 0; g < 3; g++) {
        var gh = document.createElement('div');
        gh.className = 'mvw-openinghourglass-ghost';
        gh.setAttribute('data-i', String(g));
        gh.innerHTML = iconSVGs[g];
        ghosts.appendChild(gh);
      }
      frame.appendChild(ghosts);

      // Wordmark
      var word = document.createElement('div');
      word.className = 'mvw-openinghourglass-wordmark';
      word.textContent = 'brend';
      frame.appendChild(word);

      stage.appendChild(frame);

      // will-change setup (GPU props only)
      stage.style.willChange = 'opacity';
      glow.style.willChange = 'transform, opacity, filter';
      word.style.willChange = 'transform, opacity';

      document.body.appendChild(stage);

      // ---------- Lifecycle ----------
      var finished = false;
      var safetyTimer = null;
      var fadeTimer = null;

      function cleanup(reason) {
        if (finished) return;
        finished = true;
        if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
        if (fadeTimer)   { clearTimeout(fadeTimer);   fadeTimer = null; }
        stage.removeEventListener('click', onSkip, true);
        stage.removeEventListener('touchstart', onSkip, true);
        stage.removeEventListener('keydown', onKey, true);
        word.removeEventListener('animationend', onWordEnd);
        // strip will-change
        stage.style.willChange = '';
        glow.style.willChange = '';
        word.style.willChange = '';
        // remove DOM
        if (stage.parentNode) stage.parentNode.removeChild(stage);
        try { localStorage.setItem(FLAG_KEY, '1'); } catch (e) {}
        resolve(reason || 'complete');
      }

      function beginFadeOut(reason) {
        if (finished) return;
        stage.setAttribute('data-fading', '1');
        // stage-out duration ~ var(--mvw-dur-m) = 500ms
        fadeTimer = setTimeout(function () { cleanup(reason); }, 560);
      }

      function onWordEnd(ev) {
        if (ev.target !== word) return;
        // small hold (~200ms) so the wordmark reads, then fade
        setTimeout(function () { beginFadeOut('complete'); }, 200);
      }

      function onSkip() { beginFadeOut('skipped:tap'); }
      function onKey(ev) {
        if (ev.key === 'Escape' || ev.key === 'Enter' || ev.key === ' ') {
          beginFadeOut('skipped:key');
        }
      }

      word.addEventListener('animationend', onWordEnd);
      stage.addEventListener('click', onSkip, true);
      stage.addEventListener('touchstart', onSkip, true);
      stage.tabIndex = -1;
      document.addEventListener('keydown', onKey, true);

      // Safety net: full sequence ~3200ms + fade 560ms = 3760ms; pad to 4200ms
      safetyTimer = setTimeout(function () { beginFadeOut('safety-timeout'); }, 4200);
    });
  };
})();
