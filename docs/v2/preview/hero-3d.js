// hero-3d.js — Manga uslubidagi 3D hero scene
// Brand mavzusi: maqsad → reja → bajarish (intizom yo'li)
// Sahna: tog' + zinapoyalar + qadam-qadam ko'tarilayotgan figura
// Vanilla Three.js (CDN importmap), brand ranglari, mobile-first

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// ── BRAND PALETTE (custom from --void / --accent CSS variables) ──
const COLORS = {
  bg:           '#04060B',  // void
  accent:       '#00E5D4',  // accent (teal/feruza)
  accentBright: '#7AF5EC',  // lighter teal
  body:         '#1B2030',  // mountain body (dark slate)
  shadowTint:   '#0C0F16',  // ambient (void-soft)
  outline:      '#070A11'   // subtle outline (between bg and body)
};
const BLOOM_ENABLED = true;

// ── WebGL2 mavjudligini tekshirish ──
const canvas = document.getElementById('hero3d');
if (!canvas) {
  console.warn('[hero-3d] canvas#hero3d topilmadi — sahna yuklanmaydi');
} else {
  function webglAvailable() {
    try { return !!document.createElement('canvas').getContext('webgl2'); }
    catch { return false; }
  }
  if (!webglAvailable()) {
    canvas.remove();
    console.warn('[hero-3d] WebGL2 mavjud emas — fallback bg');
  } else {
    initScene();
  }
}

