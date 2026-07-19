/**
 * FOCUS AI — PIN qulf (yumshoq qulf, localStorage).
 * Ilova ochilganda PIN so'raydi. PinLock.manage() — o'rnatish/o'zgartirish/o'chirish.
 * Eslatma: bu yumshoq qulf (mahalliy) — bolalar/tasodifiy kirishni to'sadi.
 */
(function () {
  var PIN_KEY = 'mvow.pin', UNLOCK_KEY = 'mvow.pinUnlocked';
  function has() { try { return !!localStorage.getItem(PIN_KEY); } catch (e) { return false; } }
  function get() { try { return localStorage.getItem(PIN_KEY) || ''; } catch (e) { return ''; } }
  function setPin(p) { try { localStorage.setItem(PIN_KEY, String(p)); } catch (e) {} }
  function clearPin() { try { localStorage.removeItem(PIN_KEY); sessionStorage.removeItem(UNLOCK_KEY); } catch (e) {} }
  function unlocked() { try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; } }
  function markUnlocked() { try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (e) {} }

  function toast(m) {
    var t = document.createElement('div');
    t.textContent = m;
    t.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%);background:#16161a;color:#fff;border:1px solid rgba(244,132,95,.5);padding:12px 20px;border-radius:999px;font:600 14px Inter,sans-serif;z-index:2147483647;box-shadow:0 10px 30px rgba(0,0,0,.4);';
    document.documentElement.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2200);
  }

  // Raqamli PIN oynasi — 4 raqam yig'adi, onDone(pin) chaqiradi. cancelable bo'lsa orqaga tugmasi bor.
  function padOverlay(title, onDone, cancelable) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:#0a0610;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;font-family:Inter,sans-serif;color:#fff;';
    ov.innerHTML = '<div style="font-size:40px;margin-bottom:10px;">🔒</div>'
      + '<div style="font-family:Anton,sans-serif;font-size:26px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">FOCUS AI</div>'
      + '<div class="pmsg" style="color:#9aa;font-size:15px;margin-bottom:22px;text-align:center;">' + title + '</div>'
      + '<div class="pdots" style="display:flex;gap:14px;margin-bottom:26px;"></div>'
      + '<div class="ppad" style="display:grid;grid-template-columns:repeat(3,72px);gap:14px;"></div>'
      + (cancelable ? '<button class="pcancel" style="margin-top:20px;background:none;border:none;color:#9aa;font:600 15px Inter;cursor:pointer;">Bekor</button>' : '');
    document.documentElement.appendChild(ov);
    var entered = '', dots = ov.querySelector('.pdots'), msg = ov.querySelector('.pmsg');
    function renderDots() {
      dots.innerHTML = '';
      for (var i = 0; i < 4; i++) {
        var d = document.createElement('div');
        d.style.cssText = 'width:14px;height:14px;border-radius:50%;border:2px solid rgba(244,132,95,.6);' + (i < entered.length ? 'background:rgb(244,132,95);' : '');
        dots.appendChild(d);
      }
    }
    renderDots();
    var pad = ov.querySelector('.ppad');
    ['1','2','3','4','5','6','7','8','9','','0','⌫'].forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = k;
      b.style.cssText = 'height:72px;border-radius:50%;border:1px solid rgba(125,125,125,.25);background:#16161a;color:#fff;font-size:24px;font-weight:700;cursor:pointer;' + (k === '' ? 'visibility:hidden;' : '');
      b.onclick = function () {
        if (k === '⌫') { entered = entered.slice(0, -1); renderDots(); return; }
        if (k === '' || entered.length >= 4) return;
        entered += k; renderDots();
        if (entered.length === 4) {
          var val = entered;
          setTimeout(function () { if (ov.parentNode) document.documentElement.removeChild(ov); onDone(val); }, 140);
        }
      };
      pad.appendChild(b);
    });
    if (cancelable) ov.querySelector('.pcancel').onclick = function () { if (ov.parentNode) document.documentElement.removeChild(ov); };
    return { shake: function (m) { msg.textContent = m; msg.style.color = '#ff6b6b'; entered = ''; renderDots(); } };
  }

  // Ilova ochilganda qulf
  function gate() {
    function ask() {
      var ui = padOverlay('PIN kodni kiriting', function check(p) {
        if (p === get()) { markUnlocked(); }
        else { ask(); /* qayta */ }
      }, false);
    }
    ask();
  }

  // Tanlov modali (o'zgartirish / o'chirish)
  function chooseModal(opts, onPick) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,sans-serif;';
    var card = document.createElement('div');
    card.style.cssText = 'background:#16161a;color:#fff;border-radius:18px;max-width:320px;width:100%;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.5);';
    card.innerHTML = '<div style="font-weight:800;font-size:17px;text-align:center;margin-bottom:16px;">PIN qulf</div>';
    opts.forEach(function (o, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o.label;
      b.style.cssText = 'display:block;width:100%;margin-bottom:10px;padding:13px;border-radius:12px;border:' + (o.danger ? 'none' : '1px solid rgba(125,125,125,.3)') + ';background:' + (o.danger ? '#e0483c' : 'transparent') + ';color:#fff;font-weight:700;font-size:15px;cursor:pointer;font-family:Inter;';
      b.onclick = function () { if (ov.parentNode) document.body.removeChild(ov); onPick(i); };
      card.appendChild(b);
    });
    ov.appendChild(card); document.body.appendChild(ov);
  }

  function setNew() {
    padOverlay("Yangi PIN o'ylab toping (4 raqam)", function (p1) {
      padOverlay('PINni takrorlang', function (p2) {
        if (p1 === p2) { setPin(p1); markUnlocked(); toast("PIN o'rnatildi ✓"); }
        else toast('PIN mos kelmadi — qayta urining');
      }, true);
    }, true);
  }

  function manage() {
    if (!has()) { setNew(); return; }
    chooseModal([
      { label: "PIN o'zgartirish" },
      { label: "PIN o'chirish", danger: true }
    ], function (i) {
      if (i === 0) padOverlay('Joriy PINni kiriting', function (p) { if (p === get()) setNew(); else toast("Noto'g'ri PIN"); }, true);
      else padOverlay('Joriy PINni kiriting', function (p) { if (p === get()) { clearPin(); toast("PIN o'chirildi"); } else toast("Noto'g'ri PIN"); }, true);
    });
  }

  // ── Qulf sozlamalari: butun ilova (appLock) va/yoki alohida funksiyalar ──
  // appLock default = YOQILGAN (PIN o'rnatilса, eski xatti-harakat: butun ilova qulf).
  function appLockOn() { try { var v = localStorage.getItem('mvow.appLock'); return v == null ? true : v === '1'; } catch (e) { return true; } }
  function setAppLock(on) { try { localStorage.setItem('mvow.appLock', on ? '1' : '0'); } catch (e) {} }
  function lockedFeatures() { try { var a = JSON.parse(localStorage.getItem('mvow.lockedFeatures') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function isFeatureLocked(name) { return lockedFeatures().indexOf(name) >= 0; }
  function setFeatureLocked(name, on) {
    var a = lockedFeatures(), i = a.indexOf(name);
    if (on && i < 0) a.push(name);
    if (!on && i >= 0) a.splice(i, 1);
    try { localStorage.setItem('mvow.lockedFeatures', JSON.stringify(a)); } catch (e) {}
  }
  // sahifa fayli -> funksiya kaliti (settings shu ro'yxatdan foydalanadi)
  var FEATURES = {
    'hamyon.html': 'hamyon', 'blaknot.html': 'blaknot', 'goyalar.html': 'goyalar',
    'orzular.html': 'orzular', 'uyqu.html': 'uyqu', 'mukofotlar.html': 'mukofot',
    'shahar.html': 'shahar', 'eslatmalar.html': 'eslatma', 'hisobot.html': 'hisobot', 'dostlar.html': 'dostlar'
  };

  // Avtomatik qulf: PIN o'rnatilgan + bu sessiyada ochilmagan + (butun ilova YOKI joriy funksiya qulflangan).
  var _file = (location.pathname.split('/').pop() || '').toLowerCase();
  var _feat = FEATURES[_file];
  if (has() && !unlocked() && (appLockOn() || (_feat && isFeatureLocked(_feat)))) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', gate);
    else gate();
  }

  window.PinLock = {
    has: has, manage: manage, clear: clearPin,
    appLockOn: appLockOn, setAppLock: setAppLock,
    lockedFeatures: lockedFeatures, isFeatureLocked: isFeatureLocked, setFeatureLocked: setFeatureLocked,
    FEATURES: FEATURES
  };
})();
