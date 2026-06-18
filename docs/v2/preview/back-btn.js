/**
 * Universal "orqaga" tugmasi — HAR sahifaga qo'yiladi.
 * Tepa-chap burchakda (til tugmasi tepa-o'ngda bo'lgani kabi).
 * Bosilganda: ichki tarix bo'lsa history.back(), aks holda home.html.
 *
 * Bosh/launcher sahifalarda (index, menu, gallery) kerak emas.
 */
(function () {
  var NO_BACK = ['', 'index.html', 'menu.html', 'gallery.html'];

  function t(key, fb) {
    return (window.I18N && typeof I18N.t === 'function') ? I18N.t(key, fb) : fb;
  }

  function init() {
    if (document.getElementById('globalBackBtn')) return; // ikki marta qo'shilmasin
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (NO_BACK.indexOf(file) !== -1) return;

    var label = t('common.back', 'Orqaga');
    var btn = document.createElement('button');
    btn.id = 'globalBackBtn';
    btn.type = 'button';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.textContent = '‹';

    var css = {
      position: 'fixed',
      top: 'max(12px, env(safe-area-inset-top, 12px))',
      left: '12px',
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      border: '1px solid rgba(212,175,55,0.55)',
      background: 'rgba(8,8,12,0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: '#f5d76e',
      fontSize: '24px',
      fontWeight: '500',
      lineHeight: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: '100000',
      WebkitTapHighlightColor: 'transparent',
      transition: 'transform .12s, background .15s'
    };
    for (var k in css) btn.style[k] = css[k];

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var ref = document.referrer || '';
      var sameOrigin = ref && ref.indexOf(location.origin) === 0;
      if (sameOrigin && window.history.length > 1) {
        history.back();
      } else {
        location.href = 'home.html';
      }
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
