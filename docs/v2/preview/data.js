/**
 * M·VoW — DATA: bitta haqiqat manbai (single source of truth).
 * Sana, ishlar ro'yxati, raqamlar, Daywarden — hammasi shu yerda.
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
      name:    'Daywarden',
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
      { name: 'Tongi mashq',        days: 14, hours: 12 },
      { name: "Til o'rganish",      days: 12, hours: 18 },
      { name: 'Mutolaa',            days:  8, hours:  6 }
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

    // Backward compat 1: eski UTC-ostidagi yozuvlar
    if (tasks.length === 0) {
      const utcIso = new Date().toISOString().slice(0, 10);
      if (utcIso !== DATA.today.iso) {
        const utcKey = 'd' + utcIso;
        if (Array.isArray(w[utcKey])) {
          for (const t of w[utcKey]) tasks.push(t);
        }
      }
    }

    // Backward compat 2: kechagi local kun (UTC offset bug saqlash paytida)
    if (tasks.length === 0) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = 'd' + DATA.localDateIso(yesterday);
      if (Array.isArray(w[yKey])) {
        for (const t of w[yKey]) {
          if (t.goalId) tasks.push(t);
        }
      }
    }

    // ENG MUHIM FALLBACK: hech narsa topilmasa, MAQSADLARDAN to'g'ridan-to'g'ri hosil qilish
    // — agar maqsadning startDate'i bugundan oldin va davom etayotgan davrida
    // YANGI: har maqsad sessions[] bo'yicha bir nechta task'ga yoyilishi mumkin
    if (tasks.length === 0) {
      try {
        const goals = (typeof DATA.loadGoals === 'function')
          ? DATA.loadGoals()
          : JSON.parse(localStorage.getItem('mvow.goals') || '[]');
        if (Array.isArray(goals) && goals.length) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          for (const g of goals) {
            if (!g || !g.startDate) continue;
            const start = new Date(g.startDate);
            if (isNaN(start.getTime())) continue;
            start.setHours(0, 0, 0, 0);
            const daysSince = Math.floor((today - start) / 86400000);
            const totalDays = g.days || 30;
            if (daysSince >= 0 && daysSince < totalDays) {
              // Bu maqsad bugun ham davom etmoqda — sessions bo'yicha tarqatish
              const sessions = (Array.isArray(g.sessions) && g.sessions.length)
                ? g.sessions
                : [{ sid: 's1', time: g.time || '07:00', dur: g.dur || '60 daq' }];
              for (const s of sessions) {
                tasks.push({
                  time: s.time || g.time || '07:00',
                  name: g.text || 'Reja',
                  dur:  s.dur  || g.dur  || '60 daq',
                  goalId: g.id,
                  sessionSid: s.sid
                });
              }
            }
          }
          // Agar maqsadlardan reja qo'shildi bo'lsa — weekPlan'ga ham saqlab qo'yish
          // (keyingi safar getTodayPlan tez topish uchun)
          if (tasks.length > 0) {
            w[DATA.today.key] = [...tasks];
            DATA.setWeekPlan(w);
          }
        }
      } catch (err) {
        // sukut
      }
    }

    return tasks;
  };

  // ── ONE-TIME MIGRATION: eski UTC-asosli weekPlan kalit'larini local'ga ko'chirish ──
  // Foydalanuvchi maqsad qo'ygan, lekin yozuvlar bir kun siljishi sababli ko'rinmaslik mumkin.
  // Migratsiya: maqsadlar bo'yicha weekPlan'ni qayta hosil qilish (faqat goalId bor yozuvlar).
  DATA.migrateGoalsToLocalDates = function () {
    if (localStorage.getItem('mvow.localDateMigration_v2') === 'done') return;
    try {
      const goals = JSON.parse(localStorage.getItem('mvow.goals') || '[]');
      if (Array.isArray(goals) && goals.length > 0) {
        const w = DATA.getWeekPlan();
        // Eski goalId yozuvlarini olib tashlash (manual qo'shilgan ad-hoc reja'lar saqlab qolinadi)
        for (const key of Object.keys(w)) {
          if (!Array.isArray(w[key])) continue;
          w[key] = w[key].filter(t => !t.goalId);
          if (w[key].length === 0) delete w[key];
        }
        // Maqsadlardan yangi tarqatish (local sanalar bilan)
        // YANGI: sessions[] bo'yicha har kun uchun bir nechta task chiqaramiz
        for (const g of goals) {
          if (!g || !g.startDate) continue;
          const start = new Date(g.startDate);
          if (isNaN(start.getTime())) continue;
          const totalDays = g.days || 30;
          // Sessions'ni aniqlash — agar yo'q bo'lsa, eski (time,dur)'dan sintez
          const sessions = (Array.isArray(g.sessions) && g.sessions.length)
            ? g.sessions
            : [{ sid: 's1', time: g.time || '07:00', dur: g.dur || '60 daq' }];
          for (let i = 0; i < totalDays; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = 'd' + DATA.localDateIso(d);
            if (!Array.isArray(w[key])) w[key] = [];
            for (const s of sessions) {
              // Dublikat yo'q — sessionSid bo'yicha (legacy uchun goalId bilan ham)
              const exists = w[key].some(t => t.goalId === g.id
                && (t.sessionSid ? t.sessionSid === s.sid : true));
              if (!exists) {
                w[key].push({
                  time: s.time || g.time || '07:00',
                  name: g.text || 'Reja',
                  dur:  s.dur  || g.dur  || '60 daq',
                  goalId: g.id,
                  sessionSid: s.sid
                });
              }
            }
          }
        }
        DATA.setWeekPlan(w);
      }
      localStorage.setItem('mvow.localDateMigration_v2', 'done');
    } catch (err) {
      // sukut — fallback bor (getTodayPlan ichida)
    }
  };
  // Init paytida ishga tushadi
  DATA.migrateGoalsToLocalDates();
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

  // Daqiqani "1 soat 30 daq" formatiga aylantirish — DATA namespacedagi shared helper
  DATA.fmtHM = function (mins) {
    mins = Math.max(0, parseInt(mins, 10) || 0);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return h + ' soat ' + m + ' daq';
    if (h)      return h + ' soat';
    return m + ' daq';
  };

  // ──────────────────────────────────────────────────────────────
  // GOAL SHAPE v2 — sessions[] + changeLog (har kunlik blueprint)
  // Eski shape: { time, dur } bitta sessiya.
  // Yangi shape: { sessions: [{sid,time,dur}], changeLog: [{fromIso,sessions:[{time,dur}]}] }
  // Eski yozuvlar saqlanadi: loadGoals inflate qiladi (read-time, idempotent),
  // saveGoals esa legacy mirrors yozadi (time = sessions[0].time, dur = jami HM).
  // ──────────────────────────────────────────────────────────────
  function isoAddDaysLocal(iso, n) {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    d.setDate(d.getDate() + n);
    return DATA.localDateIso(d);
  }
  function isoDiffDaysLocal(aIso, bIso) {
    const a = new Date(aIso + 'T00:00:00');
    const b = new Date(bIso + 'T00:00:00');
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.round((a - b) / 86400000);
  }
  function genSid(existingSessions) {
    let max = 0;
    for (const s of (existingSessions || [])) {
      const m = String(s && s.sid || '').match(/^s(\d+)$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
    }
    return 's' + (max + 1);
  }

  function inflateGoal(g) {
    if (!g || typeof g !== 'object') return g;
    try {
      if (!Array.isArray(g.sessions) || g.sessions.length === 0) {
        g.sessions = [{
          sid: 's1',
          time: g.time || '07:00',
          dur:  g.dur  || '60 daq'
        }];
      } else {
        // Sid'siz yozuvlarga sid berish (idempotent)
        for (let i = 0; i < g.sessions.length; i++) {
          if (!g.sessions[i].sid) g.sessions[i].sid = 's' + (i + 1);
        }
      }
      if (!Array.isArray(g.changeLog) || g.changeLog.length === 0) {
        g.changeLog = [{
          fromIso: g.startDate,
          sessions: g.sessions.map(s => ({ time: s.time, dur: s.dur }))
        }];
      }
    } catch {
      g.sessions = g.sessions || [{ sid: 's1', time: '07:00', dur: '60 daq' }];
      g.changeLog = g.changeLog || [{ fromIso: g.startDate, sessions: [{ time: '07:00', dur: '60 daq' }] }];
    }
    return g;
  }

  DATA.loadGoals = function () {
    let raw = [];
    try { raw = JSON.parse(localStorage.getItem('mvow.goals') || '[]'); } catch {}
    if (!Array.isArray(raw)) raw = [];
    return raw.map(inflateGoal);
  };

  DATA.saveGoals = function (goals) {
    if (!Array.isArray(goals)) return;
    const out = goals.map(g => {
      const sessions = (Array.isArray(g.sessions) && g.sessions.length)
        ? g.sessions
        : [{ sid: 's1', time: g.time || '07:00', dur: g.dur || '60 daq' }];
      const first = sessions[0];
      const totalMins = sessions.reduce((s, x) => s + DATA.parseDurMins(x.dur), 0);
      return Object.assign({}, g, {
        sessions: sessions,
        changeLog: Array.isArray(g.changeLog) && g.changeLog.length
          ? g.changeLog
          : [{ fromIso: g.startDate, sessions: sessions.map(s => ({ time: s.time, dur: s.dur })) }],
        // Legacy mirrors — eski o'quvchilar (home.html, weekly-review, h.k.) uchun
        time: first.time,
        dur:  DATA.fmtHM(totalMins)
      });
    });
    localStorage.setItem('mvow.goals', JSON.stringify(out));
  };

  // ── ONE-TIME MIGRATION: eski shape -> yangi sessions[] (idempotent) ──
  // Faqat bir marta ishlaydi. Inflate read-time bo'lsa ham, bir marta diskka
  // yozib qo'yamiz (legacy mirrors bilan birga), keyingi safar barcha sahifalar
  // birdek yangi shape'ni ko'radi. Bu xavfsiz: legacy mirrors hech qachon
  // o'chmaydi, eski o'quvchilar ham ishlayveradi.
  DATA.migrateGoalsToSessions = function () {
    if (localStorage.getItem('mvow.goalSessionsMigration_v1') === 'done') return;
    try {
      const goals = DATA.loadGoals();   // read-time inflate
      if (goals.length > 0) DATA.saveGoals(goals);
      localStorage.setItem('mvow.goalSessionsMigration_v1', 'done');
    } catch {
      // sukut — loadGoals har doim inflate qiladi, shuning uchun read xavfsiz
    }
  };
  DATA.migrateGoalsToSessions();

  // ── Sessiya yordamchilari ──
  DATA.getGoalSessions = function (goalId) {
    const g = DATA.loadGoals().find(x => x && x.id === goalId);
    if (!g) return [];
    return g.sessions.map(s => ({ sid: s.sid, time: s.time, dur: s.dur }));
  };

  // Goal'ning sessions[] ini almashtirish + changeLog ga yozish + weekPlan retile
  DATA.updateGoalSessions = function (goalId, sessions) {
    const goals = DATA.loadGoals();
    const idx = goals.findIndex(x => x && x.id === goalId);
    if (idx < 0) return null;
    const g = goals[idx];

    // Sessions'ga sid berish (yangi qatorlar uchun)
    const cleaned = (Array.isArray(sessions) ? sessions : []).map((s, i) => ({
      sid:  s.sid || ('s' + (i + 1)),
      time: s.time || '07:00',
      dur:  s.dur  || '60 daq'
    }));
    // Sid takrorlanmasligi uchun qayta hisoblash
    const seen = new Set();
    for (let i = 0; i < cleaned.length; i++) {
      if (seen.has(cleaned[i].sid)) cleaned[i].sid = genSid(cleaned.slice(0, i));
      seen.add(cleaned[i].sid);
    }
    g.sessions = cleaned;

    // changeLog — agar bugun allaqachon yozilgan bo'lsa, ALMASHTIRAMIZ (append emas)
    const todayIso = DATA.today.iso;
    const logEntry = {
      fromIso: todayIso,
      sessions: cleaned.map(s => ({ time: s.time, dur: s.dur }))
    };
    if (!Array.isArray(g.changeLog)) g.changeLog = [];
    const last = g.changeLog[g.changeLog.length - 1];
    if (last && last.fromIso === todayIso) {
      g.changeLog[g.changeLog.length - 1] = logEntry;
    } else {
      g.changeLog.push(logEntry);
    }

    DATA.saveGoals(goals);
    // weekPlan: bugundan oxirgacha qayta tile qilish (o'tgan kunlar tegmaydi)
    DATA._retileGoal(g, { fromIso: todayIso });
    return g;
  };

  DATA.updateGoalSession = function (goalId, sid, patch) {
    const sessions = DATA.getGoalSessions(goalId);
    if (!sessions.length) return null;
    const out = sessions.map(s => s.sid === sid
      ? Object.assign({}, s, patch || {})
      : s);
    return DATA.updateGoalSessions(goalId, out);
  };

  DATA.addGoalSession = function (goalId, sess) {
    const sessions = DATA.getGoalSessions(goalId);
    const next = sessions.slice();
    next.push({
      sid:  genSid(next),
      time: (sess && sess.time) || '07:00',
      dur:  (sess && sess.dur)  || '30 daq'
    });
    return DATA.updateGoalSessions(goalId, next);
  };

  DATA.removeGoalSession = function (goalId, sid, opts) {
    opts = opts || {};
    const sessions = DATA.getGoalSessions(goalId);
    const filtered = sessions.filter(s => s.sid !== sid);
    if (filtered.length === 0 && !opts.allowEmpty) {
      throw new Error('Goal must have at least one session');
    }
    return DATA.updateGoalSessions(goalId, filtered);
  };

  // weekPlan retile — bir maqsad uchun bugundan endIso gacha qayta tile
  // O'tgan kunlar O'ZGARTIRILMAYDI (history matching saqlanadi).
  DATA._retileGoal = function (goal, opts) {
    if (!goal || !goal.startDate) return;
    opts = opts || {};
    const fromIso = opts.fromIso || DATA.today.iso;
    const endIso  = isoAddDaysLocal(goal.startDate, goal.days || 30);  // exclusive
    const w = DATA.getWeekPlan();

    // Bugundan endIso gacha (exclusive) — bu maqsadning eski slotlarini olib tashlash
    let cursor = fromIso;
    // Agar fromIso startDate'dan ham oldin bo'lsa, startDate'dan boshlaymiz
    if (cursor < goal.startDate) cursor = goal.startDate;
    let safety = 0;
    while (cursor < endIso && safety < 5000) {
      const key = 'd' + cursor;
      if (Array.isArray(w[key])) {
        w[key] = w[key].filter(t => t.goalId !== goal.id);
        if (w[key].length === 0) delete w[key];
      }
      cursor = isoAddDaysLocal(cursor, 1);
      safety++;
    }

    // Endi qayta tile qilamiz — har sessiya alohida task
    cursor = fromIso;
    if (cursor < goal.startDate) cursor = goal.startDate;
    safety = 0;
    while (cursor < endIso && safety < 5000) {
      const key = 'd' + cursor;
      if (!Array.isArray(w[key])) w[key] = [];
      for (const s of (goal.sessions || [])) {
        const exists = w[key].some(t => t.goalId === goal.id && t.sessionSid === s.sid);
        if (!exists) {
          w[key].push({
            time: s.time || '07:00',
            name: goal.text || 'Reja',
            dur:  s.dur  || '60 daq',
            goalId: goal.id,
            sessionSid: s.sid
          });
        }
      }
      cursor = isoAddDaysLocal(cursor, 1);
      safety++;
    }

    DATA.setWeekPlan(w);
  };

  // ── Goal progress math (single source) ──
  DATA.getGoalProgress = function (goalId) {
    const g = DATA.loadGoals().find(x => x && x.id === goalId);
    if (!g) return null;
    const todayIso = DATA.today.iso;
    const startIso = g.startDate;
    const endIso   = isoAddDaysLocal(startIso, g.days || 30);  // exclusive

    // Bugungi kunlik allocation
    const dailyAllocation = (g.sessions || []).reduce(
      (s, x) => s + DATA.parseDurMins(x.dur), 0
    );

    // Total target — changeLog'ni walk qilib o'tgan window'larni o'z allokatsiyasi bilan hisoblash
    let totalTarget = 0;
    const log = (Array.isArray(g.changeLog) && g.changeLog.length)
      ? g.changeLog
      : [{ fromIso: startIso, sessions: (g.sessions || []).map(s => ({ time: s.time, dur: s.dur })) }];
    for (let i = 0; i < log.length; i++) {
      const winStart = (log[i].fromIso > startIso) ? log[i].fromIso : startIso;
      const winEnd   = (i + 1 < log.length) ? log[i + 1].fromIso : endIso;
      const days     = isoDiffDaysLocal(winEnd, winStart);
      const alloc    = (log[i].sessions || []).reduce(
        (s, x) => s + DATA.parseDurMins(x.dur), 0
      );
      totalTarget += Math.max(0, days) * alloc;
    }

    // Done — history.actualMins, name match bilan, sana oralig'ida
    const done = DATA.getHistory()
      .filter(h => h && h.name === g.text
                && h.dateIso >= startIso
                && h.dateIso <  endIso)
      .reduce((s, h) => s + (h.actualMins || 0), 0);

    const remaining = Math.max(0, totalTarget - done);

    let projectedEnd = null;
    if (dailyAllocation > 0) {
      const daysNeeded = Math.ceil(remaining / dailyAllocation);
      projectedEnd = isoAddDaysLocal(todayIso, daysNeeded);
    }

    const originalEnd = endIso;
    const paceDeltaDays = projectedEnd
      ? isoDiffDaysLocal(originalEnd, projectedEnd)
      : 0;

    return { done, remaining, totalTarget, dailyAllocation, projectedEnd, originalEnd, paceDeltaDays };
  };

  // ── Inline maqsadlar.html progress mat'idan ajratilgan ──
  DATA.goalStats = function (goal) {
    if (!goal || !goal.startDate) return null;
    const todayIso = DATA.today.iso;
    const startIso = goal.startDate;
    const totalDays = goal.days || 30;

    const passed = Math.max(0, Math.min(totalDays, isoDiffDaysLocal(todayIso, startIso)));
    const remaining = Math.max(0, totalDays - passed);
    const timePct = totalDays > 0 ? Math.round((passed / totalDays) * 100) : 0;
    const expectedSoFar = Math.min(passed + 1, totalDays);

    // Bajarilgan kunlar — history'ga name match orqali
    const history = DATA.getHistory();
    const endIso = isoAddDaysLocal(startIso, totalDays);
    const matching = history.filter(h => h && h.name === goal.text
                                      && h.dateIso >= startIso
                                      && h.dateIso <  endIso);
    // Unique sanalar
    const uniqDays = new Set(matching.map(h => h.dateIso));
    const completedDays = uniqDays.size;
    const donePct = expectedSoFar > 0
      ? Math.min(100, Math.round((completedDays / expectedSoFar) * 100))
      : 0;
    const grade = donePct >= 80 ? 'good' : (donePct >= 50 ? 'mid' : 'low');

    return { passed, remaining, timePct, expectedSoFar, completedDays, donePct, grade };
  };

  // ── Bugungi rejaga ad-hoc task qo'shish (no goalId) ──
  DATA.addTaskToToday = function (task) {
    if (!task || !task.time || !task.name) return null;
    const arr = DATA.getTodayPlan();
    const t = {
      time: task.time,
      name: task.name,
      dur:  task.dur || '30 daq'
    };
    arr.push(t);
    DATA.setTodayPlan(arr);
    return t;
  };

  // ── Bugungi rejada bitta task'ni olib tashlash (faqat bugun) ──
  DATA.removeTaskFromToday = function (taskKey) {
    const todayIso = DATA.today.iso;
    const arr = DATA.getTodayPlan();
    const filtered = arr.filter(t => DATA.taskKey(todayIso, t.time, t.name) !== taskKey);
    if (filtered.length === arr.length) return false;
    DATA.setTodayPlan(filtered);
    return true;
  };

  // ── Bugungi rejada vazifa vaqti/davomiyligini tahrirlash (faqat bugungi reja) ──
  DATA.updateTaskTime = function (taskKey, patch) {
    const todayIso = DATA.today.iso;
    const arr = DATA.getTodayPlan();
    let changed = false;
    for (const t of arr) {
      if (DATA.taskKey(todayIso, t.time, t.name) === taskKey) {
        if (patch && patch.time) t.time = patch.time;
        if (patch && patch.dur)  t.dur  = patch.dur;
        // Maqsad sessiyasiga ham yozamiz — reja qayta tuzilsa ham o'zgarish saqlansin
        if (t.goalId && t.sessionSid && typeof DATA.updateGoalSession === 'function') {
          try { DATA.updateGoalSession(t.goalId, t.sessionSid, { time: t.time, dur: t.dur }); } catch (e) {}
        }
        changed = true;
        break;
      }
    }
    if (changed) DATA.setTodayPlan(arr);
    return changed;
  };

  // ── Goal nomini almashtirish + history.goalId backfill (rename fragility mitigation) ──
  DATA.renameGoal = function (goalId, newText) {
    if (!newText || !String(newText).trim()) return;
    newText = String(newText).trim();
    const goals = DATA.loadGoals();
    const g = goals.find(x => x && x.id === goalId);
    if (!g) return;
    const oldText = g.text;
    if (oldText === newText) return;
    g.text = newText;
    DATA.saveGoals(goals);

    // weekPlan: bugundan boshlab name'ni almashtirish (o'tgan kunlar history match uchun saqlanadi)
    const w = DATA.getWeekPlan();
    const todayIso = DATA.today.iso;
    for (const key of Object.keys(w)) {
      if (!Array.isArray(w[key])) continue;
      const iso = key.slice(1);
      if (iso < todayIso) continue;
      for (const t of w[key]) {
        if (t.goalId === goalId) t.name = newText;
      }
    }
    DATA.setWeekPlan(w);

    // history: goalId backfill (eski entry'larga goalId qo'shamiz, name saqlanadi)
    try {
      const hist = DATA.getHistory();
      const startIso = g.startDate;
      const endIso = isoAddDaysLocal(startIso, g.days || 30);
      let touched = false;
      for (const h of hist) {
        if (!h.goalId && h.name === oldText
            && h.dateIso >= startIso && h.dateIso < endIso) {
          h.goalId = goalId;
          touched = true;
        }
      }
      if (touched) localStorage.setItem('mvow.history', JSON.stringify(hist));
    } catch {}
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
  // Tugallangan ishlarni belgilash uchun unique key (home.html va hard-lock.html ishlatadi)
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
  // MUHIM: startedAt va completedAt — HAQIQIY bajarilgan vaqt (rejadagi vaqt emas).
  // task.actualStartedAt bo'lsa (taymer'dan), uni ishlatamiz. Aks holda
  // hozirgi vaqtdan dur'ni ayirib hisoblaymiz.
  DATA.markTaskDone = function (task, taskKey, note) {
    DATA.setTaskState(taskKey, { status: 'done' });
    const completedAt = Date.now();
    const durMin = DATA.parseDurMins(task.dur);
    const startedAt = (typeof task.actualStartedAt === 'number' && task.actualStartedAt > 0)
      ? task.actualStartedAt
      : (completedAt - durMin * 60 * 1000);
    DATA.addHistory({
      name: task.name || 'Ish',
      plannedTime: task.time || '',
      plannedDur: task.dur || '',
      dateIso: DATA.today.iso,
      startedAt,
      completedAt,
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
