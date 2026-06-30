/**
 * Focus Indicator — global "fokus davom etyapti" belgisi.
 *
 * Taymerдan chiqib boshqa ekranга o'tsangiz ham, faol sessiya (mvow.activeFocus)
 * bo'lsa — pastki o'ng burchakда kichik pill chiqadi: "⏱ 12:34 · Fokus".
 * Bosilsa -> hard-lock.html (taymerга qaytadi). Har soniyada yangilanadi.
 * Taymer ekranларида (hard-lock / multitimer) ko'rinmaydi.
 */
(function () {
  if (typeof document === 'undefined') return;
  var path = (location.pathname || '').toLowerCase();
  if (path.indexOf('hard-lock') >= 0 || path.indexOf('multitimer') >= 0) return;

  function read() {
    try { return JSON.parse(localStorage.getItem('mvow.activeFocus') || 'null'); }
    catch (e) { return null; }
  }
  function fmt(s) {
    s = Math.max(0, s | 0);
    var m = Math.floor(s / 60), x = s % 60;
    return String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
  }
  function t(k, fb) { return (window.I18N && I18N.t) ? I18N.t(k, fb) : fb; }
  function isExpired(a) { return !a || !a.mode || (Date.now() - (a.startedAt || 0) > 8 * 3600 * 1000); }

  var first = read();
  if (isExpired(first)) return;

  var pill = document.createElement('a');
  pill.href = 'hard-lock.html';
  pill.id = 'focusIndicator';
  pill.setAttribute('aria-label', t('hardlock.ind_active', 'Fokus'));
  pill.style.cssText = [
    'position:fixed', 'right:14px', 'bottom:calc(16px + env(safe-area-inset-bottom,0px))',
    'z-index:9000', 'display:flex', 'align-items:center', 'gap:8px',
    'padding:9px 15px', 'border-radius:999px', 'text-decoration:none',
    'background:#F4845F', 'color:#fff', 'font-family:Inter,sans-serif',
    'font-weight:700', 'font-size:14px', 'letter-spacing:.3px',
    'box-shadow:0 6px 22px rgba(244,132,95,.5)'
  ].join(';');

  var dot = document.createElement('span');
  dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#fff;animation:fiPulse 1.4s infinite;';
  var label = document.createElement('span');
  pill.appendChild(dot);
  pill.appendChild(label);

  var st = document.createElement('style');
  st.textContent = '@keyframes fiPulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,.7)}70%{box-shadow:0 0 0 7px rgba(255,255,255,0)}100%{box-shadow:0 0 0 0 rgba(255,255,255,0)}}';
  document.head.appendChild(st);

  var timer = null;
  function tick() {
    var a = read();
    if (isExpired(a)) { pill.style.display = 'none'; if (timer) clearInterval(timer); return; }
    var disp, done = false;
    if (a.mode === 'no-timer') {
      disp = fmt(Math.floor((Date.now() - (a.startedAt || Date.now())) / 1000));
    } else {
      var rem = (a.paused && typeof a.remaining === 'number')
        ? a.remaining
        : (a.totalSec || 0) - Math.floor((Date.now() - (a.phaseStartedAt || Date.now())) / 1000);
      if (rem <= 0) { done = true; rem = 0; }
      disp = fmt(rem);
    }
    if (done) {
      label.textContent = '✓ ' + t('hardlock.ind_done', 'Fokus tugadi');
    } else {
      label.textContent = '⏱ ' + disp + ' · ' + t('hardlock.ind_active', 'Fokus') + (a.paused ? ' ⏸' : '');
    }
  }

  function mount() {
    if (!document.body) { setTimeout(mount, 50); return; }
    document.body.appendChild(pill);
    tick();
    timer = setInterval(tick, 1000);
  }
  mount();
})();
