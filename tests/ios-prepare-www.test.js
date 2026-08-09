'use strict';
/**
 * ios-app/prepare-www.js testlari.
 *
 * Bu skript PWA'ni iOS ilovasi ichiga joylaydi. Xato bo'lsa ilova bo'sh ekran
 * bilan ochiladi va buni faqat bulutli build'dan keyin, iPhone'da bilib olamiz —
 * shuning uchun asosiy shartlar shu yerda tekshiriladi.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const SCRIPT = path.join(__dirname, '..', 'ios-app', 'prepare-www.js');
const SRC = path.join(__dirname, '..', 'docs', 'v2', 'preview');

function run() {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'focus-www-')), 'www');
  execFileSync(process.execPath, [SCRIPT, out], { encoding: 'utf8' });
  return out;
}

const built = run();          // bir marta qurib, hamma testda ishlatamiz

test('www: index.html bor va u app.html dan olingan', () => {
  const idx = fs.readFileSync(path.join(built, 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(SRC, 'app.html'), 'utf8');
  assert.equal(idx, app, 'index.html app.html bilan bir xil emas');
});

test('www: asosiy ekranlar ichida', () => {
  for (const f of ['home.html', 'hard-lock.html', 'maqsadlar.html', 'dostlar.html',
                   'data.js', 'i18n.js', 'social.js', 'theme.css', 'manifest.webmanifest']) {
    assert.ok(fs.existsSync(path.join(built, f)), f + ' yo\'q');
  }
});

test('www: rasmlar (assets) ko\'chgan', () => {
  assert.ok(fs.existsSync(path.join(built, 'assets', 'mnsm-512.png')));
});

test('www: server kodi (api/) ILOVAGA TUSHMAYDI', () => {
  assert.ok(!fs.existsSync(path.join(built, 'api')),
    'api/ ilova ichiga tushdi — u faqat serverda ishlaydi');
});

test('www: keraksiz fayllar chiqarib tashlangan', () => {
  for (const f of ['robots.txt', 'sitemap.xml', 'service-worker.js',
                   'cache-test.html', 'lang-debug.html', 'FOCUS-AI.apk']) {
    assert.ok(!fs.existsSync(path.join(built, f)), f + ' ilova ichida qolib ketdi');
  }
});

test('www: .md hujjatlari ko\'chmaydi', () => {
  const md = fs.readdirSync(built).filter((f) => f.endsWith('.md'));
  assert.deepEqual(md, []);
});

test('www: Play do\'koni rasmlari ilovaga tushmaydi (bekorga hajm)', () => {
  assert.ok(!fs.existsSync(path.join(built, 'assets', 'playstore')));
});

test('www: qayta qurilganda eski fayllar qolmaydi', () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'focus-www2-')), 'www');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'eski-fayl.txt'), 'qolmasin');
  execFileSync(process.execPath, [SCRIPT, out], { encoding: 'utf8' });
  assert.ok(!fs.existsSync(path.join(out, 'eski-fayl.txt')));
});

test('capacitor.config.json: appId va appName to\'g\'ri', () => {
  const cfg = JSON.parse(fs.readFileSync(
    path.join(__dirname, '..', 'ios-app', 'capacitor.config.json'), 'utf8'));
  assert.equal(cfg.appName, 'FOCUS AI');
  assert.match(cfg.appId, /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/,
    'appId Apple qabul qiladigan ko\'rinishda emas');
  assert.equal(cfg.webDir, 'www');
});
