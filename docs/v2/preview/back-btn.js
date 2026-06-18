/**
 * Universal navigatsiya tugmalari — HAR sahifaga qo'yiladi (tepa-chap):
 *   ‹  — orqaga (ichki tarix bo'lsa history.back(), aks holda home.html)
 *   ☰  — mundarija (barcha ekranlar ro'yxati: menu.html)
 * Til tugmasi tepa-o'ngda turadi.
 *
 * Bosh/launcher sahifalarda (index, menu, gallery) bu tugmalar kerak emas.
 */
(function () {
  var NO_NAV = ['', 'index.html', 'menu.html', 'gallery.html'];

  function t(key, fb) {
    return (window.I18N && typeof I18N.t === 'function') ? I18N.t(key, fb) : fb;
  }

  function baseStyle(btn, leftPx) {
    var css = {
      position: 'fixed',
      top: 'max(12px, env(safe-area-inset-top, 12px))',
      left: leftPx + 'px',
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      border: '1px solid rgba(212,175,55,0.55)',
      background: 'rgba(8,8,12,0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: '#f5d76e',
      fontSize: '22px',
      fontWeight: '500',
      lineHeight: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      textDecoration: 'none',
      zIndex: '100000',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform .12s, background .15s'
    };
    for (var k in css) btn.style[k] = css[k];
  }

  function init() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (NO_NAV.indexOf(file) !== -1) return;

    // ‹ Orqaga
    if (!document.getElementById('globalBackBtn')) {
      var back = document.createElement('button');
      back.id = 'globalBackBtn';
      back.type = 'button';
      var bl = t('common.back', 'Orqaga');
      back.setAttribute('aria-label', bl);
      back.title = bl;
      back.textContent = '‹';
      baseStyle(back, 12);
      back.addEventListener('click', function (e) {
        e.preventDefault();
        var ref = document.referrer || '';
        if (ref && ref.indexOf(location.origin) === 0 && window.history.length > 1) history.back();
        else location.href = 'home.html';
      });
      document.body.appendChild(back);
    }

    // ☰ Mundarija (barcha ekranlar)
    if (!document.getElementById('globalMenuBtn')) {
      var menu = document.createElement('a');
      menu.id = 'globalMenuBtn';
      menu.href = 'menu.html';
      var ml = t('common.menu', 'Mundarija');
      menu.setAttribute('aria-label', ml);
      menu.title = ml;
      menu.textContent = '☰'; // ☰
      baseStyle(menu, 64);
      menu.style.fontSize = '18px';
      document.body.appendChild(menu);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
