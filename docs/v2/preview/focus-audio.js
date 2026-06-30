/**
 * FocusAudio — fokus uchun yumshoq ambient ovoz (Web Audio API).
 *
 * Fayl YUKLAMAYDI — ovoz brauzerда generatsiya qilinadi (jigarrang shovqin +
 * past-o'tkazgich filtr + sekin LFO = tinch "yomg'ir/shovqin" hissi).
 * Shuning uchun: offline ishlaydi, litsenziya muammosi yo'q, og'irlik qo'shmaydi.
 *
 * Foydalanish: FocusAudio.toggle() / .start() / .stop() / .isOn() / .pref()
 */
(function (global) {
  var ctx = null, src = null, gain = null, filter = null, lfo = null, lfoGain = null;
  var playing = false;
  var PREF = 'mvow.focusSound';

  function makeBrownNoise(c) {
    var len = Math.floor(c.sampleRate * 4); // 4 soniyali loop
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // integrated = brown (yumshoq, yomg'irsimon)
      d[i] = last * 3.2;
    }
    return buf;
  }

  function start() {
    if (playing) return true;
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return false;
      ctx = ctx || new AC();
      if (ctx.state === 'suspended') ctx.resume();

      src = ctx.createBufferSource();
      src.buffer = makeBrownNoise(ctx);
      src.loop = true;

      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 720;
      filter.Q.value = 0.6;

      gain = ctx.createGain();
      gain.gain.value = 0.0001;

      // Sekin LFO — filtrni "nafas oldirib" tirik yomg'ir hissi beradi
      lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      src.start();
      lfo.start();
      gain.gain.setTargetAtTime(0.11, ctx.currentTime, 1.2); // yumshoq kirish
      playing = true;
      return true;
    } catch (e) {
      playing = false;
      return false;
    }
  }

  function stop() {
    if (!playing) return;
    try {
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4); // yumshoq chiqish
      var s = src, l = lfo;
      setTimeout(function () { try { s.stop(); } catch (e) {} try { l.stop(); } catch (e) {} }, 700);
    } catch (e) {}
    playing = false;
  }

  function toggle() {
    if (playing) { stop(); try { localStorage.setItem(PREF, '0'); } catch (e) {} }
    else { var ok = start(); try { localStorage.setItem(PREF, ok ? '1' : '0'); } catch (e) {} }
    return playing;
  }

  function isOn() { return playing; }
  function pref() { try { return localStorage.getItem(PREF) === '1'; } catch (e) { return false; } }

  global.FocusAudio = { start: start, stop: stop, toggle: toggle, isOn: isOn, pref: pref };
})(typeof window !== 'undefined' ? window : this);
