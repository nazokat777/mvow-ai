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
      tagline: "sizning intizom do'stingiz",
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
  // TODAY KEY + WEEK PLAN STORAGE (yangi API)
  // ──────────────────────────────────────────────────────────────
  // MUHIM: vaqt zonasi bug'i tuzatildi.
  // Avval new Date().toISOString().slice(0,10) ishlatardik — bu UTC sanani qaytaradi.
  // UTC+5 (Tashkent)'da local 03:00 = UTC 22:00 oldingi kun → bir kun orqada.
  // Endi LOCAL sanani ishlatamiz, hamma joyda izchil.
  DATA.localDateIso = function (d) {
    d = d || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  };
  DATA.today.iso = DATA.localDateIso();
  DATA.today.key = 'd' + DATA.today.iso;

  DATA.getWeekPlan = function () {
    try {
      const w = JSON.parse(localStorage.getItem('mvow.weekPlan') || '{}');
      return (w && typeof w === 'object') ? w : {};
    } catch { return {}; }
  };
  DATA.setWeekPlan = function (w) {
    localStorage.setItem('mvow.weekPlan', JSON.stringify(w));
  };
  DATA.getTodayPlan = function () {
    const w = DATA.getWeekPlan();
    let tasks = Array.isArray(w[DATA.today.key]) ? [...w[DATA.today.key]] : [];
    // Backward compat: eski versiyalarda UTC sana kalit ostida saqlangan bo'lishi mumkin
    // Agar UTC iso local iso'dan farq qilsa va u erda ma'lumot bo'lsa, qo'shamiz
    const utcIso = new Date().toISOString().slice(0, 10);
    if (utcIso !== DATA.today.iso) {
      const utcKey = 'd' + utcIso;
      if (Array.isArray(w[utcKey])) {
        for (const t of w[utcKey]) {
          if (!tasks.some(x => x.time === t.time && x.name === t.name)) {
            tasks.push(t);
          }
        }
      }
    }
    return tasks;
  };
  DATA.setTodayPlan = function (arr) {
    const w = DATA.getWeekPlan();
    w[DATA.today.key] = arr;
    DATA.setWeekPlan(w);
    // Eski API uchun ham (backward compat)
    localStorage.setItem('mvow.todayPlan', JSON.stringify(arr));
  };

  // Davomiylik daqiqaga aylantirish
  DATA.parseDurMins = function (durStr) {
    if (!durStr) return 60;
    const s = String(durStr).toLowerCase();
    const h = s.match(/(\d+(?:\.\d+)?)\s*s(oat)?/);
    const m = s.match(/(\d+)\s*d(aq)?/);
    let total = 0;
    if (h) total += Math.round(parseFloat(h[1]) * 60);
    if (m) total += parseInt(m[1], 10);
    if (!h && !m) {
      const n = parseInt(s, 10);
      if (!isNaN(n)) total = n;
    }
    return total || 60;
  };

  // ──────────────────────────────────────────────────────────────
  // TARIX (HISTORY) — bajarilgan ishlar ro'yxati
  // Format: [{ name, plannedTime, plannedDur, dateIso, startedAt, completedAt, actualMins, withTimer }]
  // ──────────────────────────────────────────────────────────────
  DATA.getHistory = function () {
    try {
      const h = JSON.parse(localStorage.getItem('mvow.history') || '[]');
      return Array.isArray(h) ? h : [];
    } catch { return []; }
  };
  DATA.addHistory = function (entry) {
    // dateIso ni har doim local sanaga to'g'irlash (entry kelganda noto'g'ri bo'lishi mumkin)
    if (entry && !entry.dateIso) entry.dateIso = DATA.today.iso;
    const list = DATA.getHistory();
    list.push(entry);
    localStorage.setItem('mvow.history', JSON.stringify(list));
    return entry;
  };
  // Tugallangan ishlarni today-plan'da belgilash uchun unique key
  // Format: "d2026-06-12|07:00|Sport"
  DATA.taskKey = function (dateIso, time, name) {
    return 'd' + dateIso + '|' + (time || '') + '|' + (name || '');
  };
  // Bugungi tugallangan task'larning unique key'lari (Set)
  DATA.getCompletedKeysToday = function () {
    const today = DATA.today.iso;
    const utcIso = new Date().toISOString().slice(0, 10);
    const acceptedDates = (utcIso === today) ? [today] : [today, utcIso];
    return new Set(DATA.getHistory()
      .filter(h => acceptedDates.includes(h.dateIso))
      .map(h => DATA.taskKey(today, h.plannedTime, h.name))
    );
  };

  // ── TASK STATE — har bir ish uchun: askCount, snoozeUntil, status ──
  // status: 'pending' | 'done' | 'missed'
  DATA.getTaskState = function (taskKey) {
    try {
      const all = JSON.parse(localStorage.getItem('mvow.taskState') || '{}');
      return all[taskKey] || { askCount: 0, snoozeUntil: 0, status: 'pending' };
    } catch { return { askCount: 0, snoozeUntil: 0, status: 'pending' }; }
  };
  DATA.setTaskState = function (taskKey, partial) {
    let all = {};
    try { all = JSON.parse(localStorage.getItem('mvow.taskState') || '{}'); } catch {}
    const prev = all[taskKey] || { askCount: 0, snoozeUntil: 0, status: 'pending' };
    all[taskKey] = Object.assign({}, prev, partial);
    localStorage.setItem('mvow.taskState', JSON.stringify(all));
    return all[taskKey];
  };

  // So'rash uchun navbatdagi ishlar — vaqti o'tgan, bajarilmagan, snooze tugagan
  // opts.final = true → kun yakunida hammasini ko'rsatadi (askCount cheklovsiz)
  DATA.getPendingAsks = function (opts) {
    opts = opts || {};
    const plan = DATA.getTodayPlan();
    const completed = DATA.getCompletedKeysToday();
    const todayIso = DATA.today.iso;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nowTs = Date.now();
    const result = [];
    for (const t of plan) {
      const m = (t.time || '').match(/^(\d{1,2}):(\d{2})$/);
      if (!m) continue;
      const startMin = (+m[1]) * 60 + (+m[2]);
      const durMin = DATA.parseDurMins(t.dur);
      if (nowMin < startMin + durMin) continue; // vaqti o'tmagan
      const key = DATA.taskKey(todayIso, t.time, t.name);
      if (completed.has(key)) continue;
      const state = DATA.getTaskState(key);
      if (state.status === 'done' || state.status === 'missed') continue;
      if (!opts.final) {
        if (state.askCount >= 3) continue;
        if (state.snoozeUntil && state.snoozeUntil > nowTs) continue;
      }
      result.push({ task: t, key, state });
    }
    return result;
  };

  // Tashqaridan chaqirish uchun: Ha (done) — history'ga ham qo'shiladi
  DATA.markTaskDone = function (task, taskKey, note) {
    DATA.setTaskState(taskKey, { status: 'done' });
    const m = (task.time || '').match(/^(\d{1,2}):(\d{2})$/);
    let startedAt = Date.now();
    if (m) {
      const d = new Date();
      d.setHours(+m[1], +m[2], 0, 0);
      startedAt = d.getTime();
    }
    const durMin = DATA.parseDurMins(task.dur);
    DATA.addHistory({
      name: task.name || 'Ish',
      plannedTime: task.time || '',
      plannedDur: task.dur || '',
      dateIso: DATA.today.iso,
      startedAt,
      completedAt: Date.now(),
      actualMins: durMin,
      withTimer: false,
      note: (note || '').trim()
    });
    const todayKey = 'mvow.done.' + DATA.today.iso;
    const cur = parseInt(localStorage.getItem(todayKey) || '0', 10);
    localStorage.setItem(todayKey, String(cur + 1));
  };
  DATA.markTaskMissed = function (taskKey) {
    DATA.setTaskState(taskKey, { status: 'missed' });
  };
  DATA.snoozeTask = function (taskKey, minutes) {
    const state = DATA.getTaskState(taskKey);
    DATA.setTaskState(taskKey, {
      askCount: (state.askCount || 0) + 1,
      snoozeUntil: Date.now() + minutes * 60000
    });
  };
  DATA.bumpAskCount = function (taskKey) {
    const state = DATA.getTaskState(taskKey);
    DATA.setTaskState(taskKey, { askCount: (state.askCount || 0) + 1 });
  };

  // ── XULQ-ATVOR MODELI: kun, soat, naqshlar tahlili ──
  DATA.getBehaviorStats = function () {
    const history = DATA.getHistory();
    const w = DATA.getWeekPlan();
    const weekdays = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];
    const byDay = Array(7).fill(0).map(() => ({ done: 0, planned: 0 }));
    const byHour = Array(24).fill(0); // bajarilgan ishlar soati bo'yicha
    const todayDate = new Date(); todayDate.setHours(0,0,0,0);

    for (const key of Object.keys(w)) {
      if (!Array.isArray(w[key])) continue;
      const iso = key.slice(1);
      const d = new Date(iso); if (isNaN(d)) continue;
      if (d > todayDate) continue; // kelajak emas
      const wd = d.getDay();
      byDay[wd].planned += w[key].length;
      const dayHistory = history.filter(h => h.dateIso === iso);
      byDay[wd].done += dayHistory.length;
    }
    for (const h of history) {
      const t = (h.plannedTime || '').match(/^(\d{1,2}):/);
      if (t) byHour[+t[1]]++;
    }

    const dayStats = byDay.map((s, i) => ({
      day: weekdays[i],
      shortDay: ['Yak','Du','Se','Ch','Pa','Ju','Sh'][i],
      completion: s.planned > 0 ? Math.round((s.done / s.planned) * 100) : null,
      planned: s.planned,
      done: s.done
    })).filter(s => s.completion !== null);

    if (!dayStats.length) return null;
    const sorted = [...dayStats].sort((a,b) => b.completion - a.completion);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const avg = Math.round(dayStats.reduce((s,x) => s + x.completion, 0) / dayStats.length);

    // Eng sermahsul vaqt oralig'i
    let peakHour = -1, peakCount = 0;
    for (let i = 0; i < 24; i++) {
      if (byHour[i] > peakCount) { peakCount = byHour[i]; peakHour = i; }
    }
    const peakRange = peakHour >= 0
      ? (String(peakHour).padStart(2,'0') + ':00–' + String((peakHour + 2) % 24).padStart(2,'0') + ':00')
      : null;

    return { best, worst, avg, peakRange, dayStats, totalDone: history.length };
  };

  // Joriy task — foydalanuvchining saqlangan rejasidan
  DATA.currentTaskFromPlan = function () {
    const plan = DATA.getTodayPlan();
    if (!plan.length) return null;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (const s of plan) {
      const m = (s.time || '00:00').match(/^(\d{1,2}):(\d{2})$/);
      if (!m) continue;
      const sm = (+m[1]) * 60 + (+m[2]);
      const durMin = DATA.parseDurMins(s.dur);
      if (nowMin >= sm && nowMin < sm + durMin) return s;
    }
    const upcoming = plan.find(s => {
      const m = (s.time || '00:00').match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return false;
      return ((+m[1]) * 60 + (+m[2])) > nowMin;
    });
    return upcoming || plan[0];
  };

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

  // ──────────────────────────────────────────────────────────────
  // BILDIRISHNOMA — uyg'onish budilnigi (real notification)
  // ──────────────────────────────────────────────────────────────

  // Brauzer ruxsatini so'rash (foydalanuvchi tugma bossa)
  DATA.requestNotifPermission = async function () {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied')  return 'denied';
    try {
      const res = await Notification.requestPermission();
      return res;
    } catch {
      return 'denied';
    }
  };

  // Joriy taymer (sahifa ochiq bo'lganda ishlaydi)
  let _alarmTimer = null;

  // Uyg'onish vaqtini hisoblash — keyingi marta qachon
  function nextAlarmTime(wakeTime) {
    if (!wakeTime) return null;
    const [h, m] = wakeTime.split(':').map(n => parseInt(n, 10));
    if (isNaN(h) || isNaN(m)) return null;
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    // Agar vaqt o'tib ketgan bo'lsa, ertaga
    if (target <= now) target.setDate(target.getDate() + 1);
    return target;
  }

  // Bildirishnomani aniq ko'rsatish (service worker orqali — eng ishonchli)
  async function fireAlarm() {
    const title = "Uyg'on";
    const body  = "Vaqt keldi. Misolni yeching.";
    const opts = {
      body,
      icon: 'assets/mnsm-logo.png',
      badge: 'assets/mnsm-logo.png',
      vibrate: [500, 200, 500, 200, 500],
      tag: 'wake-alarm',
      requireInteraction: true,
      data: { url: 'alarm.html' }
    };
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          reg.showNotification(title, opts);
          return;
        }
      }
      // Fallback — oddiy Notification (sahifa tomonida)
      const n = new Notification(title, opts);
      n.onclick = (e) => {
        e.preventDefault();
        try { window.focus(); } catch {}
        // Alarm sahifasi'dagi bo'lmasa, o'tkazamiz
        if (!location.pathname.endsWith('alarm.html')) {
          window.location.href = 'alarm.html';
        }
        n.close();
      };
    } catch (e) {
      console.warn('Alarm yuborilmadi:', e);
    }
  }

  // Uyg'onish vaqtini rejalashtir (sahifa ochiq bo'lsa ishlaydi)
  DATA.scheduleAlarm = function () {
    if (_alarmTimer) { clearTimeout(_alarmTimer); _alarmTimer = null; }
    const enabled = localStorage.getItem('mvow.alarmOn') !== '0';
    if (!enabled) return;
    const wakeTime = localStorage.getItem('mvow.wakeTime') || '07:00';
    if (Notification.permission !== 'granted') return;
    const target = nextAlarmTime(wakeTime);
    if (!target) return;
    const delay = target - Date.now();
    if (delay <= 0 || delay > 24 * 3600 * 1000) return;
    _alarmTimer = setTimeout(() => {
      fireAlarm();
      // Ertangi kun uchun qayta rejalash
      setTimeout(() => DATA.scheduleAlarm(), 60 * 1000);
    }, delay);
    // Debug: console.log('Alarm', Math.round(delay / 60000), 'daqiqada');
  };

  // Test — darrov yuborish (settings'da test tugmasi uchun)
  DATA.testNotification = async function () {
    const perm = await DATA.requestNotifPermission();
    if (perm !== 'granted') return perm;
    await fireAlarm();
    return 'sent';
  };

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

  function onReady() {
    applyBindings();
    // Har sahifa yuklanganda alarm avtomatik rejalanadi (ruxsat berilgan bo'lsa)
    try { DATA.scheduleAlarm(); } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // Service worker'dan kelgan navigatsiya so'rovlarini eshitish
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'mvow.navigate' && e.data.url) {
        try { window.location.href = e.data.url; } catch {}
      }
    });
  }

  // Global'ga ochish — boshqa skriptlar (per-screen) ham foydalanishi uchun
  window.MVOW_DATA = DATA;
})();
