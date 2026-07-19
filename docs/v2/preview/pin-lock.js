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
  function padOverlay(title, onDone, cancelable, onCancel) {
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
    if (cancelable) ov.querySelector('.pcancel').onclick = function () { if (ov.parentNode) document.documentElement.removeChild(ov); if (typeof onCancel === 'function') onCancel(); };
    return { shake: function (m) { msg.textContent = m; msg.style.color = '#ff6b6b'; entered = ''; renderDots(); } };
  }

  // "Mavjud emas" NIQOB oynasi — yashirilgan funksiya ochilganda. Bosilsa PIN so'raydi;
  // to'g'ri PIN -> kontent ochiladi, aks holda "Mavjud emas" bo'lib turaveradi.
  function disguiseOverlay(expected, onOk) {
    var dark = false; try { dark = localStorage.getItem('mvow.theme') === 'dark'; } catch (e) {}
    var bg = dark ? '#04060B' : '#f3f4f7', fg = dark ? '#F5F2EC' : '#15171c', sub = dark ? '#8A8A92' : '#6b7078';
    var ov = document.createElement('div');
    ov.id = 'mvow-disguise';
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483590;background:' + bg + ';color:' + fg + ';display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;font-family:Inter,sans-serif;text-align:center;-webkit-tap-highlight-color:transparent;';
    ov.innerHTML = '<div style="font-size:52px;margin-bottom:16px;opacity:.3;">🚫</div>'
      + '<div style="font-family:Anton,sans-serif;font-size:30px;letter-spacing:.5px;margin-bottom:8px;">Mavjud emas</div>'
      + '<div style="color:' + sub + ';font-size:15px;max-width:260px;line-height:1.5;">Bu bo\'lim mavjud emas.</div>';
    document.documentElement.appendChild(ov);
    var opened = false;
    ov.addEventListener('click', function () {
      if (opened) return; opened = true;
      padOverlay('Kodni kiriting', function (p) {
        if (p === expected) { if (ov.parentNode) ov.parentNode.removeChild(ov); if (typeof onOk === 'function') onOk(); }
        else { opened = false; }   // noto'g'ri -> niqob qoladi, qayta bosish mumkin
      }, true, function () { opened = false; });
    });
  }

  // Qulf oynasi — kutilgan PIN'ga tekshiradi (ilova PIN'i YOKI funksiya PIN'i). Cancelsiz.
  function gate(expected, onOk) {
    expected = (expected != null) ? expected : get();
    onOk = onOk || markUnlocked;
    function ask() {
      padOverlay('PIN kodni kiriting', function (p) {
        if (p === expected) { onOk(); }
        else { ask(); /* qayta */ }
      }, false);
    }
    ask();
  }

  // Tanlov modali (o'zgartirish / o'chirish)
  function chooseModal(opts, onPick, title) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:24px;font-family:Inter,sans-serif;';
    var card = document.createElement('div');
    card.style.cssText = 'background:#16161a;color:#fff;border-radius:18px;max-width:340px;width:100%;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.5);';
    card.innerHTML = '<div style="font-weight:800;font-size:18px;text-align:center;margin-bottom:16px;">' + (title || 'PIN qulf') + '</div>';
    opts.forEach(function (o, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = o.label;
      b.style.cssText = 'display:block;width:100%;margin-bottom:10px;padding:14px;border-radius:12px;border:' + (o.danger ? 'none' : '1px solid rgba(125,125,125,.3)') + ';background:' + (o.danger ? '#e0483c' : 'transparent') + ';color:#fff;font-weight:700;font-size:15px;cursor:pointer;font-family:Inter;text-align:left;';
      b.onclick = function () { if (ov.parentNode) document.body.removeChild(ov); onPick(i); };
      card.appendChild(b);
    });
    var cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Yopish';
    cancel.style.cssText = 'display:block;width:100%;margin-top:4px;padding:12px;border:none;background:none;color:#9aa;font-weight:600;font-size:15px;cursor:pointer;font-family:Inter;';
    cancel.onclick = function () { if (ov.parentNode) document.body.removeChild(ov); };
    card.appendChild(cancel);
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

  // ── Har funksiyaga ALOHIDA (o'z) PIN kodi — ilova PIN'idan va bir-biridan farqli ──
  function featPins() { try { var m = JSON.parse(localStorage.getItem('mvow.featPins') || '{}'); return (m && typeof m === 'object') ? m : {}; } catch (e) { return {}; } }
  function getFeatPin(key) { return featPins()[key] || ''; }
  function hasFeatPin(key) { return !!getFeatPin(key); }
  function setFeatPin(key, pin) { var m = featPins(); m[key] = String(pin); try { localStorage.setItem('mvow.featPins', JSON.stringify(m)); } catch (e) {} }
  function clearFeatPin(key) { var m = featPins(); delete m[key]; try { localStorage.setItem('mvow.featPins', JSON.stringify(m)); sessionStorage.removeItem('mvow.funlock.' + key); } catch (e) {} }
  function featUnlocked(key) { try { return sessionStorage.getItem('mvow.funlock.' + key) === '1'; } catch (e) { return false; } }
  function markFeatUnlocked(key) { try { sessionStorage.setItem('mvow.funlock.' + key, '1'); } catch (e) {} }
  // Funksiyaga yangi PIN o'rnatish (2 marta so'rab). onDone(true/false).
  function setFeaturePin(key, onDone) {
    padOverlay('Yangi PIN (4 raqam)', function (p1) {
      padOverlay('PINni takrorlang', function (p2) {
        if (p1 === p2) { setFeatPin(key, p1); markFeatUnlocked(key); toast("Qulf o'rnatildi ✓"); if (onDone) onDone(true); }
        else { toast('PIN mos kelmadi'); if (onDone) onDone(false); }
      }, true, function () { if (onDone) onDone(false); });
    }, true, function () { if (onDone) onDone(false); });
  }
  // Funksiya PIN'ini o'chirish — joriy PINni so'rab. onDone(true/false).
  function disableFeaturePin(key, onDone) {
    if (!hasFeatPin(key)) { if (onDone) onDone(true); return; }
    padOverlay('Joriy PINni kiriting', function (p) {
      if (p === getFeatPin(key)) { clearFeatPin(key); toast("Qulf o'chirildi"); if (onDone) onDone(true); }
      else { toast("Noto'g'ri PIN"); if (onDone) onDone(false); }
    }, true, function () { if (onDone) onDone(false); });
  }

  // ── Yashirish + nom (markazlashgan API) ──
  function hiddenFeats() { try { var a = JSON.parse(localStorage.getItem('mvow.hiddenFeatures') || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function isHidden(key) { return hiddenFeats().indexOf(key) >= 0; }
  function setHidden(key, on) { var a = hiddenFeats(), i = a.indexOf(key); if (on && i < 0) a.push(key); if (!on && i >= 0) a.splice(i, 1); try { localStorage.setItem('mvow.hiddenFeatures', JSON.stringify(a)); } catch (e) {} }
  var LABELS = { hamyon: 'Hamyon', blaknot: 'Blaknot', goyalar: "G'oyalarim", orzular: 'Orzular', uyqu: 'Uyqu', mukofot: 'Mukofotlar', shahar: 'Shahringiz', eslatma: 'Eslatmalar', hisobot: 'Hisobot', dostlar: "Do'stlar" };
  function featName(key) { try { var n = JSON.parse(localStorage.getItem('mvow.featNames') || '{}'); return n[key] || LABELS[key] || key; } catch (e) { return LABELS[key] || key; } }
  function setFeatName(key, name) { try { var n = JSON.parse(localStorage.getItem('mvow.featNames') || '{}'); if (name) n[key] = name; else delete n[key]; localStorage.setItem('mvow.featNames', JSON.stringify(n)); } catch (e) {} }

  // Funksiyani O'Z sahifasidan boshqarish — ⋮ menyu (Nom / Yashirish / PIN). Sozlamalar shart emas.
  function manageFeature(key) {
    var opts = [
      { label: "✏️  Nom o'zgartirish" },
      { label: isHidden(key) ? "👁  Yashirishni o'chirish" : "🙈  Yashirish (Mavjud emas qilib)" },
      { label: hasFeatPin(key) ? "🔓  PIN qulfni o'chirish" : "🔒  PIN qulf qo'yish" }
    ];
    chooseModal(opts, function (i) {
      if (i === 0) { var nm = prompt("Yangi nom (bo'sh = asl nom):", featName(key)); if (nm !== null) { setFeatName(key, (nm || '').trim()); toast('Saqlandi ✓'); setTimeout(function () { location.reload(); }, 400); } }
      else if (i === 1) {
        // Yashirish: sahifa ochilganda "Mavjud emas" bo'lib ko'rinadi, PIN bilan ochiladi.
        // Shuning uchun PIN SHART — yo'q bo'lsa avval o'rnatamiz.
        if (isHidden(key)) {
          setHidden(key, false);
          toast("Yashirish o'chirildi — sahifa oddiy ochiladi ✓");
        } else if (hasFeatPin(key)) {
          setHidden(key, true);
          toast("Yashirildi — sahifa 'Mavjud emas' bo'lib ko'rinadi. PIN bilan ochasiz ✓");
        } else {
          toast('Avval PIN kod o\'ylab toping — u bilan ochasiz');
          setFeaturePin(key, function (ok) {
            if (ok) { setHidden(key, true); toast("Yashirildi — sahifa 'Mavjud emas' bo'lib ko'rinadi. PIN bilan ochasiz ✓"); }
          });
        }
      }
      else {
        // PIN o'chirilsa va funksiya yashirilgan bo'lsa — niqobni ham o'chiramiz (aks holda kirib bo'lmaydi).
        if (hasFeatPin(key)) disableFeaturePin(key, function (ok) { if (ok && isHidden(key)) setHidden(key, false); });
        else setFeaturePin(key);
      }
    }, featName(key));
  }

  // Avtomatik qulf. USTUVORLIK: 1) funksiyaning O'Z PIN'i, 2) ilova PIN'i (butun ilova/app-PIN'li funksiya).
  var _file = (location.pathname.split('/').pop() || '').toLowerCase();
  var _feat = FEATURES[_file];
  // Funksiya sahifasida ⋮ boshqaruv tugmasi (qulf ochilgach ko'rinadi)
  function injectManageBtn() {
    if (!_feat || document.getElementById('mvow-feat-manage')) return;
    var b = document.createElement('button');
    b.id = 'mvow-feat-manage'; b.type = 'button'; b.textContent = '⋮'; b.title = 'Sozlash'; b.setAttribute('aria-label', 'Sozlash');
    b.style.cssText = 'position:fixed;top:max(12px,env(safe-area-inset-top,12px));left:116px;z-index:99992;width:40px;height:40px;border-radius:50%;border:1px solid rgba(108,92,231,0.4);background:rgba(12,14,20,0.94);color:#fff;font-size:22px;line-height:1;cursor:pointer;';
    b.onclick = function () { manageFeature(_feat); };
    document.body.appendChild(b);
  }
  if (_feat) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectManageBtn); else injectManageBtn(); }
  function _autoGate() {
    // Yashirilgan + PIN'li funksiya -> "Mavjud emas" niqob (PIN bilan ochiladi).
    if (_feat && isHidden(_feat) && hasFeatPin(_feat) && !featUnlocked(_feat)) { disguiseOverlay(getFeatPin(_feat), function () { markFeatUnlocked(_feat); }); return; }
    if (_feat && hasFeatPin(_feat) && !featUnlocked(_feat)) { gate(getFeatPin(_feat), function () { markFeatUnlocked(_feat); }); return; }
    if (has() && !unlocked() && (appLockOn() || (_feat && isFeatureLocked(_feat)))) { gate(); }
  }
  if ((_feat && hasFeatPin(_feat) && !featUnlocked(_feat)) || (has() && !unlocked() && (appLockOn() || (_feat && isFeatureLocked(_feat))))) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _autoGate);
    else _autoGate();
  }

  window.PinLock = {
    has: has, manage: manage, clear: clearPin,
    appLockOn: appLockOn, setAppLock: setAppLock,
    lockedFeatures: lockedFeatures, isFeatureLocked: isFeatureLocked, setFeatureLocked: setFeatureLocked,
    hasFeatPin: hasFeatPin, getFeatPin: getFeatPin, setFeaturePin: setFeaturePin, disableFeaturePin: disableFeaturePin, clearFeatPin: clearFeatPin,
    isHidden: isHidden, setHidden: setHidden, featName: featName, setFeatName: setFeatName, labelOf: function (k) { return LABELS[k] || k; }, manageFeature: manageFeature,
    FEATURES: FEATURES
  };
})();
