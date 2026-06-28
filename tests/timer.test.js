'use strict';
/**
 * TAYMER testlari — Focus AI yadrosi (TZ 4.1).
 * Timestamp asosida: setInterval sanog'iga TAYANMAYDI.
 * elapsed = accumulatedMs + (now - runningSince). Yopilsa/uxlasa ham aniq qoladi.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const T = require('../docs/focus-ai/timer.js');

test('create: boshlang\'ich holat — 0 to\'plangan, ishlamayapti, tugamagan', () => {
  const s = T.create(60000); // goalMs = 60s
  assert.equal(s.accumulatedMs, 0);
  assert.equal(s.runningSince, null);
  assert.equal(s.goalMs, 60000);
  assert.equal(s.done, false);
});

test('start + elapsed: ishlayotganda o\'tgan vaqt = now - runningSince', () => {
  let s = T.create(60000);
  s = T.start(s, 1000);
  assert.equal(T.isRunning(s), true);
  assert.equal(T.elapsed(s, 1000), 0);
  assert.equal(T.elapsed(s, 4000), 3000);
});

test('pause: to\'plangan vaqtga qo\'shadi va to\'xtaydi', () => {
  let s = T.create(60000);
  s = T.start(s, 1000);
  s = T.pause(s, 5000); // 4s ishladi
  assert.equal(s.accumulatedMs, 4000);
  assert.equal(T.isRunning(s), false);
  assert.equal(T.elapsed(s, 999999), 4000); // pauzada o'zgarmaydi
});

test('resume: pauzadan keyin to\'plangandan davom etadi', () => {
  let s = T.create(60000);
  s = T.start(s, 1000);
  s = T.pause(s, 5000);   // 4s
  s = T.start(s, 10000);  // resume
  assert.equal(T.elapsed(s, 13000), 7000); // 4s + 3s
});

test('reload: holat saqlanib, now bilan qayta hisoblanadi (yopilsa ham aniq)', () => {
  let s = T.create(60000);
  s = T.start(s, 1000);
  const restored = JSON.parse(JSON.stringify(s)); // "ilova yopildi/ochildi"
  assert.equal(T.elapsed(restored, 8000), 7000);
});

test('CHEKKA: maqsaddan oshmaydi (goalMs da clamp)', () => {
  let s = T.create(5000);
  s = T.start(s, 0);
  assert.equal(T.elapsed(s, 999999), 5000);
  assert.equal(T.progress(s, 999999), 1);
  assert.equal(T.isComplete(s, 999999), true);
});

test('CHEKKA: manfiy vaqt yo\'q (soat orqaga ketsa ham)', () => {
  let s = T.create(60000);
  s = T.start(s, 5000);
  assert.equal(T.elapsed(s, 1000), 0);
});

test('progress: 0 dan 1 gacha', () => {
  let s = T.create(10000);
  s = T.start(s, 0);
  assert.equal(T.progress(s, 5000), 0.5);
});

test('CHEKKA: ishlayotganda qayta start — reset qilmaydi', () => {
  let s = T.create(60000);
  s = T.start(s, 1000);
  const s2 = T.start(s, 9000);
  assert.equal(s2.runningSince, 1000);
});

test('finish: to\'xtatadi va tugagan deb belgilaydi', () => {
  let s = T.create(60000);
  s = T.start(s, 1000);
  s = T.finish(s, 4000);
  assert.equal(s.done, true);
  assert.equal(T.isRunning(s), false);
  assert.equal(s.accumulatedMs, 3000);
});

test('CHEKKA: tugagan taymerni start qilib bo\'lmaydi', () => {
  let s = T.create(60000);
  s = T.start(s, 1000);
  s = T.finish(s, 4000);
  const s2 = T.start(s, 10000);
  assert.equal(T.isRunning(s2), false);
});

test('bir nechta taymer mustaqil — biri pauzada, biri ishlaydi (TZ 4.2)', () => {
  let a = T.start(T.create(60000), 0);
  let b = T.start(T.create(60000), 0);
  b = T.pause(b, 2000);
  assert.equal(T.elapsed(a, 5000), 5000);
  assert.equal(T.elapsed(b, 5000), 2000);
});
