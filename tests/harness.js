'use strict';
/**
 * Test harness — data.js (vanilla PWA biznes-mantiq) ni Node'da yuklaydi.
 * Brauzer global'lari (window/document/localStorage...) stub qilinadi.
 * npm/dependency YO'Q — faqat Node ichki vm + node:test.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PREVIEW = path.join(__dirname, '..', 'docs', 'v2', 'preview');

// Har xil DOM/navigator chaqiruvlarini xato bermay yutadigan chain-noop proxy.
function makeNoopProxy() {
  const fn = function () { return proxy; };
  const proxy = new Proxy(fn, {
    get(_t, prop) {
      if (prop === Symbol.iterator) return function* () {};
      if (prop === Symbol.toPrimitive) return () => '';
      if (prop === 'length') return 0;
      if (prop === 'then') return undefined; // thenable bo'lib qolmasin
      if (prop === 'textContent' || prop === 'value' || prop === 'innerHTML' ||
          prop === 'className' || prop === 'href' || prop === 'permission') return '';
      return proxy;
    },
    apply() { return proxy; },
    construct() { return proxy; },
    set() { return true; },
    has() { return true; }
  });
  return proxy;
}

// navigator stub — navigator.language ni boshqarish mumkin (til aniqlash testi uchun)
function makeNavigator(lang) {
  return new Proxy({}, {
    get(_t, prop) {
      if (prop === 'language') return lang;
      if (prop === 'languages') return [lang];
      return makeNoopProxy();
    }
  });
}

/**
 * Skriptlarni toza kontekstda yuklaydi.
 * @param {string[]} files - yuklanadigan JS fayllar
 * @param {object} seed - localStorage boshlang'ich qiymatlari (obyektlar JSON qilinadi)
 * @param {object} [opts] - { navLang } — navigator.language qiymati
 * @returns {{sandbox, localStorage, store, window}}
 */
function loadScripts(files, seed, opts) {
  opts = opts || {};
  const store = new Map();
  if (seed) {
    for (const k of Object.keys(seed)) {
      store.set(k, typeof seed[k] === 'string' ? seed[k] : JSON.stringify(seed[k]));
    }
  }
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i) => Array.from(store.keys())[i] || null
  };

  const sandbox = {
    console,
    localStorage,
    document: makeNoopProxy(),
    navigator: makeNavigator(opts.navLang || 'en'),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {} }),
    location: { pathname: '/home.html', href: '', search: '', hash: '', replace() {}, assign() {}, reload() {} },
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    requestAnimationFrame: () => 0,
    cancelAnimationFrame: () => {},
    AudioContext: function () { return makeNoopProxy(); },
    webkitAudioContext: function () { return makeNoopProxy(); },
    Notification: function () { return makeNoopProxy(); },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}), text: () => Promise.resolve('') }),
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; }
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;

  const ctx = vm.createContext(sandbox);
  for (const f of files) {
    const src = fs.readFileSync(path.join(PREVIEW, f), 'utf8');
    vm.runInContext(src, ctx, { filename: f });
  }
  return { sandbox, localStorage, store, window: sandbox };
}

// data.js yuklab MVOW_DATA ni qaytaradi
function loadData(seed, opts) {
  const r = loadScripts(['data.js'], seed, opts);
  return { DATA: r.sandbox.MVOW_DATA, localStorage: r.localStorage, store: r.store, window: r.sandbox };
}

// i18n.js yuklab I18N ni qaytaradi
function loadI18N(seed, opts) {
  const r = loadScripts(['i18n.js'], seed, opts);
  return { I18N: r.sandbox.I18N, localStorage: r.localStorage, store: r.store, window: r.sandbox };
}

// Bugungi sanani data.js (localDateIso) bilan bir xil formatda beradi — testlar uchun.
function todayIso() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

module.exports = { loadData, loadI18N, loadScripts, todayIso };
