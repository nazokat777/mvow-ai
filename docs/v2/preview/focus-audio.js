/**
 * FocusAudio — fokus uchun TABIAT ovozlari (Web Audio API).
 *
 * 3 rejim: 'rain' (yomg'ir 🌧), 'ocean' (dengiz to'lqinlari 🌊), 'forest' (o'rmon+qushlar 🐦).
 * Ovoz brauzerда generatsiya qilinadi (fayl yuklamaydi) — offline ishlaydi, litsenziya
 * muammosi yo'q, og'irlik qo'shmaydi. Har rejim alohida, tanib olinadigan ambient.
 *
 * FocusAudio.cycle() — off -> rain -> ocean -> forest -> off (tugma uchun)
 * FocusAudio.mode()  — joriy rejim ('off' bo'lsa o'chiq)
 * FocusAudio.start()/.stop()/.toggle()/.isOn()/.pref()  — eski API bilan mos
 */
(function (global) {
  var PREF = 'mvow.focusSound';
  var MODES = ['rain', 'ocean', 'forest'];
  var ctx = null, master = null, nodes = [], timers = [], current = 'off';

  function AC() { return global.AudioContext || global.webkitAudioContext; }
  function ensureCtx() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    var A = AC(); if (!A) return null;
    ctx = new A(); if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function noiseBuffer(c, brown) {
    var len = Math.floor(c.sampleRate * 4), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      else { d[i] = w * 0.6; }
    }
    return buf;
  }
  function noiseSource(c, brown) { var s = c.createBufferSource(); s.buffer = noiseBuffer(c, brown); s.loop = true; return s; }

  function teardown() {
    timers.forEach(function (t) { clearInterval(t); }); timers = [];
    nodes.forEach(function (n) { try { if (n.stop) n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} }); nodes = [];
    if (master) { try { master.disconnect(); } catch (e) {} master = null; }
  }

  // ── YOMG'IR: past "gувиллаш" (brown) + yuqori "shatirlash" (white highpass) ──
  function buildRain(c) {
    var base = noiseSource(c, true), bf = c.createBiquadFilter(); bf.type = 'lowpass'; bf.frequency.value = 780; bf.Q.value = 0.5;
    var bg = c.createGain(); bg.gain.value = 0.09;
    base.connect(bf); bf.connect(bg); bg.connect(master);
    var patt = noiseSource(c, false), pf = c.createBiquadFilter(); pf.type = 'highpass'; pf.frequency.value = 1100;
    var pg = c.createGain(); pg.gain.value = 0.05;
    patt.connect(pf); pf.connect(pg); pg.connect(master);
    // nafas oldirish — LFO patter darajasiga
    var lfo = c.createOscillator(); lfo.frequency.value = 0.13; var lg = c.createGain(); lg.gain.value = 0.02;
    lfo.connect(lg); lg.connect(pg.gain);
    base.start(); patt.start(); lfo.start();
    nodes.push(base, patt, lfo, bf, pf, bg, pg, lg);
  }

  // ── DENGIZ: past shovqin + sekin LFO gain (to'lqin ko'tarilib-tushadi) ──
  function buildOcean(c) {
    var src = noiseSource(c, true), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 480; f.Q.value = 0.4;
    var g = c.createGain(); g.gain.value = 0.06;
    src.connect(f); f.connect(g); g.connect(master);
    var lfo = c.createOscillator(); lfo.frequency.value = 0.09; var lg = c.createGain(); lg.gain.value = 0.06; // 0..0.12 to'lqin
    lfo.connect(lg); lg.connect(g.gain);
    var lfo2 = c.createOscillator(); lfo2.frequency.value = 0.17; var lg2 = c.createGain(); lg2.gain.value = 140;
    lfo2.connect(lg2); lg2.connect(f.frequency);
    src.start(); lfo.start(); lfo2.start();
    nodes.push(src, lfo, lfo2, f, g, lg, lg2);
  }

  // ── O'RMON: yumshoq shamol + tasodifiy qush chiyillashi ──
  function buildForest(c) {
    var wind = noiseSource(c, true), wf = c.createBiquadFilter(); wf.type = 'lowpass'; wf.frequency.value = 620; wf.Q.value = 0.3;
    var wg = c.createGain(); wg.gain.value = 0.05;
    wind.connect(wf); wf.connect(wg); wg.connect(master);
    var lfo = c.createOscillator(); lfo.frequency.value = 0.08; var lg = c.createGain(); lg.gain.value = 220;
    lfo.connect(lg); lg.connect(wf.frequency);
    wind.start(); lfo.start();
    nodes.push(wind, lfo, wf, wg, lg);
    function chirp() {
      if (!ctx || current !== 'forest') return;
      var t = c.currentTime, n = 1 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'sine';
        var base = 2200 + Math.random() * 1900;
        o.frequency.setValueAtTime(base, t);
        o.frequency.exponentialRampToValueAtTime(base * (1.15 + Math.random() * 0.4), t + 0.06);
        o.frequency.exponentialRampToValueAtTime(base, t + 0.12);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.05, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + 0.16);
        t += 0.08 + Math.random() * 0.07;
      }
    }
    timers.push(setInterval(function () { if (Math.random() < 0.7) chirp(); }, 2600 + Math.floor(Math.random() * 1200)));
  }

  function build(mode, c) {
    if (mode === 'ocean') buildOcean(c);
    else if (mode === 'forest') buildForest(c);
    else buildRain(c);
  }

  function savedMode() {
    try {
      var v = localStorage.getItem(PREF) || '';
      if (v === '1') return 'rain';
      if (MODES.indexOf(v) >= 0) return v;
      return '';
    } catch (e) { return ''; }
  }
  function saveMode(m) { try { localStorage.setItem(PREF, m || 'off'); } catch (e) {} }

  function start(mode) {
    mode = mode || savedMode() || 'rain';
    if (MODES.indexOf(mode) < 0) mode = 'rain';
    var c = ensureCtx(); if (!c) return false;
    teardown();
    master = c.createGain(); master.gain.value = 0.0001; master.connect(c.destination);
    build(mode, c);
    master.gain.setTargetAtTime(1, c.currentTime, 1.0); // yumshoq kirish
    current = mode; saveMode(mode);
    return true;
  }
  function stop() {
    if (current === 'off') return;
    try {
      if (master && ctx) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
      var t = teardown; setTimeout(function () { t(); }, 700);
    } catch (e) { teardown(); }
    current = 'off'; saveMode('off');
  }
  function setMode(mode) { if (!mode || mode === 'off') stop(); else start(mode); return current; }
  function cycle() {
    var order = ['off'].concat(MODES);
    var i = order.indexOf(current); if (i < 0) i = 0;
    setMode(order[(i + 1) % order.length]);
    return current;
  }
  function toggle() { if (current !== 'off') { stop(); } else { start(savedMode() || 'rain'); } return current !== 'off'; }
  function isOn() { return current !== 'off'; }
  function mode() { return current; }
  function pref() { return savedMode(); }  // '' bo'lsa o'chiq

  global.FocusAudio = { start: start, stop: stop, toggle: toggle, isOn: isOn, pref: pref, mode: mode, cycle: cycle, setMode: setMode, MODES: MODES };
})(typeof window !== 'undefined' ? window : this);
