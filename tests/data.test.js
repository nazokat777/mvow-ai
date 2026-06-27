'use strict';
/**
 * UNIT testlar — data.js biznes-mantiq (util, hisob-kitob, holat).
 * Uslub: Arrange-Act-Assert. To'g'ri holat + CHEKKA holatlar.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const { loadData, todayIso } = require('./harness');

// ─────────────────────────────────────────────────────────
// parseDurMins — davomiylik matnini daqiqaga aylantirish
// ─────────────────────────────────────────────────────────
test('parseDurMins: soat va daqiqani to\'g\'ri o\'qiydi', () => {
  const { DATA } = loadData();
  assert.equal(DATA.parseDurMins('1 soat'), 60);
  assert.equal(DATA.parseDurMins('30 daq'), 30);
  assert.equal(DATA.parseDurMins('1 soat 30 daq'), 90);
  assert.equal(DATA.parseDurMins('2 soat'), 120);
  assert.equal(DATA.parseDurMins('1.5 soat'), 90);
});

test('parseDurMins: oddiy raqamni daqiqa deb oladi', () => {
  const { DATA } = loadData();
  assert.equal(DATA.parseDurMins('45'), 45);
});

test('parseDurMins: CHEKKA holatlar — bo\'sh/null/undefined/tushunarsiz/0 → 60 (default)', () => {
  const { DATA } = loadData();
  assert.equal(DATA.parseDurMins(''), 60);
  assert.equal(DATA.parseDurMins(null), 60);
  assert.equal(DATA.parseDurMins(undefined), 60);
  assert.equal(DATA.parseDurMins('salom'), 60);
  assert.equal(DATA.parseDurMins('0'), 60); // 0 || 60 → 60
});

// ─────────────────────────────────────────────────────────
// fmtHM — daqiqani "1 soat 30 daq" formatiga
// ─────────────────────────────────────────────────────────
test('fmtHM: daqiqani soat+daqiqa matniga aylantiradi', () => {
  const { DATA } = loadData();
  assert.equal(DATA.fmtHM(90), '1 soat 30 daq');
  assert.equal(DATA.fmtHM(120), '2 soat');
  assert.equal(DATA.fmtHM(30), '30 daq');
  assert.equal(DATA.fmtHM(60), '1 soat');
  assert.equal(DATA.fmtHM(61), '1 soat 1 daq');
});

test('fmtHM: CHEKKA holatlar — 0/manfiy → "0 daq"', () => {
  const { DATA } = loadData();
  assert.equal(DATA.fmtHM(0), '0 daq');
  assert.equal(DATA.fmtHM(-30), '0 daq');
});

test('parseDurMins ↔ fmtHM: aylanma (round-trip) bir xil qoladi', () => {
  const { DATA } = loadData();
  assert.equal(DATA.fmtHM(DATA.parseDurMins('1 soat 30 daq')), '1 soat 30 daq');
  assert.equal(DATA.fmtHM(DATA.parseDurMins('2 soat')), '2 soat');
});

// ─────────────────────────────────────────────────────────
// localDateIso — Date → YYYY-MM-DD (local)
// ─────────────────────────────────────────────────────────
test('localDateIso: sanani YYYY-MM-DD formatiga, oldingi nol bilan', () => {
  const { DATA } = loadData();
  assert.equal(DATA.localDateIso(new Date(2026, 5, 28)), '2026-06-28'); // oy 5 = iyun
  assert.equal(DATA.localDateIso(new Date(2026, 0, 5)), '2026-01-05');  // pad: 01, 05
});

test('localDateIso: argumentsiz — bugungi sana formatda', () => {
  const { DATA } = loadData();
  assert.match(DATA.localDateIso(), /^\d{4}-\d{2}-\d{2}$/);
});

// ─────────────────────────────────────────────────────────
// taskKey — composite unique kalit
// ─────────────────────────────────────────────────────────
test('taskKey: sana|vaqt|nom dan kalit yasaydi', () => {
  const { DATA } = loadData();
  assert.equal(DATA.taskKey('2026-06-28', '07:00', 'Sport'), 'd2026-06-28|07:00|Sport');
});

test('taskKey: CHEKKA — null vaqt/nom bo\'sh qatorga aylanadi', () => {
  const { DATA } = loadData();
  assert.equal(DATA.taskKey('2026-06-28', null, null), 'd2026-06-28||');
});

// ─────────────────────────────────────────────────────────
// getTaskState / setTaskState — vazifa holati (localStorage)
// ─────────────────────────────────────────────────────────
test('getTaskState: noma\'lum kalit uchun default "pending" qaytaradi', () => {
  const { DATA } = loadData();
  const st = DATA.getTaskState('d2026-06-28|07:00|Yoq');
  assert.equal(st.status, 'pending');
  assert.equal(st.askCount, 0);
});

test('setTaskState → getTaskState: holat saqlanadi (round-trip)', () => {
  const { DATA } = loadData();
  DATA.setTaskState('d2026-06-28|07:00|Sport', { status: 'done' });
  assert.equal(DATA.getTaskState('d2026-06-28|07:00|Sport').status, 'done');
});

test('setTaskState: mavjud holatga qo\'shadi (merge), eski maydonlar yo\'qolmaydi', () => {
  const { DATA } = loadData();
  const key = 'd2026-06-28|08:00|Kitob';
  DATA.setTaskState(key, { askCount: 2 });
  DATA.setTaskState(key, { status: 'missed' });
  const st = DATA.getTaskState(key);
  assert.equal(st.askCount, 2);
  assert.equal(st.status, 'missed');
});

// ─────────────────────────────────────────────────────────
// getGoalProgress — maqsad bo'yicha hisob-kitob
// ─────────────────────────────────────────────────────────
test('getGoalProgress: kunlik allokatsiya = sessiyalar yig\'indisi; bajarilmagan holatda done=0', () => {
  const t = todayIso();
  const goal = {
    id: 1, text: 'Test maqsad', duration: 'week', startDate: t,
    sessions: [{ sid: 's1', time: '07:00', dur: '1 soat' }, { sid: 's2', time: '20:00', dur: '30 daq' }],
    changeLog: [{ fromIso: t, sessions: [{ time: '07:00', dur: '1 soat' }, { time: '20:00', dur: '30 daq' }] }]
  };
  const { DATA } = loadData({ 'mvow.goals': [goal], 'mvow.history': [] });
  const prog = DATA.getGoalProgress(1);
  assert.ok(prog, 'progress obyekt qaytishi kerak');
  assert.equal(prog.dailyAllocation, 90); // 60 + 30
  assert.equal(prog.done, 0);             // tarix bo'sh
  assert.ok(prog.remaining >= 0);
});

test('getGoalProgress: CHEKKA — mavjud bo\'lmagan maqsad → null', () => {
  const { DATA } = loadData({ 'mvow.goals': [] });
  assert.equal(DATA.getGoalProgress(999), null);
});
