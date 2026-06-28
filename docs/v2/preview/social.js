'use strict';
/**
 * Daywarden — ijtimoiy qatlam (do'st musobaqasi + ustoz/ota-ona nazorati).
 * 1-bosqich: LOCAL — sizning haqiqiy bugungi stat'ingiz; do'stlar kodi saqlanadi.
 * 2-bosqich (keyin): Supabase backend — do'stlarning real natijalari + chat.
 * Reyting: fokus vaqti (asosiy) + bajarilgan odatlar bo'yicha.
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

  // Bugungi shaxsiy stat — fokus daqiqalari + bajarilgan odatlar (tarixdan)
  function myStats() {
    var mins = 0, habits = 0;
    try {
      if (window.MVOW_DATA && MVOW_DATA.getHistory) {
        var h = MVOW_DATA.getHistory().filter(function (x) { return x.dateIso === MVOW_DATA.today.iso; });
        habits = h.length;
        mins = h.reduce(function (s, x) { return s + (x.actualMins || 0); }, 0);
      }
    } catch (e) {}
    return { focusMins: mins, habits: habits, focusH: Math.round(mins / 60 * 10) / 10 };
  }

  function friends() {
    try { return JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveFriends(f) { try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(f)); } catch (e) {} }

  // role: 'friend' | 'mentor' (ustoz/ota-ona)
  function addFriend(code, role) {
    code = (code || '').trim().toUpperCase();
    if (!code || code === myCode()) return false;
    if (!/^[A-Z]{3}[0-9]{3}$/.test(code)) return false;
    var f = friends();
    if (f.some(function (x) { return x.code === code && x.role === (role || 'friend'); })) return false;
    f.push({ code: code, role: role || 'friend' });
    saveFriends(f);
    return true;
  }
  function removeFriend(code, role) {
    saveFriends(friends().filter(function (x) { return !(x.code === code && x.role === (role || 'friend')); }));
  }

  // Reyting — fokus daqiqasi bo'yicha kamayuvchi (teng bo'lsa odatlar bo'yicha).
  // 1-bosqich: faqat "Siz" real; do'stlar "kutilmoqda" (backend ulanganda real bo'ladi).
  function leaderboard(role) {
    role = role || 'friend';
    var me = myStats();
    var list = [{ code: myCode(), name: 'Siz', me: true, focusMins: me.focusMins, focusH: me.focusH, habits: me.habits }];
    friends().filter(function (x) { return x.role === role; }).forEach(function (x) {
      list.push({ code: x.code, name: x.code, me: false, pending: true, focusMins: -1, focusH: 0, habits: 0 });
    });
    list.sort(function (a, b) {
      if (b.focusMins !== a.focusMins) return b.focusMins - a.focusMins;
      return (b.habits || 0) - (a.habits || 0);
    });
    return list;
  }

  window.Social = {
    myCode: myCode, myStats: myStats,
    friends: friends, addFriend: addFriend, removeFriend: removeFriend,
    leaderboard: leaderboard
  };
})();
