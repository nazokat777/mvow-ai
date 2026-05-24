/**
 * Sequential navigation overlay — connects all 22 screens in gallery order.
 * Drops two floating arrow buttons (prev/next) and a position pill (n/22)
 * onto every screen so the user can walk through the entire app linearly.
 */
(function () {
  // Replace every gold "mentor presence" orb with the real MNSM logo
  // AND make every screen scroll-friendly on mobile (universal fix).
  function injectLogoStyles() {
    const css = `
      /* === Universal: gold orbs → MNSM logo === */
      .mentor-orb, .avatar, .orb-core, .header-orb, .portal-core,
      .notif-orb.mentor, .core-well-logo {
        background: transparent !important;
        background-image: url('assets/mnsm-logo.png') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        box-shadow: none !important;
        border: none !important;
        animation: none !important;
        filter: drop-shadow(0 0 12px rgba(232,199,126,0.55));
      }
      .mentor-orb *, .avatar *, .orb-core *, .header-orb *, .portal-core * {
        opacity: 0 !important;
      }

      /* === Universal mobile scroll — every screen flows like a normal page === */
      @media (max-width: 480px) {
        body {
          padding: 0 !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          min-height: 100vh !important;
        }
        .phone {
          width: 100vw !important;
          height: auto !important;
          min-height: 100vh !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          overflow: visible !important;
          transform: none !important;
          padding: 60px 0 100px !important;
        }

        /* Background / decorative layers — fixed full-viewport */
        .phone > .backdrop, .phone > .pattern-wash, .phone > .gilt-frame,
        .phone > .vignette, .phone > .horizon-soft, .phone > .horizon, .phone > .haze,
        .phone > .alert-border, .phone > .flash-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 0;
        }
        .phone > .gilt-frame { inset: 10px !important; pointer-events: none; }
        .phone > .letterbox {
          position: fixed !important; left: 0 !important; right: 0 !important;
          height: 14px !important; z-index: 60;
        }
        .phone > .letterbox.top { top: 0 !important; bottom: auto !important; }
        .phone > .letterbox.bottom { bottom: 0 !important; top: auto !important; }

        /* Particle layers stay fixed too so they don't scroll-jank */
        .phone > .confetti, .phone > .embers, .phone > .dust, .phone > .motes,
        .phone > .petals, .phone > .leaves, .phone > .stars, .phone > .sun-rays,
        .phone > .fog, .phone > .rays {
          position: fixed !important;
          inset: 0 !important;
          pointer-events: none;
        }

        /* Bottom nav / action bar — pinned to viewport bottom */
        .phone > .bottom-nav, .phone > .bottom-bar {
          position: fixed !important;
          bottom: 0 !important; top: auto !important;
          left: 0 !important; right: 0 !important;
          transform: none !important;
          width: 100vw !important;
          max-width: 100vw !important;
          padding: 12px 18px env(safe-area-inset-bottom, 12px) !important;
          background: linear-gradient(180deg, transparent, rgba(4,6,11,0.92) 25%) !important;
          z-index: 50 !important;
        }

        /* Every other direct child of .phone flows normally, stacked.
           SKIP .variant blocks — celebrate.html relies on absolute overlapping variants. */
        .phone > div:not(.backdrop):not(.pattern-wash):not(.gilt-frame):not(.letterbox):not(.vignette):not(.horizon-soft):not(.horizon):not(.haze):not(.alert-border):not(.flash-overlay):not(.confetti):not(.embers):not(.dust):not(.motes):not(.petals):not(.leaves):not(.stars):not(.sun-rays):not(.fog):not(.rays):not(.bottom-nav):not(.bottom-bar):not(.variant) {
          position: relative !important;
          top: auto !important; bottom: auto !important;
          left: auto !important; right: auto !important;
          transform: none !important;
          margin: 14px auto !important;
          padding-left: 22px !important;
          padding-right: 22px !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Celebrate variants — keep their original absolute layout so they overlay */
        .phone .variant {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          min-height: 100vh !important;
        }
        .phone .variant.active {
          position: absolute !important;
          inset: 0 !important;
        }

        /* Keep our nav-overlay arrows above everything */
        .seq-nav, .seq-nav-pos { z-index: 100000 !important; }
      }
    `;
    const s = document.createElement('style');
    s.id = 'mvow-global-overrides';
    s.textContent = css;
    document.head.appendChild(s);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLogoStyles);
  } else {
    injectLogoStyles();
  }

  // Replace placeholder "Aziz" with the actual user name on every screen.
  function replaceUserName() {
    const userName = (localStorage.getItem('mvow.userName') || '').trim();
    if (!userName || userName.toLowerCase() === 'aziz') return;
    const root = document.body || document.documentElement;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const targets = [];
    let node;
    while ((node = walker.nextNode())) {
      if (/Aziz/i.test(node.nodeValue)) targets.push(node);
    }
    targets.forEach(n => {
      n.nodeValue = n.nodeValue.replace(/Aziz/g, userName).replace(/AZIZ/g, userName.toUpperCase());
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceUserName);
  } else {
    replaceUserName();
  }

  // MVP scope (2026-05-24, kengaytirilgan) — 13 ta zarur ekran.
  //   • Onboarding (1-6): tanishuv → mentor → maqsad → sozlamalar → ruxsatlar → tayyor
  //   • Rejalashtirish (7-8): AI bilan kun tartibi + tonggi tasdiq
  //   • Ish (9-11): taymer, qulflash, baho
  //   • Natijalar (12-13): tahlil va bayram
  const SEQ = [
    // Onboarding (1-6)
    'welcome.html',           // 1. Tanishuv — ism + til
    'voice-commitment.html',  // 2. Mentor bilan tanishuv (do'stona)
    'goal.html',              // 3. Maqsadingni so'rash
    'settings.html',          // 4. Sozlamalar — ohang, bloklash, davomiylik (avval tanlash)
    'permissions.html',       // 5. Ruxsatlar (sozlamalar ishlashi uchun)
    'done.html',              // 6. "Tayyormiz"
    // Rejalashtirish (7-8)
    'routine.html',           // 7. AI bilan kun tartibi
    'morning-confirm.html',   // 8. Tonggi tasdiq
    // Ish (9-11)
    'day-flow.html',          // 9. Taymer + nazorat
    'hard-lock.html',         // 10. Ekran qulflash (bloklash ishlayotgan ekran)
    'session-reflection.html',// 11. Sessiya tugadi — baho
    // Natijalar (12-13)
    'weekly-review.html',     // 12. Natijalar — 1 kun / 1 hafta / 1 oy
    'celebrate.html'          // 13. Haftalik bayram
  ];

  const file = (location.pathname.split('/').pop() || 'welcome.html').toLowerCase();
  const idx  = SEQ.indexOf(file);
  if (idx < 0) return;  // not part of the sequence (e.g. gallery, menu, index)

  const prev = idx > 0 ? SEQ[idx - 1] : null;
  const next = idx < SEQ.length - 1 ? SEQ[idx + 1] : null;

  const style = document.createElement('style');
  style.textContent = `
    .seq-nav {
      position: fixed;
      top: 50%;
      left: 0; right: 0;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 6px;
      pointer-events: none;
      z-index: 99998;
    }
    .seq-nav .arrow {
      pointer-events: auto;
      width: 40px; height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(232,199,126,0.55);
      background: rgba(8,8,12,0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #E8C77E;
      font-size: 20px;
      font-weight: 600;
      font-family: serif;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.55);
      text-decoration: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: transform .12s, background .15s;
    }
    .seq-nav .arrow:active { transform: scale(0.92); background: rgba(232,199,126,0.18); }
    .seq-nav .arrow.disabled { opacity: 0.18; pointer-events: none; }
    .seq-nav-pos {
      position: fixed;
      top: 8px; left: 50%;
      transform: translateX(-50%);
      pointer-events: auto;
      padding: 5px 12px;
      border: 1px solid rgba(232,199,126,0.45);
      border-radius: 999px;
      background: rgba(8,8,12,0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #E8C77E;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 2px;
      text-decoration: none;
      z-index: 99999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }
    .seq-nav-pos b { color: #FFE9B5; font-weight: 600; }
    @media (max-width: 480px) {
      .seq-nav .arrow { width: 36px; height: 36px; font-size: 18px; }
      .seq-nav-pos { font-size: 8.5px; padding: 4px 10px; }
    }
  `;
  document.head.appendChild(style);

  // Position pill at top — with MNSM logo + position number + menu icon
  const pos = document.createElement('a');
  pos.className = 'seq-nav-pos';
  pos.href = 'menu.html';
  pos.innerHTML =
    '<img src="assets/mnsm-logo.png" style="height:14px;width:auto;vertical-align:middle;margin-right:5px;filter:drop-shadow(0 0 4px rgba(232,199,126,.5))" alt="MNSM" />' +
    '<b>' + (idx + 1) + '</b> / ' + SEQ.length +
    '&nbsp;&nbsp;☰';
  pos.title = 'Barcha ekranlar';
  document.body.appendChild(pos);

  // Floating watermark MNSM logo at bottom-left (subtle brand presence on every screen)
  const watermark = document.createElement('div');
  watermark.style.cssText =
    'position:fixed; bottom:14px; left:10px; width:24px; height:24px; ' +
    'background:url(assets/mnsm-logo.png) center/contain no-repeat; ' +
    'opacity:.35; pointer-events:none; z-index:99996; ' +
    'filter:drop-shadow(0 0 6px rgba(232,199,126,.4));';
  document.body.appendChild(watermark);

  // Side arrows
  const wrap = document.createElement('div');
  wrap.className = 'seq-nav';
  wrap.innerHTML =
    '<a class="arrow ' + (prev ? '' : 'disabled') + '" href="' + (prev || '#') + '" aria-label="Oldingi">‹</a>' +
    '<a class="arrow ' + (next ? '' : 'disabled') + '" href="' + (next || '#') + '" aria-label="Keyingi">›</a>';
  document.body.appendChild(wrap);
})();
