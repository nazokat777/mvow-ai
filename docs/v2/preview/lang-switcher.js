/**
 * FOCUS AI Language Switcher — sodda va ishonchli.
 *
 * Tugma bosilsa → dropdown ochiladi
 * Til tanlansa → localStorage['mvow.lang'] saqlanadi → sahifa qayta yuklanadi
 *
 * Reload'dan keyin i18n.js'dagi detectLang() yangi tilni o'qiydi va DICT[lang]
 * ishlatib, data-i18n elementlarni yangilaydi. JS-generated matnlar ham
 * yangidan to'g'ri tilda yoziladi.
 */
(function () {
  'use strict';

  if (window.__MVOW_LANG_SWITCHER_INSTALLED__) return;
  window.__MVOW_LANG_SWITCHER_INSTALLED__ = true;

  const LANGS = {
    uz: { code: 'UZ', name: "O'zbekcha" },
    ru: { code: 'RU', name: 'Русский' },
    en: { code: 'EN', name: 'English' }
  };

  function getCurrent() {
    try {
      const v = localStorage.getItem('mvow.lang');
      if (v && LANGS[v]) return v;
    } catch (e) {}
    return 'uz';
  }

  function setLang(code) {
    if (!LANGS[code]) return;
    try {
      localStorage.setItem('mvow.lang', code);
    } catch (e) {}
    document.documentElement.lang = code;
    // Sahifani to'liq qayta yuklaymiz — har bir matn (data-i18n + JS-generated)
    // yangi tilda chiqsin. Bu eng ishonchli yo'l.
    location.reload();
  }

  function build() {
    if (document.querySelector('.lang-switcher')) return;

    const cur = getCurrent();

    const wrap = document.createElement('div');
    wrap.className = 'lang-switcher';
    wrap.setAttribute('role', 'navigation');
    wrap.setAttribute('aria-label', 'Language');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-switcher__btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML =
      '<svg class="lang-switcher__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="9"/>' +
        '<path d="M3 12h18"/>' +
        '<path d="M12 3a14 14 0 0 1 0 18"/>' +
        '<path d="M12 3a14 14 0 0 0 0 18"/>' +
      '</svg>' +
      '<span class="lang-switcher__code">' + LANGS[cur].code + '</span>';

    const menu = document.createElement('div');
    menu.className = 'lang-switcher__menu';
    menu.setAttribute('role', 'menu');

    Object.keys(LANGS).forEach(function (code) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'lang-switcher__item' + (code === cur ? ' is-active' : '');
      item.setAttribute('role', 'menuitem');
      item.setAttribute('data-lang', code);
      item.innerHTML =
        '<span class="lang-switcher__item-code">' + LANGS[code].code + '</span>' +
        '<span class="lang-switcher__item-name">' + LANGS[code].name + '</span>';
      // Native onclick — eng ishonchli, har qanday brauzerda ishlaydi
      item.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        setLang(code);
      };
      menu.appendChild(item);
    });

    btn.onclick = function (e) {
      e.stopPropagation();
      const open = wrap.classList.toggle('lang-switcher--open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    document.addEventListener('click', function (e) {
      if (wrap.contains(e.target)) return;
      wrap.classList.remove('lang-switcher--open');
      btn.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        wrap.classList.remove('lang-switcher--open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    document.body.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
