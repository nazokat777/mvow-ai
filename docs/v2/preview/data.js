/**
 * M·VoW — DATA: bitta haqiqat manbai (single source of truth).
 * Sana, ishlar ro'yxati, raqamlar, brend — hammasi shu yerda.
 * Har sahifa shu fayldan o'qiydi. nav-overlay.js'dan AVVAL yuklanadi.
 *
 * Kelajakda: bu obyektni Kotlin'ga `data class MvowData(...)` ko'chirish oson.
 */
(function () {
  'use strict';

  const SESSIONS = [
    { time: '06:00', name: 'Tongi mashq',       dur: '45 daq',   mins:  45, meta: '☾ TONGGI',          status: 'done',     severity: 'normal' },
    { time: '07:00', name: "Til o'rganish",     dur: '1 soat',   mins:  60, meta: '▦ CHUQUR FOKUS',    status: 'current',  severity: 'max'    },
    { time: '10:00', name: 'Onlayn dars',       dur: '2 soat',   mins: 120, meta: '↗ ONLINE · ZOOM',   status: 'upcoming', severity: 'normal' },
    { time: '13:00', name: 'Loyiha · kod',      dur: '1.5 soat', mins:  90, meta: '◆ POMODORO · 3 SIKL', status: 'upcoming', severity: 'normal' },
    { time: '15:00', name: 'Kitob · mutolaa',   dur: '45 daq',   mins:  45, meta: '▥ JIM OʻQISH',      status: 'upcoming', severity: 'normal' }
  ];

  const focusMins = SESSIONS.reduce((s, x) => s + x.mins, 0);

  function fmtHM(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h} soat ${m} daq`;
    if (h)      return `${h} soat`;
    return `${m} daq`;
  }

  const DATA = {
    brand: {
      // Vaqtincha placeholder — haqiqiy nom keyin shu yerda yangilanadi
      // va butun ilov bo'ylab avtomatik tarqaladi.
      name:    'brend',
      tagline: "sening intizom do'sting",
      monogram:'',
      by:      ''
    },

    // today — joriy sanadan jonli to'ldiriladi (pastda)
    today: {
      date:    '',
      weekday: '',
      week:    0,
      monthYear: '',
      label:   ''
    },

    sessions: SESSIONS,

    totals: {
      sessions:   SESSIONS.length,
      focusMins:  focusMins,
      focusLabel: fmtHM(focusMins),
      doneCount:  SESSIONS.filter(s => s.status === 'done').length,
      currentIdx: SESSIONS.findIndex(s => s.status === 'current')
    },

    // Demo ssenariy — 12-kun tajribali foydalanuvchi
    week: {
      progress: { done: 4, target: 5 },
      focusHours: 24,
      sessionCount: 30,
      change: '+18%',
      days: [4.5, 5.0, 4.0, 3.5, 5.0, 2.0, 0]   // Du..Yak — bugungidan keyingilari 0
    },

    streak: 12,

    permissions: {
      granted:  0,
      required: 2,
      remaining: function () { return this.required - this.granted; }
    },

    chains: [
      { name: 'Tongi mashq',        days: 14 },
      { name: "Til o'rganish",      days: 12 },
      { name: 'Mutolaa',            days:  8 }
    ]
  };

  // ──────────────────────────────────────────────────────────────
  // SANA — joriy sanani markaziy joydan tarqatish
  // ──────────────────────────────────────────────────────────────
  (function fillToday() {
    const monShort = ['YAN','FEV','MAR','APR','MAY','JUN','IYU','AVG','SEN','OKT','NOY','DEK'];
    const monFull  = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentyabr','Oktyabr','Noyabr','Dekabr'];
    const dayShort = ['YAKSHANBA','DUSHANBA','SESHANBA','CHORSHANBA','PAYSHANBA','JUMA','SHANBA'];
    const d = new Date();
    DATA.today.date      = String(d.getDate()).padStart(2, '0') + '-' + monShort[d.getMonth()];
    DATA.today.weekday   = dayShort[d.getDay()];
    DATA.today.monthYear = monFull[d.getMonth()] + ' ' + d.getFullYear();
    DATA.today.label     = DATA.today.date + ' · ' + DATA.today.weekday;
    // ISO hafta soni
    const t = new Date(d.valueOf());
    t.setHours(0,0,0,0);
    t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
    const w = new Date(t.getFullYear(), 0, 4);
    DATA.today.week = 1 + Math.round(((t - w) / 86400000 - 3 + ((w.getDay() + 6) % 7)) / 7);
  })();

  // Derived helpers — tez murojaat uchun
  DATA.firstSession   = () => SESSIONS[0];
  DATA.lastSession    = () => SESSIONS[SESSIONS.length - 1];
  DATA.currentSession = () => SESSIONS.find(s => s.status === 'current');
  DATA.permLabel      = () => `${DATA.permissions.granted} / ${DATA.permissions.required} RUXSAT BERILDI`;
  DATA.weekProgressLabel = () => `${DATA.week.progress.done} / ${DATA.week.progress.target} BAJARILDI`;

  // ──────────────────────────────────────────────────────────────
  // PROFIL — localStorage'dan foydalanuvchi haqida ma'lumot
  // (ism, bio, yosh, jins, ish, niyat) → individual yondashuv uchun.
  // ──────────────────────────────────────────────────────────────
  function loadProfile() {
    try {
      const p = JSON.parse(localStorage.getItem('mvow.profile') || '{}');
      return {
        name:   localStorage.getItem('mvow.userName') || '',
        bio:    localStorage.getItem('mvow.userBio')  || '',
        age:    p.age || '',
        gender: p.gender || '',
        job:    p.job || '',
        aim:    p.aim || ''
      };
    } catch { return { name:'', bio:'', age:'', gender:'', job:'', aim:'' }; }
  }
  DATA.profile = loadProfile();

  // ──────────────────────────────────────────────────────────────
  // HAPTIC + AUDIO — sodda feedback (Android'da vibratsiya, hammasida bip)
  // ──────────────────────────────────────────────────────────────
  DATA.vibrate = function (pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern || 30);
    } catch {}
  };

  // Web Audio API orqali sodda bip (fayl yuklamaymiz)
  let _audioCtx = null;
  function getAudioCtx() {
    if (_audioCtx) return _audioCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    _audioCtx = new AC();
    return _audioCtx;
  }
  DATA.beep = function (opts) {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const o = Object.assign({ freq: 880, dur: 0.12, type: 'sine', vol: 0.18 }, opts || {});
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = o.type;
      osc.frequency.value = o.freq;
      gain.gain.value = o.vol;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(o.vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + o.dur);
      osc.start(t);
      osc.stop(t + o.dur);
    } catch {}
  };
  // Standart preset'lar
  DATA.fxSuccess = () => { DATA.vibrate(20); DATA.beep({ freq: 1320, dur: 0.10 }); };
  DATA.fxError   = () => { DATA.vibrate([60, 50, 60]); DATA.beep({ freq: 220, dur: 0.18, type: 'square', vol: 0.12 }); };
  DATA.fxFinish  = () => { DATA.vibrate([40, 60, 40, 60, 80]); DATA.beep({ freq: 880, dur: 0.12 }); setTimeout(() => DATA.beep({ freq: 1320, dur: 0.18 }), 120); };
  DATA.fxTap     = () => { DATA.vibrate(8); };

  // Yoshga qarab murabbiy ohangi (juda oddiy individual yondashuv)
  DATA.toneByAge = () => {
    const a = parseInt(DATA.profile.age, 10);
    if (!a) return 'umumiy';
    if (a < 20) return 'do\'stona';
    if (a < 35) return 'tenglik';
    return 'hurmat';
  };

  // ──────────────────────────────────────────────────────────────
  // BINDING — sahifa yuklanganda data-mvow / data-brand slotlarini to'ldiradi.
  // ──────────────────────────────────────────────────────────────
  function resolve(path, root) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), root);
  }

  function applyBindings() {
    // <title>{brand} — X</title> — sahifa nomida {brand} placeholder'ni almashtir
    if (document.title.includes('{brand}')) {
      document.title = document.title.replace(/\{brand\}/g, DATA.brand.name);
    }

    // data-brand="name|tagline|monogram|by"
    document.querySelectorAll('[data-brand]').forEach(el => {
      const v = DATA.brand[el.dataset.brand];
      // Bo'sh qiymat (masalan brand.by='') bo'lsa, butun elementni yashiramiz
      if (v === '' || v == null) {
        el.style.display = 'none';
      } else {
        el.textContent = v;
        el.style.display = '';
      }
    });

    // data-mvow="today.label", "totals.sessions", "totals.focusLabel", "streak", h.k.
    document.querySelectorAll('[data-mvow]').forEach(el => {
      const path = el.dataset.mvow;
      let v = resolve(path, DATA);
      if (typeof v === 'function') v = v.call(DATA);
      if (v != null) el.textContent = v;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBindings);
  } else {
    applyBindings();
  }

  // Global'ga ochish — boshqa skriptlar (per-screen) ham foydalanishi uchun
  window.MVOW_DATA = DATA;
})();
