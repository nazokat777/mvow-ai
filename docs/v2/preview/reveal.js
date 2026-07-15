/**
 * FOCUS AI — Scroll-reveal / staggered entrance (PRO, minimal, 0-dep).
 *
 * Dizaynni O'ZGARTIRMAYDI — faqat kontent PAYDO BO'LISH tarzini yaxshilaydi:
 * asosiy konteynerning bloklari (va scroll'da pastdagilar) yumshoq fade+rise bilan
 * ketma-ket (stagger) chiqadi. Final ko'rinish (rang/joylashuv/o'lcham) aynan o'sha.
 *
 * XAVFSIZLIK (kontent hech qachon ko'rinmay qolmaydi):
 *   - reduced-motion, IntersectionObserver yo'q, yoki intensity=minimal -> umuman ishlamaydi
 *     (theme.css dwEnter qoladi, hamma narsa ko'rinadi).
 *   - JS xato bo'lsa -> mvw-reveal-on qo'shilmaydi -> element yashirilmaydi.
 *   - IO ishlamay qolsa -> 1.8s dan keyin hammasi majburan ko'rinadi.
 */
(function () {
  'use strict';
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce || !('IntersectionObserver' in window)) return;
  try { if (localStorage.getItem('mvow.motion.intensity') === 'minimal') return; } catch (e) {}

  function pickWrap() {
    return document.querySelector('.phone .container')
        || document.querySelector('.wrap')
        || document.querySelector('.container')
        || document.querySelector('main')
        || document.querySelector('.phone')      // .phone'ни to'g'ridan ishlatadigan sahifalar (hisobot, ota-ona...)
        || null;
  }

  function revealable(el) {
    if (el.nodeType !== 1) return false;
    if (el.classList.contains('mvw-reveal')) return false;
    var cs;
    try { cs = getComputedStyle(el); } catch (e) { return false; }
    if (cs.display === 'none' || cs.position === 'fixed' || cs.position === 'absolute') return false;
    // Juda kichik/ko'rinmas yordamchi elementlar (masalan yashirin inputlar) — o'tkazamiz
    if (el.offsetHeight === 0 && el.offsetWidth === 0) return false;
    return true;
  }

  var io = null;
  function ensureIO() {
    if (io) return io;
    io = new IntersectionObserver(function (entries) {
      var shown = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // Bir partiyada ko'ringanlar kichik kechikish bilan ketma-ket (stagger)
        e.target.style.transitionDelay = (Math.min(shown, 6) * 0.045) + 's';
        e.target.classList.add('mvw-in');
        io.unobserve(e.target);
        shown++;
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
    return io;
  }

  var observed = [];
  function observe(el) {
    if (!revealable(el)) return;
    el.classList.add('mvw-reveal');
    ensureIO().observe(el);
    observed.push(el);
  }

  function run() {
    var wrap = pickWrap();
    if (!wrap) return;
    var kids = Array.prototype.slice.call(wrap.children).filter(revealable);
    if (!kids.length) return;
    document.documentElement.classList.add('mvw-reveal-on');
    kids.forEach(observe);
    // Xavfsizlik: IO negadir ishlamasa ham 1.8s dan keyin hammasi ko'rinsin
    setTimeout(function () { observed.forEach(function (el) { el.classList.add('mvw-in'); }); }, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
