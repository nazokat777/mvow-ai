'use strict';
/**
 * FOCUS AI — Web Push eslatmalari (klient).
 * PushReminders.enable()  — ruxsat + obuna + serverga sync (ilova yopiq bo'lsa ham eslatadi)
 * PushReminders.sync()    — eslatmalar o'zgarsa serverni yangilash
 * PushReminders.disable() — o'chirish
 * Eslatmalar manbai: Taymersiz maqsadlar (noTimer + time + reminderText).
 */
(function (root) {
  var VAPID_PUBLIC = 'BFc-v2pcQydO5oN02JF2zIH_1he1rPuYXg0sAH7qqQ0rXtfJHoCupTEJIr5JU8CuE4-_rnNmAiq3j9jndB7Wv4g';

  function urlB64ToU8(b64) {
    var pad = '='.repeat((4 - b64.length % 4) % 4);
    var s = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(s), out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  function myCode() {
    try { if (root.Social && Social.myCode) { var c = Social.myCode(); if (c) return c; } } catch (e) {}
    try {
      var k = localStorage.getItem('mvow.pushCode');
      if (!k) { k = 'p' + Math.random().toString(36).slice(2, 10); localStorage.setItem('mvow.pushCode', k); }
      return k;
    } catch (e) { return ''; }
  }
  function gatherReminders() {
    // Mustaqil eslatmalar (eslatmalar.html) — maqsadlardan ALOHIDA
    try {
      var r = JSON.parse(localStorage.getItem('mvow.reminders') || '[]');
      return (Array.isArray(r) ? r : [])
        .filter(function (x) { return x && x.time && x.text; })
        .map(function (x) { return { time: x.time, body: x.text }; });
    } catch (e) { return []; }
  }
  function isEnabled() { try { return localStorage.getItem('mvow.pushOn') === '1'; } catch (e) { return false; } }
  function post(sub) {
    var code = myCode();
    if (!code || !sub) return Promise.resolve({ ok: false });
    var tz = -(new Date().getTimezoneOffset()); // daqiqada UTC offset (UZB = 300)
    return fetch('/api/push-subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, tz: tz, subscription: sub.toJSON(), reminders: gatherReminders() })
    }).then(function (r) { return r.json(); }).catch(function () { return { ok: false }; });
  }
  function getSub(reg, create) {
    return reg.pushManager.getSubscription().then(function (s) {
      if (s || !create) return s;
      return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToU8(VAPID_PUBLIC) });
    });
  }
  function enable() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return Promise.resolve({ ok: false, reason: 'unsupported' });
    }
    return Notification.requestPermission().then(function (p) {
      if (p !== 'granted') return { ok: false, reason: 'denied' };
      return navigator.serviceWorker.ready
        .then(function (reg) { return getSub(reg, true); })
        .then(function (sub) {
          if (!sub) return { ok: false, reason: 'no-sub' };
          return post(sub).then(function (res) {
            if (res && res.ok) { try { localStorage.setItem('mvow.pushOn', '1'); } catch (e) {} }
            return res;
          });
        });
    }).catch(function (e) { return { ok: false, reason: String(e && e.message || e) }; });
  }
  function sync() {
    if (!isEnabled() || !('serviceWorker' in navigator)) return Promise.resolve({ ok: false });
    return navigator.serviceWorker.ready
      .then(function (reg) { return getSub(reg, false); })
      .then(function (sub) { return sub ? post(sub) : { ok: false }; })
      .catch(function () { return { ok: false }; });
  }
  function disable() {
    try { localStorage.removeItem('mvow.pushOn'); } catch (e) {}
    if (!('serviceWorker' in navigator)) return Promise.resolve();
    return navigator.serviceWorker.ready
      .then(function (reg) { return getSub(reg, false); })
      .then(function (s) { return s ? s.unsubscribe() : null; })
      .catch(function () {});
  }
  root.PushReminders = { enable: enable, sync: sync, disable: disable, isEnabled: isEnabled, gatherReminders: gatherReminders };
})(typeof self !== 'undefined' ? self : this);
