'use strict';
/**
 * Focus AI — statistika yordamchisi (streak + heatmap). Sof mantiq, testlanadi.
 * UMD: Node (test) + brauzer (window.FocusStats).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.FocusStats = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function toIso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function shift(iso, days) { var d = fromIso(iso); d.setDate(d.getDate() + days); return toIso(d); }

  // Ketma-ket faol kunlar. Bugun bo'lmasa ham kecha bo'lsa — davom etadi (grace).
  function currentStreak(dates, today) {
    var set = {}; for (var i = 0; i < dates.length; i++) set[dates[i]] = true;
    var cur;
    if (set[today]) cur = today;
    else { var y = shift(today, -1); if (set[y]) cur = y; else return 0; }
    var n = 0;
    while (set[cur]) { n++; cur = shift(cur, -1); }
    return n;
  }

  // Oxirgi N hafta katakchalari (GitHub uslubidagi heatmap uchun).
  function heatmap(dates, today, weeks) {
    weeks = weeks || 12;
    var set = {}; for (var i = 0; i < dates.length; i++) set[dates[i]] = true;
    var cells = [], total = weeks * 7, start = shift(today, -(total - 1));
    for (var j = 0; j < total; j++) { var iso = shift(start, j); cells.push({ iso: iso, active: !!set[iso] }); }
    return cells;
  }

  return { currentStreak: currentStreak, heatmap: heatmap, toIso: toIso };
});
