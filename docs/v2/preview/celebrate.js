'use strict';
/**
 * MvowCelebrate — vazifa bajarilganda KONFETTI + tabrik + yangi medal/daraja.
 *
 * MvowCelebrate.celebrate({ onClose })  — konfetti + tabrik oynasi; medal ochilgan
 *   bo'lsa uni ko'rsatadi (tap bilan yopiladi), aks holda 2.4s da o'zi yopiladi.
 *   onClose — yopilganda chaqiriladi (mas. keyingi sahifaga o'tish).
 *
 * Medal mantig'i sovrinlar.html bilan BIR XIL (nusxa). O'zgartirsangiz ikkalasini ham.
 */
(function (root) {
  function T(k, fb) { return (root.I18N && root.I18N.t) ? root.I18N.t(k, fb) : fb; }
  function lsNum(key) { try { var a = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(a) ? a.length : 0; } catch (e) { return 0; } }
  function isoOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function streakOf(hist) {
    var days = {}; hist.forEach(function (h) { if (h.dateIso) days[h.dateIso] = 1; });
    var d = new Date(); if (!days[isoOf(d)]) d.setDate(d.getDate() - 1);
    var s = 0; while (days[isoOf(d)]) { s++; d.setDate(d.getDate() - 1); } return s;
  }
  function stats() {
    var hist = []; try { if (root.MVOW_DATA && root.MVOW_DATA.getHistory) hist = root.MVOW_DATA.getHistory() || []; } catch (e) {}
    var mins = hist.reduce(function (s, h) { return s + (h.actualMins || 0); }, 0);
    return { sessions: hist.length, focusH: mins / 60, goals: lsNum('mvow.goals'), friends: lsNum('mvow.friends'), streak: streakOf(hist) };
  }
  function medalDefs(s) {
    return [
      { id: 'm1', ic: '🌱', nm: T('sovrinlar.m1_n', 'Birinchi qadam'), ok: s.sessions >= 1 },
      { id: 'm2', ic: '🔥', nm: T('sovrinlar.m2_n', '10 nur'), ok: s.sessions >= 10 },
      { id: 'm3', ic: '⭐', nm: T('sovrinlar.m3_n', '50 nur'), ok: s.sessions >= 50 },
      { id: 'm4', ic: '🏆', nm: T('sovrinlar.m4_n', '100 nur'), ok: s.sessions >= 100 },
      { id: 'm5', ic: '⏳', nm: T('sovrinlar.m5_n', 'Marafon'), ok: s.focusH >= 10 },
      { id: 'm6', ic: '🎯', nm: T('sovrinlar.m6_n', 'Maqsadli'), ok: s.goals >= 1 },
      { id: 'm7', ic: '📅', nm: T('sovrinlar.m7_n', '3 kun'), ok: s.streak >= 3 },
      { id: 'm8', ic: '💪', nm: T('sovrinlar.m8_n', 'Temir iroda'), ok: s.streak >= 7 },
      { id: 'm9', ic: '🤝', nm: T('sovrinlar.m9_n', 'Jamoa'), ok: s.friends >= 1 }
    ];
  }
  var SEEN = 'mvow.medalsSeen';
  function unlocked() { return medalDefs(stats()).filter(function (m) { return m.ok; }); }
  function readSeen() { try { var a = JSON.parse(localStorage.getItem(SEEN) || 'null'); return Array.isArray(a) ? a : null; } catch (e) { return null; } }
  function writeSeen(ids) { try { localStorage.setItem(SEEN, JSON.stringify(ids)); } catch (e) {} }
  // Seed (bir marta): mavjud userlar allaqachon ochilgan medallardan "toshqin" ko'rmasin.
  (function seed() { if (readSeen() === null) writeSeen(unlocked().map(function (m) { return m.id; })); })();
  function newlyUnlocked() {
    var cur = unlocked(); var curIds = cur.map(function (m) { return m.id; });
    var seen = readSeen() || [];
    var fresh = cur.filter(function (m) { return seen.indexOf(m.id) < 0; });
    writeSeen(curIds);
    return fresh;
  }

  // ── Daraja (fokus soatiga qarab) — sovrinlar.html bilan bir xil ──
  var LEVELS = [
    { min: 0, ic: '🥉', uz: 'Bronza', ru: 'Бронза', en: 'Bronze' },
    { min: 10, ic: '🥈', uz: 'Kumush', ru: 'Серебро', en: 'Silver' },
    { min: 30, ic: '🥇', uz: 'Oltin', ru: 'Золото', en: 'Gold' },
    { min: 70, ic: '💠', uz: 'Platina', ru: 'Платина', en: 'Platinum' },
    { min: 150, ic: '👑', uz: 'Olmos', ru: 'Алмаз', en: 'Diamond' }
  ];
  function levelIndex(focusH) { var i = 0; for (var k = 0; k < LEVELS.length; k++) if (focusH >= LEVELS[k].min) i = k; return i; }
  function levelName(lv) { var lang = (root.I18N && root.I18N.lang) ? root.I18N.lang : 'uz'; return lv[lang] || lv.uz; }
  function newLevel() {
    var idx = levelIndex(stats().focusH), seen;
    try { seen = parseInt(localStorage.getItem('mvow.levelSeen'), 10); } catch (e) {}
    if (isNaN(seen)) { try { localStorage.setItem('mvow.levelSeen', String(idx)); } catch (e) {} return null; } // seed
    if (idx > seen) { try { localStorage.setItem('mvow.levelSeen', String(idx)); } catch (e) {} return LEVELS[idx]; }
    return null;
  }

  // ── Duolingo uslubi: 3-7 vazifada bir do'stlarga MAQTOV push (kuniga max 1 marta) ──
  function maybePraise() {
    try {
      var today = isoOf(new Date());
      if (localStorage.getItem('mvow.praiseDay') === today) return;
      var total = (parseInt(localStorage.getItem('mvow.doneTotal'), 10) || 0) + 1;
      localStorage.setItem('mvow.doneTotal', String(total));
      var thr = parseInt(localStorage.getItem('mvow.praiseThreshold'), 10) || 0;
      if (!thr) { thr = 3 + Math.floor(Math.random() * 5); localStorage.setItem('mvow.praiseThreshold', String(thr)); }
      if (total < thr) return;
      localStorage.setItem('mvow.praiseDay', today);
      localStorage.setItem('mvow.doneTotal', '0');
      localStorage.setItem('mvow.praiseThreshold', String(3 + Math.floor(Math.random() * 5)));
      var code = ''; try { if (root.Social && root.Social.myCode) code = root.Social.myCode(); } catch (e) {}
      if (!code) return;
      var name = ''; try { name = localStorage.getItem('mvow.userName') || ''; } catch (e) {}
      var s = stats();
      if (root.fetch) root.fetch('/api/praise', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, name: name, count: s.sessions, streak: s.streak }) }).catch(function () {});
    } catch (e) {}
  }

  // ── Tanga (🪙) va Olmos (💎): har vazifaga 1 tanga; kunlik hamma vazifa bajarilsa 1 olmos ──
  function walNum(k) { try { return parseInt(localStorage.getItem(k), 10) || 0; } catch (e) { return 0; } }
  function walSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  function allTasksDone() {
    try {
      if (!root.MVOW_DATA || !root.MVOW_DATA.getTodayPlan) return false;
      var plan = root.MVOW_DATA.getTodayPlan() || [];
      if (!plan.length) return false;
      var done = root.MVOW_DATA.getCompletedKeysToday ? root.MVOW_DATA.getCompletedKeysToday() : null;
      if (!done) return false;
      for (var i = 0; i < plan.length; i++) {
        var t = plan[i]; if (!t || !t.name) continue;
        var k = t.time ? root.MVOW_DATA.taskKey(root.MVOW_DATA.today.iso, t.time, t.name) : '';
        if (!k || !done.has(k)) return false;
      }
      return true;
    } catch (e) { return false; }
  }
  function awardCoins() {
    var coins = walNum('mvow.coins') + 1; walSet('mvow.coins', coins);
    var gotDiamond = false, today = isoOf(new Date());
    if (allTasksDone() && localStorage.getItem('mvow.diamondDay') !== today) {
      walSet('mvow.diamonds', walNum('mvow.diamonds') + 1);
      try { localStorage.setItem('mvow.diamondDay', today); } catch (e) {}
      gotDiamond = true;
    }
    return { coins: coins, diamonds: walNum('mvow.diamonds'), gotDiamond: gotDiamond };
  }

  // ── KONFETTI + SALYUT (canvas) ──
  function runConfetti(canvas, ms) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width = root.innerWidth, H = canvas.height = root.innerHeight;
    var cols = ['#F4845F', '#6BBF7A', '#E882B4', '#6EB5FF', '#F5C26B', '#ffffff'];
    var P = [];
    // yomg'irsimon tushuvchi konfetti
    for (var i = 0; i < 150; i++) {
      P.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, r: 4 + Math.random() * 6,
        c: cols[i % cols.length], vx: -2 + Math.random() * 4, vy: 2 + Math.random() * 4.5,
        rot: Math.random() * 6.28, vr: -0.25 + Math.random() * 0.5, sq: Math.random() < 0.55 });
    }
    // salyut — 3 markazdan otiladigan portlash
    var bursts = [[W * 0.5, H * 0.32], [W * 0.28, H * 0.42], [W * 0.72, H * 0.42]];
    bursts.forEach(function (b, bi) {
      for (var k = 0; k < 40; k++) {
        var ang = (k / 40) * 6.28, sp = 3 + Math.random() * 4;
        P.push({ x: b[0], y: b[1], r: 3 + Math.random() * 4, c: cols[k % cols.length],
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, rot: 0, vr: 0, sq: Math.random() < 0.5, delay: bi * 220 });
      }
    });
    var start = null, raf;
    function frame(t) {
      if (!start) start = t;
      var el = t - start;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (p.delay && el < p.delay) continue;
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.rot += p.vr; p.vx *= 0.995;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.globalAlpha = 0.9;
        if (p.sq) ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, 6.29); ctx.fill(); }
        ctx.restore();
      }
      if (el < ms) raf = requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    }
    raf = requestAnimationFrame(frame);
    return function () { try { cancelAnimationFrame(raf); ctx.clearRect(0, 0, W, H); } catch (e) {} };
  }

  function celebrate(opts) {
    opts = opts || {};
    var fresh = (opts.checkMedals === false) ? [] : newlyUnlocked();
    var st = stats();
    var lvUp = (opts.checkMedals === false) ? null : newLevel();
    var coin = (opts.checkMedals === false) ? null : awardCoins();
    var big = !!(fresh.length || lvUp || (coin && coin.gotDiamond));
    maybePraise();
    if (typeof document === 'undefined' || !document.body) { if (opts.onClose) opts.onClose(); return; }

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100051;';
    document.body.appendChild(canvas);

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:100050;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(4,6,11,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);padding:28px;text-align:center;opacity:0;transition:opacity .3s;';

    var medalHtml = '';
    if (fresh.length) {
      medalHtml = '<div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">' + fresh.map(function (m) {
        return '<div style="background:linear-gradient(135deg,#F4845F,#d9663c);border-radius:16px;padding:14px 16px;min-width:118px;box-shadow:0 12px 30px rgba(244,132,95,.38);">'
          + '<div style="font-size:42px;line-height:1;">' + m.ic + '</div>'
          + '<div style="font-size:11px;letter-spacing:1px;color:rgba(255,255,255,.85);text-transform:uppercase;margin-top:6px;">' + T('celebrate.new_medal', 'Yangi medal') + '</div>'
          + '<div style="font-size:15px;font-weight:800;color:#fff;margin-top:2px;">' + m.nm + '</div></div>';
      }).join('') + '</div>';
    }
    var streakHtml = (st.streak >= 2) ? '<div style="margin-top:14px;display:inline-flex;align-items:center;gap:8px;background:rgba(244,132,95,.16);border:1px solid rgba(244,132,95,.4);border-radius:999px;padding:8px 16px;font-size:15px;font-weight:700;color:#F4845F;">🔥 ' + st.streak + ' ' + T('celebrate.streak_unit', 'kun ketma-ket') + '</div>' : '';
    var levelHtml = lvUp ? '<div style="margin-top:16px;background:linear-gradient(135deg,rgba(110,181,255,.18),rgba(232,130,180,.12));border:1px solid rgba(110,181,255,.35);border-radius:16px;padding:14px 18px;"><div style="font-size:36px;line-height:1;">' + lvUp.ic + '</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px;">' + levelName(lvUp) + ' ' + T('celebrate.level_up', 'darajasiga chiqdingiz!') + '</div></div>' : '';
    var coinHtml = coin ? '<div style="margin-top:14px;display:inline-flex;align-items:center;gap:6px;background:rgba(245,194,107,.16);border:1px solid rgba(245,194,107,.4);border-radius:999px;padding:8px 16px;font-size:15px;font-weight:700;color:#F5C26B;">+1 🪙 · ' + coin.coins + ' 🪙</div>' : '';
    var diamondHtml = (coin && coin.gotDiamond) ? '<div style="margin-top:16px;background:linear-gradient(135deg,rgba(110,181,255,.22),rgba(200,230,255,.12));border:1px solid rgba(110,181,255,.45);border-radius:16px;padding:14px 18px;"><div style="font-size:40px;line-height:1;">💎</div><div style="font-size:16px;font-weight:800;color:#fff;margin-top:4px;">' + T('celebrate.all_done', 'Hamma vazifa bajarildi!') + ' +1 💎</div></div>' : '';
    var title = fresh.length ? T('celebrate.medal_title', 'Yangi medal ochildi!') : T('celebrate.done_title', "Zo'r! Bajarildi");
    var sub = fresh.length ? T('celebrate.medal_sub', 'Ajoyib natija — davom eting') : T('celebrate.done_sub', 'Yana bir qadam maqsad sari');
    ov.innerHTML = '<div style="font-size:66px;line-height:1;animation:celPop .5s cubic-bezier(.16,.84,.32,1);">🎉</div>'
      + '<div style="font-family:Inter,sans-serif;font-size:26px;font-weight:800;color:#fff;margin-top:10px;">' + title + '</div>'
      + '<div style="font-size:15px;color:#B8BBC2;margin-top:6px;">' + sub + '</div>'
      + streakHtml + coinHtml + levelHtml + diamondHtml + medalHtml
      + '<button id="celClose" type="button" style="margin-top:26px;padding:14px 44px;border:none;border-radius:999px;background:linear-gradient(135deg,#F4845F,#d9663c);color:#fff;font-size:16px;font-weight:700;letter-spacing:1px;cursor:pointer;font-family:Inter,sans-serif;">' + T('celebrate.continue', 'Davom') + '</button>';

    if (!document.getElementById('celKeyframes')) {
      var st = document.createElement('style'); st.id = 'celKeyframes';
      st.textContent = '@keyframes celPop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}';
      document.head.appendChild(st);
    }
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.style.opacity = '1'; });

    var stopC = runConfetti(canvas, big ? 4200 : 2600);
    try { if (root.navigator && root.navigator.vibrate) root.navigator.vibrate(big ? [40, 60, 40] : 30); } catch (e) {}

    var closed = false;
    function close() {
      if (closed) return; closed = true;
      try { stopC(); } catch (e) {}
      ov.style.opacity = '0';
      setTimeout(function () { try { ov.remove(); } catch (e) {} try { canvas.remove(); } catch (e) {} if (opts.onClose) opts.onClose(); }, 320);
    }
    var cb = ov.querySelector('#celClose'); if (cb) cb.addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    if (!big) setTimeout(close, 2400);   // medal/daraja yo'q — o'zi yopiladi
    return close;
  }

  root.MvowCelebrate = { celebrate: celebrate, newlyUnlocked: newlyUnlocked, stats: stats };
})(typeof window !== 'undefined' ? window : this);
