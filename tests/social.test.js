'use strict';
/**
 * Ijtimoiy qatlam testlari — LOKAL rejim (window.supabase yo'q).
 * Bulut yo'lida ham ilova buzilmaydi: leaderboard doim Promise qaytaradi,
 * kalit bo'lmasa lokal reyting (Siz + kutilayotgan do'stlar).
 */
const { test } = require('node:test');
const assert = require('node:assert');
const { loadScripts } = require('./harness');

function load(seed) {
  const r = loadScripts(['social.js'], seed || {});
  return r.sandbox.Social;
}

test('myCode: AAA999 formati, barqaror (ikkinchi chaqiruvda bir xil)', () => {
  const S = load();
  const c1 = S.myCode();
  assert.match(c1, /^[A-Z]{3}[0-9]{3}$/);
  assert.strictEqual(S.myCode(), c1);
});

test('myCode: saqlangan kod o\'qiladi', () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(S.myCode(), 'ABC123');
});

test('addFriend: to\'g\'ri kod → true va ro\'yxatga qo\'shiladi', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(await S.addFriend('XYZ789', 'friend'), true);
  assert.ok(S.friends().some((f) => f.code === 'XYZ789' && f.role === 'friend'));
});

test('addFriend: noto\'g\'ri format → false', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(await S.addFriend('123', 'friend'), false);
  assert.strictEqual(await S.addFriend('', 'friend'), false);
});

test('addFriend: o\'z kodini qo\'shib bo\'lmaydi', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(await S.addFriend('ABC123', 'friend'), false);
});

test('addFriend: takror qo\'shilmaydi', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(await S.addFriend('XYZ789', 'friend'), true);
  assert.strictEqual(await S.addFriend('xyz789', 'friend'), false);
});

test('addFriend: do\'st va ustoz alohida ro\'lda saqlanadi', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(await S.addFriend('XYZ789', 'friend'), true);
  assert.strictEqual(await S.addFriend('XYZ789', 'mentor'), true);
  assert.strictEqual(S.friends().length, 2);
});

test('leaderboard: Promise qaytaradi, "Siz" birinchi (lokal, do\'stsiz)', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  const list = await S.leaderboard('friend');
  assert.ok(Array.isArray(list));
  assert.strictEqual(list[0].me, true);
});

test('leaderboard: qo\'shilgan do\'st kutilmoqda holatida ko\'rinadi', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  await S.addFriend('XYZ789', 'friend');
  const list = await S.leaderboard('friend');
  assert.strictEqual(list.length, 2);
  const friend = list.find((x) => x.code === 'XYZ789');
  assert.ok(friend && friend.pending === true);
});

test('leaderboard: ustoz tabida do\'stlar ko\'rinmaydi', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  await S.addFriend('XYZ789', 'friend');
  const list = await S.leaderboard('mentor');
  assert.strictEqual(list.length, 1); // faqat "Siz"
});

test('cloud: kalitsiz → false (lokal rejim)', () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(S.cloud(), false);
});

test('chat: kalitsiz sendMessage → false (buzilmaydi)', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(await S.sendMessage('XYZ789', 'salom'), false);
});

test('chat: kalitsiz getMessages → bo\'sh massiv', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  const r = await S.getMessages('XYZ789');
  assert.ok(Array.isArray(r) && r.length === 0);
});

test('chat: subscribeMessages kalitsiz → null', () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(S.subscribeMessages('XYZ789', () => {}), null);
});

test('chat: bo\'sh xabar yuborilmaydi → false', async () => {
  const S = load({ 'mvow.myCode': 'ABC123' });
  assert.strictEqual(await S.sendMessage('XYZ789', '   '), false);
});
