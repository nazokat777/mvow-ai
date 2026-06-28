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
    $('sessSub').textContent = 'Maqsad: ' + fmtH(h.timer.goalMs);
    var p = T.progress(h.timer, t);
    var circ = 791.68;
    var fill = $('ringFill');
    fill.style.stroke = 'rgb(' + h.color + ')';
    fill.setAttribute('stroke-dashoffset', (circ * (1 - p)).toFixed(1));
    $('sessTime').textContent = fmtClock(T.elapsed(h.timer, t));
    $('sessOf').textContent = '/ ' + fmtH(h.timer.goalMs);
    $('sessPct').textContent = Math.round(p * 100) + '%';
    renderControls();
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

  function startSession() { current.timer = T.start(current.timer, now()); save(); renderSession(); }
  function pauseSession() { current.timer = T.pause(current.timer, now()); save(); renderSession(); }
  function finishSession() { current.timer = T.finish(current.timer, now()); save(); renderSession(); }

  function winSession() {
    current.timer = T.finish(current.timer, now()); save();
    $('winText').textContent = current.name + ' — maqsadga yetdingiz! 🎉';
    $('winOverlay').classList.add('show');
    renderControls();
  }

  function goDash() { current = null; stopTick(); renderDashboard(); show('screen-dashboard'); }

  // ---------- Tick (faqat ko'rsatish; manba = timestamp) ----------
  function startTick() {
    stopTick();
    tickTimer = setInterval(function () {
      if ($('screen-session').classList.contains('active') && current) renderSession();
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
    $('profileBtn').onclick = function () { /* profil — keyingi bosqich */ };
    $('winClose').onclick = function () { $('winOverlay').classList.remove('show'); goDash(); };
    var backs = document.querySelectorAll('[data-back]');
    for (var i = 0; i < backs.length; i++) backs[i].onclick = function () { goDash(); };
  }

  // ---------- Init ----------
  function init() {
    wire();
    renderDashboard();
    show('screen-dashboard');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // boshqa modullar uchun
  window.FocusApp = { get habits() { return habits; }, save: save, renderDashboard: renderDashboard };
})();
