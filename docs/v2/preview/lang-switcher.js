/**
 * Daywarden Language Switcher — auto-injects a globe icon + dropdown
 * into the top-right corner of every page.
 *
 * Requires: i18n.js loaded before this script.
 * On language change: window.I18N.set() is called, localStorage['mvow.lang'] persists,
 * and all data-i18n elements on the current page are updated instantly.
 */
(function () {
  'use strict';

  if (window.__MVOW_LANG_SWITCHER_INSTALLED__) return;
  window.__MVOW_LANG_SWITCHER_INSTALLED__ = true;

  const LANG_LABELS = {
    uz: { code: 'UZ', name: "O'zbekcha" },
    ru: { code: 'RU', name: 'Русский' },
    en: { code: 'EN', name: 'English' },
  };

  function getCurrent() {
    try {
      const stored = localStorage.getItem('mvow.lang');
      if (stored && LANG_LABELS[stored]) return stored;
    } catch (e) {}
    if (window.I18N && I18N.lang) return I18N.lang;
    return 'uz';
  }

  function setLang(code) {
    if (!LANG_LABELS[code]) return;
    const current = (window.I18N && I18N.lang) || localStorage.getItem('mvow.lang') || 'uz';
    try { localStorage.setItem('mvow.lang', code); } catch (e) {}
    if (window.I18N && typeof I18N.set === 'function') {
      I18N.set(code);
    } else {
      document.documentElement.lang = code;
    }
    updateActiveDisplay(code);
    closeMenu();
    // JS-generated matn (salom, sana, dynamic content) faqat reload bilan yangilanadi
    if (current !== code) {
      setTimeout(() => location.reload(), 120);
    }
  }

  let switcherEl = null;
  let menuEl = null;
  let codeEl = null;

  function buildSwitcher() {
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
      '<span class="lang-switcher__code"></span>';

    const menu = document.createElement('div');
    menu.className = 'lang-switcher__menu';
    menu.setAttribute('role', 'menu');

    Object.keys(LANG_LABELS).forEach(function (code) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'lang-switcher__item';
      item.setAttribute('role', 'menuitem');
      item.setAttribute('data-lang', code);
      item.innerHTML =
        '<span class="lang-switcher__item-code">' + LANG_LABELS[code].code + '</span>' +
        '<span class="lang-switcher__item-name">' + LANG_LABELS[code].name + '</span>';
      item.addEventListener('click', function () { setLang(code); });
      menu.appendChild(item);
    });

    btn.addEventListener('click', toggleMenu);

    wrap.appendChild(btn);
    wrap.appendChild(menu);

    switcherEl = wrap;
    menuEl = menu;
    codeEl = btn.querySelector('.lang-switcher__code');

    updateActiveDisplay(getCurrent());

    return wrap;
  }

  function toggleMenu() {
    if (!switcherEl) return;
    const open = switcherEl.classList.toggle('lang-switcher--open');
    const btn = switcherEl.querySelector('.lang-switcher__btn');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeMenu() {
    if (!switcherEl) return;
    switcherEl.classList.remove('lang-switcher--open');
    const btn = switcherEl.querySelector('.lang-switcher__btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function updateActiveDisplay(code) {
    if (codeEl) codeEl.textContent = (LANG_LABELS[code] || LANG_LABELS.uz).code;
    if (menuEl) {
      menuEl.querySelectorAll('.lang-switcher__item').forEach(function (it) {
        if (it.dataset.lang === code) it.classList.add('is-active');
        else it.classList.remove('is-active');
      });
    }
  }

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!switcherEl) return;
    if (switcherEl.contains(e.target)) return;
    closeMenu();
  });
  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  function inject() {
    if (document.querySelector('.lang-switcher')) return;
    document.body.appendChild(buildSwitcher());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
