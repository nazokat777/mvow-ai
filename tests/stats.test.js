'use strict';
/**
 * Streak (ketma-ket kunlar) testlari — TZ kreativ g'oyasi.
 * Sanalar 'YYYY-MM-DD'. Bugun bajarilmagan bo'lsa ham kecha bajarilgan bo'lsa — streak davom etadi (grace).
 */
const { test } = require('node:test');
const assert = require('node:assert');
const S = require('../docs/focus-ai/stats.js');

test('currentStreak: ketma-ket 3 kun (bugun ham) → 3', () => {
  assert.equal(S.currentStreak(['2026-06-28', '2026-06-27', '2026-06-26'], '2026-06-28'), 3);
});

test('currentStreak: bugun bajarilmagan, lekin kecha+oldingi → grace, 2', () => {
  assert.equal(S.currentStreak(['2026-06-27', '2026-06-26'], '2026-06-28'), 2);
});

test('currentStreak: bugun bajarilgan, oraliqda uzilish → 1', () => {
  assert.equal(S.currentStreak(['2026-06-28', '2026-06-26'], '2026-06-28'), 1);
});

test('currentStreak: faqat bugun → 1', () => {
  assert.equal(S.currentStreak(['2026-06-28'], '2026-06-28'), 1);
});

test('currentStreak: CHEKKA — bo\'sh → 0', () => {
  assert.equal(S.currentStreak([], '2026-06-28'), 0);
});

test('currentStreak: CHEKKA — eski sana (bugun/kecha emas) → 0', () => {
  assert.equal(S.currentStreak(['2026-06-20'], '2026-06-28'), 0);
});

test('heatmap: oxirgi N hafta katakchalari, faol bayroq bilan', () => {
  var cells = S.heatmap(['2026-06-28', '2026-06-25'], '2026-06-28', 2); // 2 hafta = 14 kun
  assert.equal(cells.length, 14);
  assert.equal(cells[cells.length - 1].iso, '2026-06-28');
  assert.equal(cells[cells.length - 1].active, true);   // bugun faol
  assert.equal(cells[cells.length - 4].active, true);   // 25-iyun faol
  assert.equal(cells[0].active, false);
});
