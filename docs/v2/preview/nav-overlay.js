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
      /* === Logo'larni teal'ga aylantirish — hue-rotate(160deg) oltindan teal'ga */
      .mentor-orb, .avatar, .orb-core, .header-orb, .portal-core,
      .notif-orb.mentor, .core-well-logo, .timer-logo, .invite .orb,
      .gen-orb, .day-progress .orb {
        background: transparent !important;
        background-image: url('assets/mnsm-logo.png') !important;
        background-size: contain !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        box-shadow: none !important;
        border: none !important;
        animation: none !important;
        filter: hue-rotate(160deg) saturate(1.4) drop-shadow(0 0 12px rgba(0,229,212,0.55));
      }
      .mentor-orb *, .avatar *, .orb-core *, .header-orb *, .portal-core * {
        opacity: 0 !important;
      }
      /* MNSM logo barcha img va background fonida — hue-rotate orqali teal */
      img[src*="mnsm-logo"],
      [class*="mnsm-img"] img,
      .brand-block img,
      .seq-nav-pos img,
      .logo-wrap img,
      [style*="mnsm-logo"] {
        filter: hue-rotate(160deg) saturate(1.4) !important;
      }
      .seq-nav-pos img {
        filter: hue-rotate(160deg) saturate(1.4) drop-shadow(0 0 4px rgba(0,229,212,.5)) !important;
      }

      /* === Universal mikro-animatsiyalar === */
      /* Sahifa kirishi — fade-in */
      @keyframes mvow-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .phone {
        animation: mvow-fade-in 0.4s ease-out;
      }
      /* CTA tap feedback */
      .cta, .ghost, .chip, .add-btn, button {
        transition: transform 0.12s ease, opacity 0.12s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      }
      .cta:active, .ghost:active, .add-btn:active {
        transform: scale(0.97);
      }
      /* Reduced motion — animatsiyalarni o'chir */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
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

  // MVP scope (2026-06-12) — sodda oqim. rejalar.html, notifications.html, day-flow.html
  // bosh oqimdan olindi (faylda qoladi, lekin SEQ'da yo'q).
  const SEQ = [
    // Tanishuv (1-3)
    'intro.html',             // 1. Tanishuv
    'anketa.html',            // 2. 6 qadamli savol-javob
    'vada.html',              // 3. Va'da
    'maqsadlar.html',         // 4. Maqsadlar ro'yhati
    // Sozlama (5)
    'settings.html',          // 5. Sozlamalar + Ruxsatlar (birlashtirilgan)
    // Kun (6-9)
    'home.html',              // 6. Bosh sahifa
    'routine.html',           // 7. Reja
    'today-plan.html',        // 8. Bugungi reja
    'calendar.html',          // 9. Kalendar
    // Bajarish (10-12)
    'hard-lock.html',         // 10. Fokus taymeri
    'session-reflection.html',// 11. Bajardim
    'kechqurun.html',         // 12. Kechki sharh
    // Natija (13-14)
    'weekly-review.html',     // 13. Tarix
    'celebrate.html'          // 14. Bayram
  ];

  const file = (location.pathname.split('/').pop() || 'welcome.html').toLowerCase();
  const idx  = SEQ.indexOf(file);
  if (idx < 0) return;  // not part of the sequence (e.g. gallery, menu, index)

  const prev = idx > 0 ? SEQ[idx - 1] : null;
  const next = idx < SEQ.length - 1 ? SEQ[idx + 1] : null;

  // 5 ta bo'lim — 14 ekran (permissions settings'ga birlashtirildi)
  const SECTIONS = [
    { name: 'Tanishuv',  range: [0, 4] },   // 1-4
    { name: 'Sozlama',   range: [4, 5] },   // 5
    { name: 'Kun',       range: [5, 9] },   // 6-9
    { name: 'Bajarish',  range: [9, 12] },  // 10-12
    { name: 'Natija',    range: [12, 14] }  // 13-14
  ];
  const currentSection = SECTIONS.find(s => idx >= s.range[0] && idx < s.range[1]) || SECTIONS[0];
  const sectionIdx = idx - currentSection.range[0] + 1;
  const sectionTotal = currentSection.range[1] - currentSection.range[0];
  const globalPercent = Math.round(((idx + 1) / SEQ.length) * 100);

  const style = document.createElement('style');
  style.textContent = `
    /* === Top bar: back · progress · close · section === */
    .seq-top-bar {
      position: fixed;
      top: 0; left: 0; right: 0;
      padding: 8px 8px 0;
      pointer-events: none;
      z-index: 99999;
    }
    .seq-top-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .seq-btn {
      pointer-events: auto;
      width: 44px; height: 44px;
      border-radius: 50%;
      border: 1px solid rgba(0,229,212,0.55);
      background: rgba(8,8,12,0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #7AF5EC;
      font-size: 22px;
      font-weight: 500;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      text-decoration: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: transform .12s, background .15s, opacity .15s;
      flex-shrink: 0;
    }
    .seq-btn:active { transform: scale(0.93); background: rgba(0,229,212,0.18); }
    .seq-btn.disabled { opacity: 0.22; pointer-events: none; }

    .seq-progress-wrap {
      flex: 1;
      display: flex; flex-direction: column;
      gap: 4px;
      min-width: 0;
      padding: 0 4px;
    }
    .seq-progress-meta {
      display: flex; justify-content: space-between;
      align-items: baseline;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      color: #E0E0E0;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .seq-progress-meta .pos { color: #7AF5EC; font-weight: 600; }
    .seq-progress {
      width: 100%;
      height: 3px;
      background: rgba(0,229,212,0.12);
      border-radius: 2px;
      overflow: hidden;
    }
    .seq-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00E5D4, #7AF5EC);
      transition: width 0.5s cubic-bezier(.16,.84,.32,1);
    }

    /* Side arrows o'chirildi — foydalanuvchi sahifa ichidagi tugmalar bilan davom etadi */

    /* === Phone ichida scrollbar yashirish === */
    .phone, .phone *, body, html { scrollbar-width: none; -ms-overflow-style: none; }
    .phone::-webkit-scrollbar, .phone *::-webkit-scrollbar,
    body::-webkit-scrollbar, html::-webkit-scrollbar { display: none; width: 0; height: 0; }

    /* === Top padding so content doesn't hide behind progress bar === */
    .phone .container,
    .phone > div:first-child:not(.halo):not(.backdrop) {
      padding-top: max(60px, env(safe-area-inset-top, 60px));
    }

    /* === Bottom-bar sticky — CTA hech qachon kesilmasin === */
    .phone .bottom-bar {
      position: sticky;
      bottom: 0;
      z-index: 10;
      background: linear-gradient(180deg, transparent, #04060B 30%);
    }
    .phone {
      padding-bottom: env(safe-area-inset-bottom, 0);
    }
    @media (max-width: 480px) {
      .phone .bottom-bar { position: sticky; bottom: 0; }
    }

    /* === Tipografik shkala (universal) === */
    :root {
      --fs-h1: 28px;
      --fs-h2: 22px;
      --fs-h3: 17px;
      --fs-body: 15px;
      --fs-helper: 13px;
      --fs-meta: 11px;
      --text-on-dark: #F5F2EC;
      --text-mid-aa: #B8BBC2;
      --text-dim-aa: #9CA0A8;
    }

    @media (max-width: 480px) {
      .seq-side-nav { padding: 0 2px; }
    }
  `;
  document.head.appendChild(style);

  // ── Top bar: Back + Progress + Close ──
  // Back tugmasi tabiiy navigatsiya — history.back(), brauzerdan kelgan yo'lga qaytadi.
  // Agar history bo'sh bo'lsa (mas. PWA bevosita ochilgan), home.html'ga.
  const top = document.createElement('div');
  top.className = 'seq-top-bar';
  top.innerHTML = `
    <div class="seq-top-row">
      <button class="seq-btn" id="seqBackBtn" type="button" aria-label="Orqaga" title="Orqaga" style="font-family:inherit;font-size:22px;font-weight:500;">‹</button>
      <div class="seq-progress-wrap">
        <div class="seq-progress-meta">
          <span class="name">${currentSection.name}</span>
          <span class="pos">${idx + 1} / ${SEQ.length}</span>
        </div>
        <div class="seq-progress"><div class="seq-progress-fill" style="width:${globalPercent}%"></div></div>
      </div>
      <a class="seq-btn" href="menu.html" aria-label="Barcha ekranlar" title="Yopish">×</a>
    </div>
  `;
  document.body.appendChild(top);

  // Back tugmasi mantiqi:
  //   - referrer ichki (shu domendan) bo'lsa → history.back() (tabiiy)
  //   - aks holda → home.html (xavfsiz fallback)
  const backBtn = document.getElementById('seqBackBtn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const ref = document.referrer || '';
      const sameOrigin = ref && ref.indexOf(location.origin) === 0;
      if (sameOrigin && window.history.length > 1) {
        history.back();
      } else if (idx > 0) {
        // history bo'sh — SEQ tartibida orqaga
        location.href = SEQ[idx - 1];
      } else {
        location.href = 'home.html';
      }
    });
  }

  // Yon strelka tugmalar olib tashlandi — foydalanuvchi sahifa ichidagi CTA bilan davom etadi

  // ──────────────────────────────────────────────────────────────
  // TARIX (HISTORY) — har sahifada tepada clock ikonkasi
  // ──────────────────────────────────────────────────────────────
  const TIMER_PAGES = ['hard-lock.html', 'alarm.html'];
  // weekly-review (Tarix sahifasi)'da ikonka shart emas
  const HISTORY_PAGE = 'weekly-review.html';
  if (file !== HISTORY_PAGE) {
    const hStyle = document.createElement('style');
    hStyle.textContent = `
      .seq-history {
        position: fixed;
        top: 8px;
        right: ${TIMER_PAGES.includes(file) ? 60 : 112}px;
        width: 44px; height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(0,229,212,0.45);
        background: rgba(8,8,12,0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #7AF5EC;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; user-select: none;
        text-decoration: none;
        -webkit-tap-highlight-color: transparent;
        z-index: 99999;
        transition: transform .12s, background .15s;
      }
      .seq-history:active { transform: scale(0.93); background: rgba(0,229,212,0.18); }
      .seq-history svg { width: 22px; height: 22px; }
    `;
    document.head.appendChild(hStyle);

    const hist = document.createElement('a');
    hist.className = 'seq-history';
    hist.href = 'weekly-review.html';
    hist.setAttribute('aria-label', 'Tarix');
    hist.setAttribute('title', 'Tarix');
    hist.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15 14"/>
    </svg>`;
    document.body.appendChild(hist);
  }

  if (!TIMER_PAGES.includes(file)) {
    const langStyle = document.createElement('style');
    langStyle.textContent = `
      .seq-globe {
        position: fixed;
        top: 8px;
        right: 60px;
        width: 44px; height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(0,229,212,0.45);
        background: rgba(8,8,12,0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #7AF5EC;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; user-select: none;
        -webkit-tap-highlight-color: transparent;
        z-index: 99999;
        transition: transform .12s, background .15s;
      }
      .seq-globe:active { transform: scale(0.93); background: rgba(0,229,212,0.18); }
      .seq-globe svg { width: 22px; height: 22px; }
      .seq-lang-menu {
        position: fixed;
        top: 60px; right: 8px;
        background: rgba(12,15,22,.96);
        border: 1px solid rgba(0,229,212,.25);
        border-radius: 10px;
        padding: 6px;
        display: none;
        flex-direction: column;
        gap: 2px;
        min-width: 140px;
        z-index: 99999;
        backdrop-filter: blur(12px);
        box-shadow: 0 8px 28px rgba(0,0,0,.6);
      }
      .seq-lang-menu.show { display: flex; }
      .seq-lang-menu button {
        background: transparent;
        border: none;
        color: #F5F2EC;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        padding: 10px 14px;
        text-align: left;
        cursor: pointer;
        border-radius: 6px;
        letter-spacing: 0.5px;
      }
      .seq-lang-menu button:hover, .seq-lang-menu button:active {
        background: rgba(0,229,212,.08); color: #7AF5EC;
      }
      .seq-lang-menu button.on { color: #00E5D4; }
      .seq-lang-menu button .check { float: right; opacity: 0; }
      .seq-lang-menu button.on .check { opacity: 1; }
    `;
    document.head.appendChild(langStyle);

    const globe = document.createElement('button');
    globe.className = 'seq-globe';
    globe.setAttribute('aria-label', 'Language');
    globe.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
    </svg>`;
    document.body.appendChild(globe);

    const menu = document.createElement('div');
    menu.className = 'seq-lang-menu';
    const currentLang = (window.I18N && I18N.lang) || localStorage.getItem('mvow.lang') || 'uz';
    const LANGS = [
      { code: 'uz', label: "O'zbekcha" },
      { code: 'ru', label: 'Русский' },
      { code: 'en', label: 'English' }
    ];
    menu.innerHTML = LANGS.map(l =>
      `<button data-lang="${l.code}" class="${l.code === currentLang ? 'on' : ''}">${l.label}<span class="check">✓</span></button>`
    ).join('');
    document.body.appendChild(menu);

    globe.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== globe) {
        menu.classList.remove('show');
      }
    });
    menu.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        const lang = b.dataset.lang;
        if (window.I18N) I18N.set(lang);
        else localStorage.setItem('mvow.lang', lang);
        setTimeout(() => location.reload(), 100);
      });
    });
  }

  // ──────────────────────────────────────────────────────────────
  // "BAJARDINGIZMI?" SO'ROVI — vaqti o'tgan ishlar uchun (taymer + boshqa sahifalarda)
  // 3 marta so'raydi: 1) vaqt o'tganda 2) snooze tugaganda 3) kun yakuni
  // ──────────────────────────────────────────────────────────────
  // Taymer sahifalarida so'rov ko'rsatilmaydi (uning o'z modali bor)
  const ASK_SUPPRESSED = ['hard-lock.html', 'alarm.html'];
  if (!ASK_SUPPRESSED.includes(file)) {
    const askStyle = document.createElement('style');
    askStyle.textContent = `
      .ask-q-overlay {
        position: fixed; inset: 0;
        background: rgba(4,6,11,.92);
        backdrop-filter: blur(10px);
        z-index: 100000;
        display: none;
        align-items: center; justify-content: center;
        padding: 24px;
      }
      .ask-q-overlay.show { display: flex; }
      .ask-q-card {
        width: 100%; max-width: 340px;
        background: #11151E;
        border: 1px solid rgba(0,229,212,.2);
        border-radius: 16px;
        padding: 26px 22px;
        text-align: center;
        animation: askIn .35s cubic-bezier(.16,.84,.32,1);
      }
      @keyframes askIn { from { opacity: 0; transform: translateY(20px) scale(.96); } to { opacity: 1; transform: scale(1); } }
      .ask-q-title { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 22px; line-height: 1.3; color: #F5F2EC; margin-bottom: 6px; }
      .ask-q-task { font-size: 14px; color: #00E5D4; font-weight: 500; margin-bottom: 4px; }
      .ask-q-meta { font-size: 11px; color: #9CA0A8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 18px; }
      .ask-q-round { font-size: 10px; color: #9CA0A8; letter-spacing: 2px; margin-bottom: 14px; }
      .ask-q-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .ask-q-btns.three { grid-template-columns: 1fr 1fr 1fr; }
      .ask-q-btn {
        padding: 14px 8px;
        border: none; border-radius: 999px;
        font-family: 'Inter', sans-serif;
        font-size: 11px; font-weight: 600;
        letter-spacing: 1px; text-transform: uppercase;
        cursor: pointer; min-height: 46px;
      }
      .ask-q-btn.yes { background: linear-gradient(180deg, #00E5D4, #00B5A8); color: #04060B; }
      .ask-q-btn.no { background: transparent; color: #FF8E97; border: 1px solid rgba(255,71,87,.4); }
      .ask-q-btn.later { background: transparent; color: #B8BBC2; border: 1px solid rgba(255,255,255,.12); }
      .ask-snooze {
        display: none; flex-direction: column; gap: 8px; margin-top: 14px;
        padding-top: 14px; border-top: 1px solid rgba(255,255,255,.06);
      }
      .ask-snooze.show { display: flex; }
      .ask-snooze .lbl { font-size: 10px; color: #9CA0A8; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
      .ask-snooze-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
      .ask-snooze-opt {
        padding: 10px 4px;
        background: rgba(0,229,212,.06);
        border: 1px solid rgba(0,229,212,.25);
        border-radius: 8px;
        color: #7AF5EC;
        font-size: 12px;
        cursor: pointer;
      }
      .ask-custom-time {
        margin-top: 6px;
        display: flex; gap: 6px; align-items: center;
      }
      .ask-custom-time input {
        flex: 1;
        background: #0C0F16;
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 8px;
        padding: 10px;
        color: #F5F2EC;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        outline: none;
      }
      .ask-custom-time button {
        padding: 10px 14px;
        background: #00E5D4; color: #04060B;
        border: none; border-radius: 8px;
        font-size: 11px; font-weight: 600;
        cursor: pointer; letter-spacing: 1px;
        text-transform: uppercase;
      }
    `;
    document.head.appendChild(askStyle);

    const askOv = document.createElement('div');
    askOv.className = 'ask-q-overlay';
    askOv.innerHTML = `
      <div class="ask-q-card">
        <div class="ask-q-round" id="askRound">1 / 3</div>
        <div class="ask-q-title">Bajardingizmi?</div>
        <div class="ask-q-task" id="askTask">—</div>
        <div class="ask-q-meta" id="askMeta">07:00 · 1 soat</div>
        <input id="askNote" type="text" maxlength="60" placeholder="Qisqa izoh (mas. speaking)" style="width:100%;margin-bottom:14px;background:#0C0F16;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;color:#F5F2EC;font-family:'Inter',sans-serif;font-size:13px;outline:none;">
        <div class="ask-q-btns three" id="askBtns">
          <button class="ask-q-btn no" id="askNo">Yo'q</button>
          <button class="ask-q-btn later" id="askLater">Keyinroq</button>
          <button class="ask-q-btn yes" id="askYes">Ha</button>
        </div>
        <div class="ask-snooze" id="askSnooze">
          <div class="lbl">Qachon eslataylik?</div>
          <div class="ask-snooze-row">
            <button class="ask-snooze-opt" data-min="15">15 daq</button>
            <button class="ask-snooze-opt" data-min="30">30 daq</button>
            <button class="ask-snooze-opt" data-min="60">1 soat</button>
          </div>
          <div class="ask-custom-time">
            <input type="time" id="askCustomTime">
            <button id="askCustomSave">Belgila</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(askOv);

    let queue = [];
    let currentAsk = null;
    let isFinalMode = (file === 'kechqurun.html');

    function processQueue() {
      if (!queue.length) { askOv.classList.remove('show'); return; }
      currentAsk = queue.shift();
      const { task, key, state } = currentAsk;
      document.getElementById('askTask').textContent = task.name || 'Ish';
      document.getElementById('askMeta').textContent = (task.time || '') + ' · ' + (task.dur || '');
      const round = Math.min(3, (state.askCount || 0) + 1);
      document.getElementById('askRound').textContent = (isFinalMode ? 'Kun yakuni' : round + ' / 3');
      const btnsEl = document.getElementById('askBtns');
      const laterBtn = document.getElementById('askLater');
      // Kun yakuni yoki 3-marta → "Keyinroq" yo'q
      if (isFinalMode || round >= 3) {
        laterBtn.style.display = 'none';
        btnsEl.classList.remove('three');
      } else {
        laterBtn.style.display = '';
        btnsEl.classList.add('three');
      }
      document.getElementById('askSnooze').classList.remove('show');
      askOv.classList.add('show');
    }

    document.getElementById('askYes').addEventListener('click', () => {
      if (!currentAsk || !window.MVOW_DATA) return;
      const note = document.getElementById('askNote').value;
      MVOW_DATA.markTaskDone(currentAsk.task, currentAsk.key, note);
      document.getElementById('askNote').value = '';
      if (MVOW_DATA.fxSuccess) MVOW_DATA.fxSuccess();
      processQueue();
    });
    document.getElementById('askNo').addEventListener('click', () => {
      if (!currentAsk || !window.MVOW_DATA) return;
      const state = MVOW_DATA.getTaskState(currentAsk.key);
      // Final yoki 3-urinish → ✗
      if (isFinalMode || (state.askCount || 0) >= 2) {
        MVOW_DATA.markTaskMissed(currentAsk.key);
      } else {
        MVOW_DATA.bumpAskCount(currentAsk.key);
      }
      processQueue();
    });
    document.getElementById('askLater').addEventListener('click', () => {
      document.getElementById('askSnooze').classList.toggle('show');
    });
    document.querySelectorAll('.ask-snooze-opt').forEach(b => {
      b.addEventListener('click', () => {
        if (!currentAsk || !window.MVOW_DATA) return;
        MVOW_DATA.snoozeTask(currentAsk.key, parseInt(b.dataset.min, 10));
        processQueue();
      });
    });
    document.getElementById('askCustomSave').addEventListener('click', () => {
      if (!currentAsk || !window.MVOW_DATA) return;
      const t = document.getElementById('askCustomTime').value;
      const m = (t || '').match(/^(\d{1,2}):(\d{2})$/);
      if (!m) return;
      const now = new Date();
      const target = new Date(now);
      target.setHours(+m[1], +m[2], 0, 0);
      // O'tgan vaqt bo'lsa, ertasiga emas — bugungi qoldiq vaqtga qarab
      let diffMin = Math.round((target - now) / 60000);
      if (diffMin <= 0) diffMin = 30; // default 30 daq
      MVOW_DATA.snoozeTask(currentAsk.key, diffMin);
      processQueue();
    });

    // Sahifa yuklanganda navbatdagi ishlarni ko'rsatish
    function startAsk() {
      if (!window.MVOW_DATA) return;
      const pending = MVOW_DATA.getPendingAsks({ final: isFinalMode });
      if (!pending.length) return;
      queue = pending.slice();
      processQueue();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(startAsk, 600));
    } else {
      setTimeout(startAsk, 600);
    }
  }
})();