function initScene() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLORS.bg, 9, 28);

  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 8);

  // ── Lights — key + ambient + accent rim (cel shading uchun bittagina key) ──
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(4, 7, 5);
  scene.add(key);
  scene.add(new THREE.AmbientLight(COLORS.shadowTint, 0.65));
  const rim = new THREE.DirectionalLight(COLORS.accent, 1.6);
  rim.position.set(-3, 4, -3);
  scene.add(rim);

  // ── Toon gradient map (3 pog'ona — klassik manga banding) ──
  function gradientMap(steps = 3) {
    const data = new Uint8Array(steps);
    for (let i = 0; i < steps; i++) data[i] = Math.round((i / (steps - 1)) * 255);
    const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
    tex.magFilter = tex.minFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }
  const grad = gradientMap(3);

  // ── Inverted-hull outline helper ──
  function addOutline(mesh, scaleMul = 1.05) {
    const o = new THREE.Mesh(
      mesh.geometry,
      new THREE.MeshBasicMaterial({ color: COLORS.outline, side: THREE.BackSide })
    );
    o.scale.copy(mesh.scale).multiplyScalar(scaleMul);
    o.position.copy(mesh.position);
    o.rotation.copy(mesh.rotation);
    return o;
  }

  // ── SAHNA: TOG' (low-poly cone) ──
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const mountainGeo = new THREE.ConeGeometry(2.6, 5.2, 6, 1);
  // Flat shading + toon material — manga ko'rinish
  mountainGeo.computeVertexNormals();
  const mountainMat = new THREE.MeshToonMaterial({
    color: COLORS.body, gradientMap: grad, flatShading: true
  });
  const mountain = new THREE.Mesh(mountainGeo, mountainMat);
  mountain.position.set(0, -0.4, 0);
  worldGroup.add(mountain);
  worldGroup.add(addOutline(mountain, 1.025));

  // Tog' cho'qqisida porlayotgan accent ring (orzu / yetishuv timsoli)
  const peakRingGeo = new THREE.TorusGeometry(0.55, 0.04, 12, 32);
  const peakRingMat = new THREE.MeshToonMaterial({
    color: COLORS.accent, gradientMap: grad
  });
  peakRingMat.emissive = new THREE.Color(COLORS.accent);
  peakRingMat.emissiveIntensity = 1.7; // bloom threshold > 0.85 → porlaydi
  const peakRing = new THREE.Mesh(peakRingGeo, peakRingMat);
  peakRing.position.set(0, 2.5, 0);
  peakRing.rotation.x = Math.PI / 2;
  worldGroup.add(peakRing);

  // ── ZINAPOYA (5 ta qadam, tog' tomon ko'tariladi) ──
  const stairsGroup = new THREE.Group();
  worldGroup.add(stairsGroup);
  const STEP_COUNT = 5;
  for (let i = 0; i < STEP_COUNT; i++) {
    const stepGeo = new THREE.BoxGeometry(1.3 - i * 0.13, 0.16, 0.55);
    const stepMat = new THREE.MeshToonMaterial({
      color: COLORS.body, gradientMap: grad, flatShading: true
    });
    const step = new THREE.Mesh(stepGeo, stepMat);
    step.position.set(0, -1.4 + i * 0.32, 1.8 - i * 0.32);
    stairsGroup.add(step);
    stairsGroup.add(addOutline(step, 1.02));
  }

  // ── FIGURA (qadam-qadam ko'tarilayotgan inson — silhouette) ──
  const figureGroup = new THREE.Group();
  figureGroup.position.set(0, -1.05, 1.4); // 2-zinapoyada turibdi
  worldGroup.add(figureGroup);

  // Tana — kapsula
  const bodyGeo = new THREE.CapsuleGeometry(0.13, 0.34, 4, 12);
  const bodyMat = new THREE.MeshToonMaterial({ color: COLORS.accent, gradientMap: grad });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.32;
  figureGroup.add(body);
  figureGroup.add(addOutline(body, 1.12));

  // Bosh — sfera
  const headGeo = new THREE.SphereGeometry(0.12, 16, 12);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.y = 0.68;
  figureGroup.add(head);
  figureGroup.add(addOutline(head, 1.12));

  // ── FONDA — uzoq tog'lar siluetlari (parallax depth uchun) ──
  for (let i = 0; i < 4; i++) {
    const farGeo = new THREE.ConeGeometry(1.5 + Math.random() * 1.2, 2.5 + Math.random() * 1.5, 5, 1);
    farGeo.computeVertexNormals();
    const farMat = new THREE.MeshToonMaterial({
      color: COLORS.shadowTint, gradientMap: grad, flatShading: true
    });
    const farMount = new THREE.Mesh(farGeo, farMat);
    const angle = (i / 4) * Math.PI - Math.PI / 2;
    farMount.position.set(Math.cos(angle) * 7 + (Math.random() - 0.5) * 2, -1.5, -5 - Math.random() * 2);
    scene.add(farMount);
  }

  // ── DUST (accent zarralar — bloom bilan porlaydi) ──
  let dust = null;
  if (!reduced) {
    const COUNT = 180;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(COUNT * 3);
    const dustSeeds = new Float32Array(COUNT); // har zarra alohida sekin/tez
    for (let i = 0; i < COUNT; i++) {
      dustPos[i*3]     = (Math.random() - 0.5) * 14;
      dustPos[i*3 + 1] = Math.random() * 8 - 1;
      dustPos[i*3 + 2] = (Math.random() - 0.5) * 12;
      dustSeeds[i] = Math.random();
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.userData.seeds = dustSeeds;
    dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: COLORS.accentBright, size: 0.035,
      transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(dust);
  }

  // ── BLOOM PostProcessing ──
  let composer;
  function buildPost() {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (BLOOM_ENABLED) {
      composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(innerWidth, innerHeight), 0.85, 0.55, 0.82
      ));
    }
    composer.addPass(new OutputPass());
  }
  buildPost();

  // ── INPUT: scroll + mouse ──
  const target = { scroll: 0, mx: 0, my: 0 };
  const smooth = { scroll: 0, mx: 0, my: 0 };

  function readScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    target.scroll = max > 0 ? THREE.MathUtils.clamp(scrollY / max, 0, 1) : 0;
  }
  addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  addEventListener('pointermove', (e) => {
    target.mx = (e.clientX / innerWidth) * 2 - 1;
    target.my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  // ── RAF LOOP (boshqarilgan, bitta) ──
  const clock = new THREE.Clock();
  let rafId = 0;
  let running = false;
  const lookTarget = new THREE.Vector3(0, 0.4, 0);

  function startLoop() {
    if (running) return;
    running = true;
    clock.getDelta();
    rafId = requestAnimationFrame(frame);
  }
  function stopLoop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function frame() {
    if (!running) return;
    rafId = requestAnimationFrame(frame);

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // Frame-rate-independent damping
    smooth.scroll = THREE.MathUtils.damp(smooth.scroll, target.scroll, 3.5, dt);
    smooth.mx = THREE.MathUtils.damp(smooth.mx, target.mx, 5, dt);
    smooth.my = THREE.MathUtils.damp(smooth.my, target.my, 5, dt);

    if (reduced) {
      // Reduced motion — statik kompozitsiya
      worldGroup.rotation.y = 0.08;
      figureGroup.position.set(0, -1.05, 1.4);
    } else {
      // Layer 1: idle — tog' juda sekin tebrandi, halqa aylanadi
      worldGroup.rotation.y = Math.sin(t * 0.18) * 0.06 + smooth.mx * 0.08;
      worldGroup.rotation.x = -smooth.my * 0.05;
      peakRing.rotation.z = t * 0.3;
      peakRing.position.y = 2.5 + Math.sin(t * 0.9) * 0.04;

      // Halqa porlash modulyatsiyasi (puls)
      peakRingMat.emissiveIntensity = 1.6 + Math.sin(t * 1.4) * 0.35;

      // Layer 2: figura zinapoyani avtomatik bo'ylab ko'tariladi (8 sek davomida)
      // + scroll bo'lsa, scroll qo'shimcha boshqaradi
      const autoT = Math.min(t / 8, 0.7); // 0..0.7 (zinapoyaning 70% qismi)
      const climbProgress = Math.max(smooth.scroll, autoT);
      const stepIdx = climbProgress * (STEP_COUNT - 1);
      const stepY = -1.4 + stepIdx * 0.32 + 0.4; // +0.4 = figura zinapoya tepasida
      const stepZ = 1.8 - stepIdx * 0.32;
      figureGroup.position.y = THREE.MathUtils.damp(figureGroup.position.y, stepY, 4, dt);
      figureGroup.position.z = THREE.MathUtils.damp(figureGroup.position.z, stepZ, 4, dt);
      // Yengil tebranish (yurish illyuziyasi)
      figureGroup.rotation.z = Math.sin(t * 1.6) * 0.03;
      body.position.y = 0.32 + Math.abs(Math.sin(t * 3)) * 0.015;

      // Layer 3: kamera scroll bilan biroz ko'tariladi (sahna ochiladi)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.6 + smooth.scroll * 1.2, 3.5, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 8 - smooth.scroll * 2, 3.5, dt);

      // Dust aylanmoqda + animatsiya
      if (dust) {
        dust.rotation.y = t * 0.025;
        const pos = dust.geometry.attributes.position;
        const seeds = dust.geometry.userData.seeds;
        for (let i = 0; i < seeds.length; i++) {
          pos.array[i*3 + 1] += dt * (0.15 + seeds[i] * 0.25);
          if (pos.array[i*3 + 1] > 7) pos.array[i*3 + 1] = -1;
        }
        pos.needsUpdate = true;
      }
    }

    // Kamera figura ortidan ko'taradi
    lookTarget.y = THREE.MathUtils.damp(
      lookTarget.y, 0.4 + smooth.scroll * 0.6, 3, dt
    );
    camera.lookAt(lookTarget);

    composer.render();
  }
  startLoop();

  // ── MOBILE SAFEGUARDS ──
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault(); stopLoop();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    renderer.resetState(); buildPost(); startLoop();
  });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopLoop() : startLoop();
  });

  let resizeT;
  addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      composer.setSize(innerWidth, innerHeight);
    }, 120);
  });
}
