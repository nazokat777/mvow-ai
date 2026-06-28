'use strict';
/**
 * Telefon-yuztuban aniqlash testlari (akselerometr — kreativ bonus, TZ 6).
 * z = accelerationIncludingGravity.z. Ekran pastga qaraganda z ~ -9.8.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const M = require('../docs/focus-ai/motion.js');

test('isFaceDown: ekran pastga (z manfiy katta) → true', () => {
  assert.equal(M.isFaceDown(-9.8), true);
  assert.equal(M.isFaceDown(-8), true);
});

test('isFaceDown: ekran tepaga (z musbat) → false', () => {
  assert.equal(M.isFaceDown(9.8), false);
});

test('isFaceDown: tik/qiya turgan (z kichik) → false', () => {
  assert.equal(M.isFaceDown(0), false);
  assert.equal(M.isFaceDown(-3), false);
});

test('isFaceDown: chegara ~ -7', () => {
  assert.equal(M.isFaceDown(-6.9), false);
  assert.equal(M.isFaceDown(-7.1), true);
});

test('isFaceDown: CHEKKA — null/undefined/NaN → false', () => {
  assert.equal(M.isFaceDown(null), false);
  assert.equal(M.isFaceDown(undefined), false);
  assert.equal(M.isFaceDown(NaN), false);
});
