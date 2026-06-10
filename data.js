/**
 * M·VoW — DATA: bitta haqiqat manbai (single source of truth).
 * Sana, ishlar ro'yxati, raqamlar, brend, profil — hammasi shu yerda.
 */
(function () {
  'use strict';

  const SESSIONS = [
    { time: '04:00', name: "Qur'on darsi",      dur: '2 soat',   mins: 120, meta: '☾ TONGGI',           status: 'done',     severity: 'normal' },
    { time: '06:20', name: 'Arab grammatikasi', dur: '1 soat',   mins:  60, meta: '▦ CHUQUR FOKUS',    status: 'current',  severity: 'max'    },
    { time: '10:00', name: 'SMM darslari',      dur: '2 soat',   mins: 120, meta: '↗ ONLINE · ZOOM',   status: 'upcoming', severity: 'normal' },
    { time: '13:00', name: 'Loyiha · kod',      dur: '1.5 soat', mins:  90, meta: '◆ POMODORO',        status: 'upcoming', severity: 'normal' },
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
      name:    'brend',
      tagline: "sening intizom do'sting",
      monogram:'',
      by:      ''
    },

    today: {
      date:    '10-MAY',
      weekday: 'DUSHANBA',
      week:    19,
      label:   '10-MAY · DUSHANBA'
    },

    sessions: SESSIONS,

    totals: {
      sessions:   SESSIONS.length,
      focusMins:  focusMins,
      focusLabel: fmtHM(focusMins),
      doneCount:  SESSIONS.filter(s => s.status === 'done').length,
      currentIdx: SESSIONS.findIndex(s => s.status === 'current')
    },

    week: {
      progress: { done: 4, target: 5 },
      focusHours: 38,
      sessionCount: 38,
      change: '+12%',
      days: [5.5, 7.2, 6.0, 5.0, 8.0, 4.0, 2.0]
    },

    streak: 12,

    permissions: {
      granted:  0,
      required: 2,
      remaining: function () { return this.required - this.granted; }
    },

    chains: [
      { name: 'Bomdod ibodati',    days: 14 },
      { name: "Qur'on darsi",      days: 12 },
      { name: 'Arab grammatikasi', days:  8 }
    ]
  };

  DATA.firstSession   = () => SESSIONS[0];
  DATA.lastSession    = () => SESSIONS[SESSIONS.length - 1];
  DATA.currentSession = () => SESSIONS.find(s => s.status === 'current');
  DATA.permLabel      = () => `${DATA.permissions.granted} / ${DATA.permissions.required} RUXSAT BERILDI`;
  DATA.weekProgressLabel = () => `${DATA.week.progress.done} / ${DATA.week.progress.target} BAJARILDI`;

  // PROFIL — localStorage'dan foydalanuvchi haqida ma'lumot
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

  DATA.toneByAge = () => {
    const a = parseInt(DATA.profile.age, 10);
    if (!a) return 'umumiy';
    if (a < 20) return 'do\'stona';
    if (a < 35) return 'tenglik';
    return 'hurmat';
  };

  // BINDING
  function resolve(path, root) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), root);
  }

  function applyBindings() {
    if (document.title.includes('{brand}')) {
      document.title = document.title.replace(/\{brand\}/g, DATA.brand.name);
    }
    document.querySelectorAll('[data-brand]').forEach(el => {
      const v = DATA.brand[el.dataset.brand];
      if (v === '' || v == null) {
        el.style.display = 'none';
      } else {
        el.textContent = v;
        el.style.display = '';
      }
    });
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

  window.MVOW_DATA = DATA;
})();
