#!/usr/bin/env node
'use strict';
/**
 * PWA'ni iOS ilovasi ichiga tayyorlaydi: docs/v2/preview -> ios-app/www
 *
 * Nega nusxa: fayllar ilova ICHIGA joylashadi (uzoq serverdan yuklanmaydi).
 * Sabab ikkita — (1) Apple 4.2 qoidasi "shunchaki sayt" ilovalarni rad etadi,
 * (2) internetsiz ham ochiladi. Server bilan aloqa faqat ma'lumot uchun qoladi
 * (Supabase, AI murabbiy) — ular baribir tarmoqni talab qiladi.
 *
 * Kirish nuqtasi: app.html (PWA'ning haqiqiy boshlanishi) www/index.html bo'ladi.
 * preview/index.html — qidiruv tizimlari uchun marketing sahifasi, ilovada kerak emas.
 *
 * Ishlatish:  node prepare-www.js [chiqish-papkasi]
 */

const fs = require('fs');
const path = require('path');

const HERE = __dirname;                                   // ios-app
const SRC = path.resolve(HERE, '..', 'docs', 'v2', 'preview');
const OUT = process.argv[2] ? path.resolve(process.argv[2]) : path.join(HERE, 'www');

/** Ilova to'plamiga KERAK EMAS (server kodi, katta fayllar, qidiruv/nosozlik fayllari). */
const SKIP_DIRS = new Set([
  'api',            // Vercel server funksiyalari — ilova ichida ishlamaydi
  'archive',        // eski sahifalar
  'playstore',      // Play do'koni rasmlari (assets ichida)
]);

const SKIP_FILES = new Set([
  'robots.txt',
  'sitemap.xml',
  'package.json',
  'cache-test.html',
  'lang-debug.html',
  'FOCUS-AI.apk',
  'service-worker.js',   // ilova ichida keshlash keraksiz; ro'yxatdan o'tish o'zi xatoni yutadi
]);

const SKIP_EXT = new Set(['.md']);

/** Kirish nuqtasi — shu fayl www/index.html bo'lib nusxalanadi. */
const ENTRY = 'app.html';

function skip(name, isDir) {
  if (isDir) return SKIP_DIRS.has(name);
  if (SKIP_FILES.has(name)) return true;
  return SKIP_EXT.has(path.extname(name).toLowerCase());
}

function copyTree(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const isDir = fs.statSync(s).isDirectory();
    if (skip(name, isDir)) continue;
    if (isDir) n += copyTree(s, path.join(dest, name));
    else { fs.copyFileSync(s, path.join(dest, name)); n++; }
  }
  return n;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('prepare-www XATO: PWA papkasi topilmadi: ' + SRC);
    process.exit(1);
  }
  if (!fs.existsSync(path.join(SRC, ENTRY))) {
    console.error('prepare-www XATO: kirish nuqtasi yo’q: ' + ENTRY);
    process.exit(1);
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  const n = copyTree(SRC, OUT);

  // Capacitor www/index.html'ni ochadi — u PWA'ning haqiqiy boshlanishi bo'lsin.
  fs.copyFileSync(path.join(SRC, ENTRY), path.join(OUT, 'index.html'));

  if (!fs.existsSync(path.join(OUT, 'index.html'))) {
    console.error('prepare-www XATO: index.html yaratilmadi');
    process.exit(1);
  }
  console.log('prepare-www: ' + n + ' fayl -> ' + OUT + ' (index.html <- ' + ENTRY + ')');
}

main();
