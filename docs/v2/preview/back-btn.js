/**
 * Universal navigatsiya — HAR sahifaga (tepa-chap) BITTA kapsula ichida:
 *   ‹  — orqaga (ichki tarix bo'lsa history.back(), aks holda home.html)
 *   ☰  — mundarija (menu.html)
 * Til tugmasi tepa-o'ngda turadi.
 * Bosh/launcher sahifalarda (index, menu, gallery, app, intro) kerak emas.
 */
(function () {
  var NO_NAV = ['', 'index.html', 'menu.html', 'gallery.html', 'app.html', 'intro.html'];

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
      color: '#8B7CF0',
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
    b.addEventListener('mousedown', function () { b.style.background = 'rgba(108,92,231,0.16)'; });
    b.addEventListener('mouseup', function () { b.style.background = 'transparent'; });
    b.addEventListener('mouseleave', function () { b.style.background = 'transparent'; });
    return b;
  }

  function init() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
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
      background: 'rgba(8,8,12,0.85)',
      border: '1px solid rgba(108, 92, 231, 0.55)',
      borderRadius: '999px',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
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
      var ref = document.referrer || '';
      if (ref && ref.indexOf(location.origin) === 0 && window.history.length > 1) history.back();
      else location.href = 'home.html';
    });

    // Ajratuvchi chiziq
    var divider = document.createElement('span');
    divider.style.cssText = 'width:1px;height:22px;background:rgba(108,92,231,0.35);flex-shrink:0;';

    // ☰ Mundarija
    var ml = t('common.menu', 'Mundarija');
    var menu = makeBtn('☰', ml, 'a');
    menu.id = 'globalMenuBtn';
    menu.href = 'menu.html';
    menu.style.fontSize = '18px';

    caps.appendChild(back);
    caps.appendChild(divider);
    caps.appendChild(menu);
    document.body.appendChild(caps);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
