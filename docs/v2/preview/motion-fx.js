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
    + '@keyframes mfxSweep{0%{transform:translateX(-180%) skewX(-18deg);opacity:0}12%{opacity:1}100%{transform:translateX(320%) skewX(-18deg);opacity:0}}';
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
    el.textContent = '0';
    function step(ts) {
      if (start == null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      el.textContent = String(Math.round(easeOut(p) * target));
      if (p < 1) requestAnimationFrame(step); else el.textContent = String(target);
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

  function init() { setTimeout(function () { runCountUp(); enhanceCTA(); }, 340); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
