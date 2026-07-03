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

    // Til tugmasini ixcham qilamiz — faqat globus (UZ/RU/EN matni yashirin), 40px doira
    if (!document.getElementById('mvow-lang-css')) {
      var st = document.createElement('style'); st.id = 'mvow-lang-css';
      st.textContent = '.lang-switcher__btn{width:40px !important;height:40px !important;min-width:0 !important;padding:0 !important;border-radius:50% !important;display:flex !important;align-items:center;justify-content:center;gap:0 !important;}.lang-switcher__code{display:none !important;}.lang-switcher__icon{width:20px;height:20px;}';
      document.head.appendChild(st);
    }

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
      '</svg>';

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

  // Har sahifada til tugmasi YONIGA (chapiga) Do'stlar + Sovrinlar ikonkalari
  function buildQuickNav() {
    if (document.getElementById('mvow-quicknav')) return;
    // Onboarding (tanishuv) ekranlarida ijtimoiy ikonkalar chiqmasin — toza birinchi taassurot
    var _f = (location.pathname.split('/').pop() || '').toLowerCase();
    if (['intro.html', 'anketa.html', 'vada.html', 'welcome.html', 'index.html', ''].indexOf(_f) >= 0) return;
    var qn = document.createElement('div');
    qn.id = 'mvow-quicknav';
    qn.style.cssText = 'position:fixed;z-index:99991;display:flex;gap:8px;';
    function mk(emoji, href, label) {
      var a = document.createElement('a');
      a.href = href; a.title = label; a.setAttribute('aria-label', label);
      a.style.cssText = 'width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;line-height:1;text-decoration:none;background:rgba(8,8,12,0.85);border:1px solid rgba(108,92,231,0.4);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);';
      a.textContent = emoji;
      return a;
    }
    qn.appendChild(mk('👥', 'dostlar.html', "Do'stlar"));
    qn.appendChild(mk('🏅', 'sovrinlar.html', 'Sovrinlar'));
    qn.appendChild(mk('🔥', 'fokus-izi.html', 'Seriya'));
    document.body.appendChild(qn);
    function place() {
      var lang = document.querySelector('.lang-switcher');
      if (!lang) { qn.style.top = '14px'; qn.style.right = '64px'; return; }
      var r = lang.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) { qn.style.display = 'none'; return; }  // til tugmasi yashirin (mas. fokusda)
      qn.style.display = 'flex';
      qn.style.top = r.top + 'px';
      qn.style.right = Math.max(8, window.innerWidth - r.left + 8) + 'px';
    }
    place();
    setTimeout(place, 200); setTimeout(place, 700);
    window.addEventListener('resize', place);
  }

  function init() { build(); buildQuickNav(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
