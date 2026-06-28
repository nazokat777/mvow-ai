'use strict';
/**
 * REGRESSION testlar — QA da topilgan kamchiliklar (TDD: avval qizil, keyin tuzatish).
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { loadI18N } = require('./harness');

// FIX (til) — aniq tanlov bo'lmasa default UZ (brauzer ru/en bo'lsa ham),
// til-tugmasi ham UZ ko'rsatadi → mos. Aniq localStorage tanlovi hurmat qilinadi.
test('i18n: aniq tanlov yo\'q + brauzer ru → default UZ (tugma bilan mos)', () => {
  const { I18N } = loadI18N(undefined, { navLang: 'ru' });
  assert.equal(I18N.lang, 'uz');
});

test('i18n: aniq localStorage tanlovi hurmat qilinadi (brauzer boshqa bo\'lsa ham)', () => {
  assert.equal(loadI18N({ 'mvow.lang': 'ru' }).I18N.lang, 'ru');
  assert.equal(loadI18N({ 'mvow.lang': 'en' }, { navLang: 'ru' }).I18N.lang, 'en');
});

const DIR = path.join(__dirname, '..', 'docs', 'v2', 'preview');

function htmlKeys() {
  const keys = new Set();
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(DIR, f), 'utf8');
    const re = /data-i18n(?:-(?:html|placeholder|aria|title))?\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(html))) keys.add(m[1]);
  }
  return [...keys];
}

// FIX 1 — {brand} o'rinbosari almashtirilishi kerak (xom {brand} qolmasin sarlavhalarda)
test('i18n: hech bir tarjimada xom {brand} qolmaydi (Daywarden ga almashadi)', () => {
  const { I18N } = loadI18N();
  const keys = htmlKeys();
  const bad = [];
  for (const lang of ['uz', 'ru', 'en']) {
    I18N.set(lang);
    for (const k of keys) {
      const v = I18N.t(k, '');
      if (typeof v === 'string' && v.includes('{brand}')) bad.push(`${lang}: ${k} = "${v}"`);
    }
  }
  assert.deepEqual(bad, [], 'Xom {brand} qolgan:\n  ' + bad.join('\n  '));
});

// FIX 3 — Cormorant fonti faol fayllarda umuman bo'lmasligi kerak (Anton/Inter bilan almashgan)
test('Cormorant fonti faol preview fayllarida yo\'q (ortiqcha yuklash)', () => {
  const offenders = [];
  for (const f of fs.readdirSync(DIR).filter((x) => /\.(html|css)$/.test(x))) {
    if (/Cormorant/i.test(fs.readFileSync(path.join(DIR, f), 'utf8'))) offenders.push(f);
  }
  assert.deepEqual(offenders, [], 'Cormorant hali bor: ' + offenders.join(', '));
});

// FIX (sanoq) — countSub JS bilan boshqariladi; data-i18n bo'lsa i18n uni "0" ga qaytaradi
test('maqsadlar: countSub elementida data-i18n yo\'q (JS sanog\'ini i18n bosib ketmasin)', () => {
  const html = fs.readFileSync(path.join(DIR, 'maqsadlar.html'), 'utf8');
  const m = html.match(/<[^>]*id=["']countSub["'][^>]*>/i);
  assert.ok(m, 'countSub topilmadi');
  assert.ok(!/data-i18n/i.test(m[0]), 'countSub hali data-i18n bilan: ' + m[0]);
});
