/**
 * FOCUS AI — Motion FX (PRO, 0-dep). Dizaynni O'ZGARTIRMAYDI — faqat "jonlilik" qo'shadi.
 *   1) Hero raqamlar count-up: 🪙tanga, 💎olmos, 🔥streak, fokus soat, reja soni — 0'dan qiymatgacha.
 *   2) Primary CTA / kartada bir martalik nur o'tishi (shine sweep) — kirishda + bosilganda.
 *   3) Tactile press: bosilganda nozik scale (transform/opacity — GPU, WebView'da ravon).
 * Xavfsizlik: prefers-reduced-motion -> bezak harakatlari O'CHADI (raqamlar oddiy ko'rinadi).
 * Transform/opacity'dan boshqa narsa animatsiya qilinmaydi (layout thrash yo'q).
 */
(function () {
  'use strict';
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // ── Tap feedback + shine uslublari (press feedback reduced-motion'da ham qoladi — u bezak emas) ──
  var st = document.createElement('style');
  st.textContent =
    '.cta,.btn,.ghost,.chip,.ai-chip,.report-link,.lb-row,.row,.t-row,.rw,.seg button{transition:transform .13s cubic-bezier(.34,1.56,.64,1)}'
    + '@media (hover:none){'
    + '.cta:active,.btn:active,.ghost:active,.chip:active,.ai-chip:active,.report-link:active,.lb-row:active,.rw:active,.seg button:active{transform:scale(.965)}'
    + '}'
    + '.mfx-shine{position:relative;overflow:hidden}'
    + '.mfx-shine>*{position:relative;z-index:1}'
    + '.mfx-shine::after{content:"";position:absolute;top:0;left:0;width:42%;height:100%;z-index:2;pointer-events:none;'
    + 'background:linear-gradient(100deg,transparent,rgba(255,255,255,.32),transparent);transform:translateX(-180%) skewX(-18deg);opacity:0}'
    + '.mfx-shine.mfx-sweep::after{animation:mfxSweep .9s ease-out}'
    + '@keyframes mfxSweep{0%{transform:translateX(-180%) skewX(-18deg);opacity:0}12%{opacity:1}100%{transform:translateX(320%) skewX(-18deg);opacity:0}}'
    // Ripple (bosgan joydan to'lqin)
    + '.mfx-rippleable{position:relative;overflow:hidden}'
    + '.mfx-ripple{position:absolute;border-radius:50%;background:currentColor;opacity:.22;transform:scale(0);pointer-events:none;z-index:0;animation:mfxRipple .6s ease-out forwards}'
    + '@keyframes mfxRipple{to{transform:scale(1);opacity:0}}'
    // Raqam "pop" (count-up tugagach)
    + '.mfx-pop{animation:mfxPop .42s ease-out}'
    + '@keyframes mfxPop{0%{transform:scale(1)}42%{transform:scale(1.16)}100%{transform:scale(1)}}';
  document.head.appendChild(st);

  if (reduce) return;  // bezak harakatlari o'chadi

  // ── 1) Count-up ──
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }
  function countUp(el) {
    if (!el || el.__mfx) return;
    var raw = (el.textContent || '').trim();
    if (!/^\d{1,7}$/.test(raw)) return;         // faqat butun son
    var target = parseInt(raw, 10);
    if (target <= 0) return;
    el.__mfx = 1;
    var dur = Math.min(1100, 360 + target * 7), start = null;
    try { el.style.display = 'inline-block'; } catch (e) {}   // transform pop uchun
    el.textContent = '0';
    function step(ts) {
      if (start == null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      el.textContent = String(Math.round(easeOut(p) * target));
      if (p < 1) requestAnimationFrame(step);
      else { el.textContent = String(target); el.classList.add('mfx-pop'); setTimeout(function () { el.classList.remove('mfx-pop'); }, 460); }
    }
    requestAnimationFrame(step);
  }
  function runCountUp() {
    var sel = '#coinBal,#dmBal,#focusH,#sessN,#streakN,[data-countup]';
    var nodes; try { nodes = document.querySelectorAll(sel); } catch (e) { return; }
    Array.prototype.forEach.call(nodes, countUp);
  }

  // ── 2) CTA / karta shine ──
  function sweep(el) {
    el.classList.remove('mfx-sweep'); void el.offsetWidth; el.classList.add('mfx-sweep');
    setTimeout(function () { el.classList.remove('mfx-sweep'); }, 950);
  }
  function enhanceCTA() {
    var sel = '.cta, .btn.save, .ai-reward-card, .code-card, .buy.ready';
    var nodes; try { nodes = document.querySelectorAll(sel); } catch (e) { return; }
    Array.prototype.forEach.call(nodes, function (c, i) {
      if (c.__mfxs) return; c.__mfxs = 1;
      c.classList.add('mfx-shine');
      setTimeout(function () { sweep(c); }, 460 + Math.min(i, 4) * 120);   // kirishda ketma-ket
      c.addEventListener('click', function () { sweep(c); });               // bosilganda
    });
  }

  // ── 3) Tap ripple (Material-uslub) ──
  function ripple(e) {
    var el = e.currentTarget;
    var r = el.getBoundingClientRect();
    var d = Math.max(r.width, r.height) * 1.05;
    var pt = (e.touches && e.touches[0]) ? e.touches[0] : e;
    var x = (pt.clientX != null ? pt.clientX : r.left + r.width / 2) - r.left;
    var y = (pt.clientY != null ? pt.clientY : r.top + r.height / 2) - r.top;
    var s = document.createElement('span');
    s.className = 'mfx-ripple';
    s.style.width = s.style.height = d + 'px';
    s.style.left = (x - d / 2) + 'px'; s.style.top = (y - d / 2) + 'px';
    el.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 640);
  }
  function enableRipple() {
    var sel = '.cta,.btn,.buy,.addb,.ai-reward-card,.report-link,.tab,.seg button,.ai-chip';
    var nodes; try { nodes = document.querySelectorAll(sel); } catch (e) { return; }
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.__mfxr) return; el.__mfxr = 1;
      el.classList.add('mfx-rippleable');
      el.addEventListener('pointerdown', ripple);
    });
  }

  // ── 4) Progress bar'lar 0'dan to'ladi ──
  function animBars() {
    var sel = '.bar .fill, .seq-progress-fill';
    var nodes; try { nodes = document.querySelectorAll(sel); } catch (e) { return; }
    Array.prototype.forEach.call(nodes, function (f) {
      if (f.__mfxb) return; f.__mfxb = 1;
      f.style.transformOrigin = 'left';
      f.style.transform = 'scaleX(0)';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          f.style.transition = (f.style.transition ? f.style.transition + ',' : '') + 'transform .75s cubic-bezier(.22,1,.36,1)';
          f.style.transform = 'scaleX(1)';
        });
      });
    });
  }

  function init() { setTimeout(function () { runCountUp(); enhanceCTA(); enableRipple(); animBars(); }, 340); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
