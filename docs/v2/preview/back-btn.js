/**
 * Universal navigatsiya — HAR sahifaga (tepa-chap) BITTA kapsula ichida:
 *   ‹  — orqaga (ichki tarix bo'lsa history.back(), aks holda home.html)
 *   ☰  — mundarija (menu.html)
 * Til tugmasi tepa-o'ngda turadi.
 * Bosh/launcher sahifalarda (index, menu, gallery, app, intro) kerak emas.
 */
(function () {
  // menu.html — ‹ (qaytish) KERAK (u ro'yxatda emas); faqat ☰ keraksiz (allaqachon menyudamiz).
  var NO_NAV = ['', 'index.html', 'gallery.html', 'app.html', 'intro.html'];

  // ── Navigatsiya izi (o'z tariximiz) ──────────────────────────────
  // TWA/standalone'da document.referrer ko'pincha BO'SH bo'ladi, shuning uchun
  // history.back() qayerga borishini bilib bo'lmaydi. Sahifalar ketma-ketligini
  // sessionStorage'da o'zimiz yuritamiz — ‹ har doim ROSTDAN oldingi sahifaga qaytadi.
  var STACK_KEY = 'mvow.navstack';

  function readStack() {
    try { var a = JSON.parse(sessionStorage.getItem(STACK_KEY) || '[]'); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function writeStack(a) {
    try { sessionStorage.setItem(STACK_KEY, JSON.stringify(a.slice(-25))); } catch (e) {}
  }
  function pushCurrent(file) {
    var st = readStack();
    if (st[st.length - 1] === file) return;          // yangilash/qayta yuklash — takrorlamaymiz
    if (st[st.length - 2] === file) { st.pop(); writeStack(st); return; }  // orqaga qaytdik
    st.push(file);
    writeStack(st);
  }
  // ‹ bosilganda: izdan oldingi sahifani olamiz.
  function goBack() {
    var st = readStack();
    st.pop();                                        // joriy sahifani olib tashlaymiz
    var prev = st[st.length - 1];
    writeStack(st);
    if (prev) { location.href = prev; return; }
    var ref = document.referrer || '';
    if (ref && ref.indexOf(location.origin) === 0 && window.history.length > 1) { history.back(); return; }
    var f = (location.pathname.split('/').pop() || '').toLowerCase();
    location.href = (f === 'home.html') ? 'menu.html' : 'home.html';
  }
  window.MvowBack = { go: goBack };

  function t(key, fb) {
    return (window.I18N && typeof I18N.t === 'function') ? I18N.t(key, fb) : fb;
  }

  function makeBtn(content, label, tag) {
    var b = document.createElement(tag);
    b.setAttribute('aria-label', label);
    b.title = label;
    b.textContent = content;
    var s = {
      width: '48px',
      height: '44px',
      background: 'transparent',
      border: 'none',
      color: '#fff',
      fontSize: '22px',
      fontWeight: '500',
      lineHeight: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      textDecoration: 'none',
      WebkitTapHighlightColor: 'transparent',
      transition: 'background .15s'
    };
    for (var k in s) b.style[k] = s[k];
    b.addEventListener('mousedown', function () { b.style.background = 'rgba(255,255,255,0.18)'; });
    b.addEventListener('mouseup', function () { b.style.background = 'transparent'; });
    b.addEventListener('mouseleave', function () { b.style.background = 'transparent'; });
    return b;
  }

  function init() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    pushCurrent(file || 'home.html');   // NO_NAV sahifalar ham izga yoziladi
    if (NO_NAV.indexOf(file) !== -1) return;
    if (document.getElementById('globalNavCaps')) return;

    // Kapsula (pill) — ‹ | ☰
    var caps = document.createElement('div');
    caps.id = 'globalNavCaps';
    var capStyle = {
      position: 'fixed',
      top: 'max(12px, env(safe-area-inset-top, 12px))',
      left: '12px',
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(20,22,30,0.92)',
      border: '1px solid rgba(255,255,255,0.22)',
      borderRadius: '999px',
      overflow: 'hidden',
      zIndex: '100000',
      boxShadow: '0 4px 14px rgba(0,0,0,0.40)'
    };
    for (var k in capStyle) caps.style[k] = capStyle[k];

    // ‹ Orqaga
    var bl = t('common.back', 'Orqaga');
    var back = makeBtn('‹', bl, 'button');
    back.id = 'globalBackBtn';
    back.type = 'button';
    back.addEventListener('click', function (e) {
      e.preventDefault();
      goBack();
    });

    // Ajratuvchi chiziq
    var divider = document.createElement('span');
    divider.style.cssText = 'width:1px;height:22px;background:rgba(255,255,255,0.22);flex-shrink:0;';

    // ☰ Mundarija
    var ml = t('common.menu', 'Mundarija');
    var menu = makeBtn('☰', ml, 'a');
    menu.id = 'globalMenuBtn';
    menu.href = 'menu.html';
    menu.style.fontSize = '18px';

    caps.appendChild(back);
    // Menyuning O'ZIDA ☰ keraksiz — faqat ‹ qaytish qoladi.
    if (file !== 'menu.html') { caps.appendChild(divider); caps.appendChild(menu); }
    document.body.appendChild(caps);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
