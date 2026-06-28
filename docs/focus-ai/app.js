'use strict';
/**
 * Focus AI — ilova mantig'i (single-page).
 * Store (localStorage) + router + FocusTimer integratsiyasi + render.
 */
(function () {
  var T = window.FocusTimer;
  var KEY = 'focusai.habits';
  var ICONS = ['📚','🏃','💪','🧘','💻','🎨','🎸','🌱','📝','🧠','🌅','📖'];
  var COLORS = ['244,132,95','107,191,122','232,130,180','110,181,255','245,194,107','167,139,250'];

  var habits = load();
  var current = null;       // faol sessiya odati
  var draft = { icon: ICONS[0], color: COLORS[0], hours: 1 };
  var tickTimer = null;
  var faceDown = false, motionOn = false;

  // ---------- Haptic + ovoz ----------
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function ding() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      var ctx = new AC(), o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      o.start(); o.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  // ---------- Telefon yuztuban (akselerometr) ----------
  function onMotion(e) { var a = e.accelerationIncludingGravity; if (a) faceDown = window.FocusMotion.isFaceDown(a.z); }
  function enableMotion() {
    if (motionOn) return;
    var add = function () { window.addEventListener('devicemotion', onMotion); motionOn = true; };
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission().then(function (r) { if (r === 'granted') add(); }).catch(function () {});
      } else add();
    } catch (e) {}
  }

  // ---------- Storage ----------
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(habits)); } catch (e) {}
  }
  function uid() { return 'h' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }
  function now() { return Date.now(); }
  function fmtClock(ms) {
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return h > 0 ? (h + ':' + pad(m) + ':' + pad(sec)) : (pad(m) + ':' + pad(sec));
  }
  function fmtH(ms) {
    var h = ms / 3600000;
    return (Math.round(h * 10) / 10) + ' soat';
  }

  // ---------- Router ----------
  function show(id) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    $(id).classList.add('active');
    $('addFab').classList.toggle('hidden', id !== 'screen-dashboard');
    window.scrollTo(0, 0);
  }

  // ---------- Dashboard ----------
  function renderDashboard() {
    var wrap = $('habitsWrap');
    var WD = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    var MO = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    var d = new Date();
    $('todayDate').textContent = d.getDate() + ' ' + MO[d.getMonth()] + ' · ' + WD[d.getDay()];

    if (!habits.length) {
      wrap.innerHTML =
        '<div class="empty"><div class="big">🎯</div><h2>Birinchi odat</h2>' +
        '<p>Pastdagi tugma bilan odat qo\'shing.<br>Vaqt sarflang — jarayon to\'lsin.</p></div>';
      return;
    }
    var html = '<div class="habits">';
    for (var i = 0; i < habits.length; i++) {
      var h = habits[i];
      var p = T.progress(h.timer, now());
      var pct = Math.round(p * 100);
      var running = T.isRunning(h.timer);
      var ringCirc = 2 * Math.PI * 21;
      html +=
        '<div class="habit' + (h.timer.done ? ' done' : '') + '" data-id="' + h.id + '" style="--hc:' + h.color + '">' +
          (running ? '<div class="runbadge">● ketyapti</div>' : '') +
          '<div class="emoji">' + h.icon + '</div>' +
          '<div class="info"><div class="hname">' + esc(h.name) + '</div>' +
            '<div class="hmeta">' + fmtClock(T.elapsed(h.timer, now())) + ' / ' + fmtH(h.timer.goalMs) + '</div></div>' +
          '<div class="ring"><svg width="50" height="50" viewBox="0 0 50 50">' +
            '<circle cx="25" cy="25" r="21" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="5"/>' +
            '<circle cx="25" cy="25" r="21" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" ' +
              'transform="rotate(-90 25 25)" stroke-dasharray="' + ringCirc.toFixed(1) + '" ' +
              'stroke-dashoffset="' + (ringCirc * (1 - p)).toFixed(1) + '"/></svg>' +
            '<div class="pct">' + (h.timer.done ? '✓' : pct + '%') + '</div></div>' +
        '</div>';
    }
    html += '</div>';
    wrap.innerHTML = html;
    var cards = wrap.querySelectorAll('.habit');
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener('click', function () { openSession(this.getAttribute('data-id')); });
    }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  // ---------- Add habit ----------
  function renderAdd() {
    draft = { icon: ICONS[0], color: COLORS[0], hours: 1 };
    $('hName').value = '';
    var ig = $('iconGrid'); ig.innerHTML = '';
    ICONS.forEach(function (ic) {
      var b = document.createElement('div');
      b.className = 'pick' + (ic === draft.icon ? ' on' : '');
      b.textContent = ic;
      b.onclick = function () { draft.icon = ic; refreshPicks(); };
      ig.appendChild(b);
    });
    var cg = $('colorGrid'); cg.innerHTML = '';
    COLORS.forEach(function (col) {
      var b = document.createElement('div');
      b.className = 'pick swatch' + (col === draft.color ? ' on' : '');
      b.style.background = 'rgb(' + col + ')';
      b.onclick = function () { draft.color = col; refreshPicks(); };
      cg.appendChild(b);
    });
    $('hVal').textContent = draft.hours;
  }
  function refreshPicks() {
    var ig = $('iconGrid').children, cg = $('colorGrid').children, i;
    for (i = 0; i < ig.length; i++) ig[i].classList.toggle('on', ig[i].textContent === draft.icon);
    for (i = 0; i < cg.length; i++) cg[i].classList.toggle('on', cg[i].style.background === 'rgb(' + draft.color + ')');
  }

  // ---------- Session ----------
  function openSession(id) {
    current = findHabit(id);
    if (!current) return;
    show('screen-session');
    renderSession();
    startTick();
  }
  function findHabit(id) { for (var i = 0; i < habits.length; i++) if (habits[i].id === id) return habits[i]; return null; }

  function renderSession() {
    if (!current) return;
    var h = current, t = now();
    $('sessName').textContent = h.icon + '  ' + h.name;
    var fm = h.focusMs ? ' · 🎯 ' + Math.round(h.focusMs / 60000) + 'm sof fokus' : '';
    $('sessSub').textContent = 'Maqsad: ' + fmtH(h.timer.goalMs) + fm;
    var p = T.progress(h.timer, t);
    var fill = $('ringFill');
    fill.style.stroke = 'rgb(' + h.color + ')';
    fill.setAttribute('stroke-dashoffset', (791.68 * (1 - p)).toFixed(1));
    $('sessTime').textContent = fmtClock(T.elapsed(h.timer, t));
    $('sessOf').textContent = '/ ' + fmtH(h.timer.goalMs);
    $('sessPct').textContent = Math.round(p * 100) + '%';
    renderControls();
    // Fokus rejimi — telefon yuztuban
    var hint = $('focusHint'), ring = $('bigring');
    if (T.isRunning(h.timer)) {
      if (faceDown) { hint.textContent = '📵 Telefon qo\'yildi — chuqur fokusdasiz!'; hint.classList.add('active'); ring.classList.add('focusing'); }
      else { hint.textContent = '💡 Telefonni yuztuban qo\'ying — chuqur fokus'; hint.classList.remove('active'); ring.classList.remove('focusing'); }
    } else { hint.textContent = ''; hint.classList.remove('active'); ring.classList.remove('focusing'); }
    // 100% — g'alaba
    if (T.isComplete(h.timer, t) && !h.timer.done) winSession();
  }

  function renderControls() {
    var h = current, ctl = $('sessCtl');
    if (h.timer.done) { ctl.innerHTML = '<button class="ctl fin" id="cDash">Bajarildi ✓</button>'; bind('cDash', goDash); return; }
    if (T.isRunning(h.timer)) {
      ctl.innerHTML = '<button class="ctl pause" id="cPause">Pauza</button><button class="ctl fin" id="cFin">Yakunlash</button>';
      bind('cPause', pauseSession); bind('cFin', finishSession);
    } else {
      var label = T.elapsed(h.timer, now()) > 0 ? 'Davom etish' : 'Boshlash';
      ctl.innerHTML = '<button class="ctl go" id="cGo">' + label + '</button>' +
        (T.elapsed(h.timer, now()) > 0 ? '<button class="ctl fin" id="cFin">Yakunlash</button>' : '');
      bind('cGo', startSession); if (T.elapsed(h.timer, now()) > 0) bind('cFin', finishSession);
    }
  }
  function bind(id, fn) { var el = $(id); if (el) el.onclick = fn; }

  function startSession() { current.timer = T.start(current.timer, now()); buzz(30); enableMotion(); save(); renderSession(); }
  function pauseSession() { buzz(20); current.timer = T.pause(current.timer, now()); faceDown = false; save(); renderSession(); }
  function finishSession() { buzz([40, 30, 40]); current.timer = T.finish(current.timer, now()); faceDown = false; save(); renderSession(); }

  function winSession() {
    current.timer = T.finish(current.timer, now()); save();
    buzz([60, 40, 60, 40, 140]); ding();
    var fm = current.focusMs ? ' 🎯 ' + Math.round(current.focusMs / 60000) + 'm sof fokus!' : '';
    $('winText').textContent = current.name + ' — maqsadga yetdingiz! 🎉' + fm;
    $('winOverlay').classList.add('show');
    renderControls();
  }

  function goDash() { if (current) save(); current = null; faceDown = false; stopTick(); renderDashboard(); show('screen-dashboard'); }

  // ---------- Tick (faqat ko'rsatish; manba = timestamp) ----------
  function startTick() {
    stopTick();
    tickTimer = setInterval(function () {
      if ($('screen-session').classList.contains('active') && current) {
        if (T.isRunning(current.timer) && faceDown) current.focusMs = (current.focusMs || 0) + 250;
        renderSession();
      }
    }, 250);
  }
  function stopTick() { if (tickTimer) { clearInterval(tickTimer); tickTimer = null; } }

  // ---------- Events ----------
  function wire() {
    $('addFab').onclick = function () { renderAdd(); show('screen-add'); };
    $('hMinus').onclick = function () { draft.hours = Math.max(1, draft.hours - 1); $('hVal').textContent = draft.hours; };
    $('hPlus').onclick = function () { draft.hours = Math.min(24, draft.hours + 1); $('hVal').textContent = draft.hours; };
    $('saveHabit').onclick = function () {
      var name = $('hName').value.trim();
      if (!name) { $('hName').focus(); return; }
      habits.push({ id: uid(), name: name, icon: draft.icon, color: draft.color,
        timer: T.create(draft.hours * 3600000), createdAt: now() });
      save(); renderDashboard(); show('screen-dashboard');
    };
    $('profileBtn').onclick = function () { renderProfile(); show('screen-profile'); };
    $('obNext').onclick = obNext;
    $('obSkip').onclick = finishOnboard;
    $('authGuest').onclick = doGuest;
    $('themeToggle').onclick = toggleTheme;
    $('logoutBtn').onclick = logout;
    $('winClose').onclick = function () { $('winOverlay').classList.remove('show'); goDash(); };
    var backs = document.querySelectorAll('[data-back]');
    for (var i = 0; i < backs.length; i++) backs[i].onclick = function () { goDash(); };
  }

  // ---------- Flow: Onboarding / Auth / Profil / Theme ----------
  var K_ONB = 'focusai.onboarded', K_USER = 'focusai.user', K_THEME = 'focusai.theme';
  var obIndex = 0;

  function applyTheme() {
    var t = localStorage.getItem(K_THEME) === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0a0b0e' : '#f3f4f7');
  }
  function curTheme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function toggleTheme() {
    var t = curTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(K_THEME, t); } catch (e) {}
    applyTheme(); $('themeToggle').classList.toggle('on', t === 'dark');
  }

  function renderOnboard() {
    obIndex = 0;
    var dots = $('obDots'); dots.innerHTML = '';
    for (var i = 0; i < 3; i++) { var d = document.createElement('div'); d.className = 'ob-dot' + (i === 0 ? ' on' : ''); dots.appendChild(d); }
    updateOb();
  }
  function updateOb() {
    var slides = $('obSlides').children, dots = $('obDots').children, i;
    for (i = 0; i < slides.length; i++) slides[i].classList.toggle('on', i === obIndex);
    for (i = 0; i < dots.length; i++) dots[i].classList.toggle('on', i === obIndex);
    var next = $('obNext');
    if (obIndex === slides.length - 1) { next.classList.add('wide'); next.textContent = 'Boshlash'; }
    else { next.classList.remove('wide'); next.textContent = '→'; }
  }
  function obNext() { if (obIndex < 2) { obIndex++; updateOb(); } else finishOnboard(); }
  function finishOnboard() { try { localStorage.setItem(K_ONB, '1'); } catch (e) {} show('screen-auth'); }

  function doGuest() {
    var name = ($('authName').value || '').trim() || 'Mehmon';
    try { localStorage.setItem(K_USER, name); } catch (e) {}
    startApp();
  }
  function logout() { try { localStorage.removeItem(K_USER); } catch (e) {} $('authName').value = ''; show('screen-auth'); }

  function renderProfile() {
    var name = localStorage.getItem(K_USER) || 'Mehmon';
    $('profName').textContent = name;
    $('profAvatar').textContent = name === 'Mehmon' ? '🙂' : name.charAt(0).toUpperCase();
    $('themeToggle').classList.toggle('on', curTheme() === 'dark');
  }

  function startApp() { renderDashboard(); show('screen-dashboard'); }

  // ---------- Init ----------
  function init() {
    applyTheme();
    wire();
    if (!localStorage.getItem(K_ONB)) { renderOnboard(); show('screen-onboard'); }
    else if (!localStorage.getItem(K_USER)) { show('screen-auth'); }
    else startApp();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // boshqa modullar uchun
  window.FocusApp = { get habits() { return habits; }, save: save, renderDashboard: renderDashboard };
})();
