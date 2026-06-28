'use strict';
/**
 * AI murabbiy testlari — sof qismlar (fallback + prompt). Tarmoq chaqiruvi test qilinmaydi.
 * Fallback: kalit bo'lmasa yoki xatoda ishlaydi → ilova hech qachon buzilmaydi.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const A = require('../docs/v2/preview/ai-coach.js');

test('fallbackMessage: hammasi bajarilgan → iliq tabrik (done soni bor)', () => {
  const m = A.fallbackMessage({ done: 5, total: 5, pct: 100, streak: 7, focusH: 4 });
  assert.ok(typeof m === 'string' && m.length > 12);
  assert.match(m, /5/);
});

test('fallbackMessage: 0 bajarilgan → qo\'llab-quvvatlash, jazo emas', () => {
  const m = A.fallbackMessage({ done: 0, total: 5, pct: 0, streak: 0, focusH: 0 });
  assert.ok(m.length > 12);
  assert.doesNotMatch(m, /yomon|jazo|dangasa/i);
});

test('fallbackMessage: CHEKKA — reja yo\'q (total 0)', () => {
  const m = A.fallbackMessage({ done: 0, total: 0 });
  assert.ok(m.length > 12);
});

test('fallbackMessage: CHEKKA — bo\'sh kontekst ham xabar qaytaradi', () => {
  const m = A.fallbackMessage();
  assert.ok(typeof m === 'string' && m.length > 12);
});

test('fallbackMessage: yarmidan ko\'p bajarilgan → ijobiy', () => {
  const m = A.fallbackMessage({ done: 4, total: 5, pct: 80, streak: 3, focusH: 3 });
  assert.match(m, /4/);
});

test('buildPrompt: statistika va o\'zbek tili ko\'rsatmasi bor', () => {
  const p = A.buildPrompt({ done: 3, total: 5, pct: 60, streak: 2, focusH: 2 });
  assert.match(p, /3/);
  assert.match(p, /5/);
  assert.match(p, /o'zbek/i);
});

test('coach: kalitsiz → fallback (tarmoqsiz ishlaydi)', async () => {
  const m = await A.coach({ done: 2, total: 4, pct: 50, streak: 1, focusH: 1 }, {});
  assert.ok(typeof m === 'string' && m.length > 12);
});
