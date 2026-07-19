'use strict';
/**
 * FOCUS AI — ijtimoiy qatlam.
 * Supabase ulansa (window.SB_KEY to'ldirilgan) → real reyting + nazorat (qurilmalararo).
 * Ulanmasa → lokal rejim (ilova hech qachon buzilmaydi).
 * Reyting: fokus vaqti (asosiy) + bajarilgan odatlar.
 * Identifikator: qurilmada yaratilgan KOD (auth yo'q — sodda).
 */
(function () {
  var CODE_KEY = 'mvow.myCode';
  var FRIENDS_KEY = 'mvow.friends';

  function gen() {
    var L = 'ABCDEFGHJKLMNPQRSTUVWXYZ', N = '0123456789', s = '';
    for (var i = 0; i < 3; i++) s += L[Math.floor(Math.random() * L.length)];
    for (var j = 0; j < 3; j++) s += N[Math.floor(Math.random() * N.length)];
    return s;
  }
  function myCode() {
    var c = '';
    try { c = localStorage.getItem(CODE_KEY) || ''; } catch (e) {}
    if (!c) { c = gen(); try { localStorage.setItem(CODE_KEY, c); } catch (e) {} }
    return c;
  }
  function todayIso() {
    try { if (window.MVOW_DATA && MVOW_DATA.today) return MVOW_DATA.today.iso; } catch (e) {}
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function myStats() {
    var mins = 0, habits = 0;
    try {
      if (window.MVOW_DATA && MVOW_DATA.getHistory) {
        var h = MVOW_DATA.getHistory().filter(function (x) { return x.dateIso === todayIso(); });
        habits = h.length;
        mins = h.reduce(function (s, x) { return s + (x.actualMins || 0); }, 0);
      }
    } catch (e) {}
    return { focusMins: mins, habits: habits, focusH: Math.round(mins / 60 * 10) / 10 };
  }

  // ── Bekitish (visibility) — BEKITILGAN vazifa serverga UMUMAN yuborilmaydi ──
  // Faqat lokalda saqlanadi (mvow.hidden.<sana>); do'st/ustoz/ota-ona faqat ko'rinadiganlarni ko'radi.
  function hiddenKey(iso) { return 'mvow.hidden.' + (iso || todayIso()); }
  function hiddenSet(iso) {
    try { var a = JSON.parse(localStorage.getItem(hiddenKey(iso)) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function setHidden(name, hide, iso) {
    if (!name) return;
    var set = hiddenSet(iso), i = set.indexOf(name);
    if (hide && i < 0) set.push(name);
    if (!hide && i >= 0) set.splice(i, 1);
    try { localStorage.setItem(hiddenKey(iso), JSON.stringify(set)); } catch (e) {}
    syncStats();   // viewerlar darhol yangilansin (bekitilgan serverdan chiqadi)
  }
  function isHidden(name, iso) { return hiddenSet(iso).indexOf(name) >= 0; }
  // Bugungi KO'RINADIGAN vazifalar (bekitilganlar chiqarilgan) — server report'i uchun.
  function myTasksToday() {
    var out = [], hidden = hiddenSet();
    try {
      if (window.MVOW_DATA && MVOW_DATA.getHistory) {
        MVOW_DATA.getHistory().filter(function (x) { return x.dateIso === todayIso(); }).forEach(function (x) {
          var nm = x.name || 'Vazifa';
          if (hidden.indexOf(nm) >= 0) return;   // BEKITILGAN -> serverga bormaydi
          out.push({ n: nm, m: x.actualMins || 0, t: ((x.withTimer === true) || x.mode === 'timer' || x.mode === 'pomodoro') ? 1 : 0 });
        });
      }
    } catch (e) {}
    return out;
  }

  // ── Supabase klient (bo'lmasa null) ──
  var sb;
  function client() {
    if (sb !== undefined) return sb;
    sb = null;
    try {
      if (window.supabase && window.SB_URL && window.SB_KEY) {
        sb = window.supabase.createClient(window.SB_URL, window.SB_KEY);
      }
    } catch (e) { sb = null; }
    return sb;
  }
  function cloud() { return !!client(); }

  function ensureProfile() {
    var c = client(); if (!c) return Promise.resolve();
    return c.from('profiles').upsert({ code: myCode() }, { onConflict: 'code' }).then(function () {}, function () {});
  }
  function syncStats() {
    var c = client(); if (!c) return Promise.resolve();
    var s = myStats();
    // 1) Asosiy statistika (reyting uchun) — 'report' ustuni bo'lmasa ham ISHLAYDI.
    var p = c.from('daily_stats').upsert(
      { code: myCode(), d: todayIso(), focus_mins: s.focusMins, habits: s.habits, updated_at: new Date().toISOString() },
      { onConflict: 'code,d' }
    ).then(function () {}, function () {});
    // 2) Ko'rinadigan vazifalar (per-task) — ALOHIDA update; ustun hali qo'shilmagan bo'lsa xatoni yutamiz.
    p.then(function () {
      try {
        c.from('daily_stats').update({ report: myTasksToday() })
          .match({ code: myCode(), d: todayIso() }).then(function () {}, function () {});
      } catch (e) {}
    });
    return p;
  }

  // ── Do'stlar (lokal ro'yxat doim saqlanadi; bulutда links ham) ──
  function friends() { try { return JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]'); } catch (e) { return []; } }
  function saveFriends(f) { try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(f)); } catch (e) {} }

  function addFriend(code, kind, name) {
    code = (code || '').trim().toUpperCase(); kind = kind || 'friend';
    if (!code || code === myCode() || !/^[A-Z]{3}[0-9]{3}$/.test(code)) return Promise.resolve(false);
    var f = friends();
    if (f.some(function (x) { return x.code === code && x.role === kind; })) return Promise.resolve(false);
    f.push({ code: code, role: kind, name: (name || '').trim().slice(0, 24) }); saveFriends(f);
    var c = client();
    if (c) return c.from('links').upsert({ follower: myCode(), target_code: code, kind: kind }, { onConflict: 'follower,target_code,kind' })
      .then(function () { return true; }, function () { return true; });
    return Promise.resolve(true);
  }
  function removeFriend(code, kind) {
    kind = kind || 'friend';
    saveFriends(friends().filter(function (x) { return !(x.code === code && x.role === kind); }));
    var c = client();
    if (c) c.from('links').delete().match({ follower: myCode(), target_code: code, kind: kind }).then(function () {}, function () {});
  }
  // Do'st/ustozga user o'zi ISM beradi (kod o'rniga ko'rsatiladi). Faqat lokalda.
  function renameFriend(code, kind, name) {
    kind = kind || 'friend';
    var f = friends();
    f.forEach(function (x) { if (x.code === code && x.role === kind) x.name = (name || '').trim().slice(0, 24); });
    saveFriends(f);
  }
  // Ko'rsatiladigan nom: user bergan ism bo'lsa u, aks holda kod.
  function nameOf(code, kind) {
    kind = kind || 'friend';
    var x = friends().filter(function (y) { return y.code === code && y.role === kind; })[0];
    return (x && x.name) ? x.name : code;
  }

  function localBoard(kind) {
    var me = myStats();
    var list = [{ code: myCode(), name: 'Siz', me: true, focusMins: me.focusMins, focusH: me.focusH, habits: me.habits }];
    friends().filter(function (x) { return x.role === kind; }).forEach(function (x) {
      list.push({ code: x.code, name: nameOf(x.code, kind), me: false, pending: true, focusMins: -1, focusH: 0, habits: 0 });
    });
    list.sort(function (a, b) { return (b.focusMins - a.focusMins) || ((b.habits || 0) - (a.habits || 0)); });
    return list;
  }

  // Reyting — har doim Promise qaytaradi (async).
  function leaderboard(kind) {
    kind = kind || 'friend';
    var c = client();
    if (!c) return Promise.resolve(localBoard(kind));
    var codes = [myCode()].concat(friends().filter(function (x) { return x.role === kind; }).map(function (x) { return x.code; }));
    return Promise.all([ensureProfile(), syncStats()]).then(function () {
      return c.from('daily_stats').select('code,focus_mins,habits').eq('d', todayIso()).in('code', codes);
    }).then(function (res) {
      var by = {}; (res && res.data || []).forEach(function (r) { by[r.code] = r; });
      var list = codes.map(function (cd) {
        var r = by[cd] || { focus_mins: 0, habits: 0 };
        return {
          code: cd, name: cd === myCode() ? 'Siz' : nameOf(cd, kind), me: cd === myCode(),
          focusMins: r.focus_mins || 0, focusH: Math.round((r.focus_mins || 0) / 60 * 10) / 10, habits: r.habits || 0
        };
      });
      list.sort(function (a, b) { return (b.focusMins - a.focusMins) || (b.habits - a.habits); });
      return list;
    }).catch(function () { return localBoard(kind); });
  }

  // ── Chat (suhbat) — bulut rejimida ──
  // Chat xavfsizligi: jadval RLS bilan yopilsa — SECURITY DEFINER RPC (send_msg/get_msgs) ishlatiladi.
  // RPC hali qo'shilmagan bo'lsa — to'g'ridan-to'g'ri jadval (eski holat). Ikkala holatda ham ishlaydi.
  function _directInsert(c, toCode, body) {
    return c.from('messages').insert({ from_code: myCode(), to_code: toCode, body: body })
      .then(function (r) { return !(r && r.error); }, function () { return false; });
  }
  function _directFetch(c, me, withCode) {
    var f = 'and(from_code.eq.' + me + ',to_code.eq.' + withCode + '),and(from_code.eq.' + withCode + ',to_code.eq.' + me + ')';
    return c.from('messages').select('from_code,to_code,body,created_at').or(f).order('created_at', { ascending: true })
      .then(function (res) { return (res && res.data) || []; }, function () { return []; });
  }
  function sendMessage(toCode, body) {
    toCode = (toCode || '').trim().toUpperCase(); body = (body || '').trim().slice(0, 500);
    if (!toCode || !body) return Promise.resolve(false);
    var c = client(); if (!c) return Promise.resolve(false);
    return c.rpc('send_msg', { p_from: myCode(), p_to: toCode, p_body: body })
      .then(function (r) { return (r && !r.error) ? true : _directInsert(c, toCode, body); },
            function () { return _directInsert(c, toCode, body); });
  }
  function getMessages(withCode) {
    withCode = (withCode || '').trim().toUpperCase();
    var c = client(); if (!c || !withCode) return Promise.resolve([]);
    var me = myCode();
    return c.rpc('get_msgs', { p_me: me, p_with: withCode })
      .then(function (r) { return (r && !r.error && Array.isArray(r.data)) ? r.data : _directFetch(c, me, withCode); },
            function () { return _directFetch(c, me, withCode); });
  }
  function subscribeMessages(withCode, cb) {
    withCode = (withCode || '').trim().toUpperCase();
    var c = client(); if (!c || !withCode) return null;
    var me = myCode();
    try {
      return c.channel('chat-' + me + '-' + withCode)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, function (payload) {
          var m = payload && payload.new; if (!m) return;
          if ((m.from_code === me && m.to_code === withCode) || (m.from_code === withCode && m.to_code === me)) cb(m);
        }).subscribe();
    } catch (e) { return null; }
  }
  function unsubscribe(ch) { var c = client(); if (c && ch) { try { c.removeChannel(ch); } catch (e) {} } }

  // Wards — kim MENI ustoz/ota-ona qilib qo'shgan (kind='mentor') -> men ularni NAZORAT qilaman
  function wards() {
    var c = client();
    if (!c) return Promise.resolve([]);
    return c.from('links').select('follower').eq('target_code', myCode()).eq('kind', 'mentor')
      .then(function (res) {
        var codes = ((res && res.data) || []).map(function (x) { return x.follower; });
        if (!codes.length) return [];
        // 'report' ustuni bo'lsa — per-task; bo'lmasa xato bermasin (fallback: report'siz so'rov).
        function build(rows) {
          var by = {}; (rows || []).forEach(function (s) { by[s.code] = s; });
          return codes.map(function (cd) {
            var s = by[cd] || { focus_mins: 0, habits: 0, report: [] };
            var tasks = Array.isArray(s.report) ? s.report.map(function (t) { return { name: t.n, mins: t.m || 0, timer: !!t.t }; }) : null;
            return {
              code: cd, name: cd,
              focusMins: s.focus_mins || 0, focusH: Math.round((s.focus_mins || 0) / 60 * 10) / 10, habits: s.habits || 0,
              tasks: tasks   // ko'rinadigan vazifalar (bekitilganlar yo'q); null = ustun yo'q
            };
          }).sort(function (a, b) { return (b.focusMins - a.focusMins) || (b.habits - a.habits); });
        }
        return c.from('daily_stats').select('code,focus_mins,habits,report').eq('d', todayIso()).in('code', codes)
          .then(function (r2) {
            if (r2 && r2.error) {   // 'report' ustuni hali qo'shilmagan -> report'siz qayta
              return c.from('daily_stats').select('code,focus_mins,habits').eq('d', todayIso()).in('code', codes)
                .then(function (r3) { return build((r3 && r3.data) || []); });
            }
            return build((r2 && r2.data) || []);
          });
      }).catch(function () { return []; });
  }

  window.Social = {
    myCode: myCode, myStats: myStats, cloud: cloud, syncStats: syncStats, wards: wards,
    friends: friends, addFriend: addFriend, removeFriend: removeFriend, renameFriend: renameFriend, nameOf: nameOf, leaderboard: leaderboard,
    sendMessage: sendMessage, getMessages: getMessages, subscribeMessages: subscribeMessages, unsubscribe: unsubscribe,
    hiddenSet: hiddenSet, setHidden: setHidden, isHidden: isHidden, myTasksToday: myTasksToday
  };
})();
