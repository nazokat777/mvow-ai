'use strict';
/**
 * Focus AI — Timestamp asosidagi taymer yadrosi (TZ 4.1).
 *
 * Manba haqiqati = { accumulatedMs, runningSince } timestamp'lari.
 * elapsed = accumulatedMs + (ishlayotgan bo'lsa: now - runningSince).
 * setInterval sanog'iga TAYANMAYDI — ilova yopilsa, yangilansa yoki
 * telefon uxlasa ham vaqt aniq qoladi (now bilan qayta hisoblanadi).
 *
 * UMD: Node (require) + brauzer (window.FocusTimer) da ishlaydi.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.FocusTimer = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  function create(goalMs) {
    return { accumulatedMs: 0, runningSince: null, goalMs: goalMs, done: false };
  }

  function isRunning(s) {
    return s.runningSince !== null && s.runningSince !== undefined;
  }

  // Clamp'siz xom o'tgan vaqt (manfiy bo'lmaydi)
  function rawElapsed(s, now) {
    var e = s.accumulatedMs + (isRunning(s) ? (now - s.runningSince) : 0);
    return e < 0 ? 0 : e;
  }

  // Ko'rsatish uchun o'tgan vaqt — maqsaddan oshmaydi
  function elapsed(s, now) {
    var e = rawElapsed(s, now);
    return (s.goalMs != null && e > s.goalMs) ? s.goalMs : e;
  }

  function start(s, now) {
    if (s.done || isRunning(s)) return s; // tugagan yoki ishlayotgan bo'lsa — reset yo'q
    return Object.assign({}, s, { runningSince: now });
  }

  function pause(s, now) {
    if (!isRunning(s)) return s;
    var acc = s.accumulatedMs + Math.max(0, now - s.runningSince);
    if (s.goalMs != null && acc > s.goalMs) acc = s.goalMs;
    return Object.assign({}, s, { accumulatedMs: acc, runningSince: null });
  }

  function finish(s, now) {
    var paused = isRunning(s) ? pause(s, now) : s;
    return Object.assign({}, paused, { done: true, runningSince: null });
  }

  function progress(s, now) {
    if (!s.goalMs) return 0;
    var p = elapsed(s, now) / s.goalMs;
    return p < 0 ? 0 : (p > 1 ? 1 : p);
  }

  function isComplete(s, now) {
    return s.goalMs != null && rawElapsed(s, now) >= s.goalMs;
  }

  return {
    create: create,
    start: start,
    pause: pause,
    finish: finish,
    elapsed: elapsed,
    isRunning: isRunning,
    progress: progress,
    isComplete: isComplete
  };
});
