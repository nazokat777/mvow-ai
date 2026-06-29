'use strict';
/**
 * Tanlangan kunlar (#3) — maqsad faqat tanlangan hafta-kunlarida rejaga chiqadi.
 * g.weekdays bo'sh yoki 7 ta = har kuni. getTodayPlan oxirida filtr qo'llanadi
 * (cache'dan kelsa ham), shuning uchun manba qaysi bo'lishidan qat'i nazar to'g'ri.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const { loadData, todayIso } = require('./harness');

test('goalRunsOnDay: weekdays bo\'sh → har kuni (true)', () => {
  const { DATA } = loadData();
  assert.strictEqual(DATA.goalRunsOnDay({ weekdays: [] }, '2026-06-29'), true);
  assert.strictEqual(DATA.goalRunsOnDay({}, '2026-06-29'), true);
});

test('goalRunsOnDay: 7 kun tanlangan → har kuni (true)', () => {
  const { DATA } = loadData();
  assert.strictEqual(DATA.goalRunsOnDay({ weekdays: [0, 1, 2, 3, 4, 5, 6] }, '2026-06-29'), true);
});

test('goalRunsOnDay: faqat tanlangan kunlarda true (2026-06-29 = Dushanba, getDay=1)', () => {
  const { DATA } = loadData();
  assert.strictEqual(DATA.goalRunsOnDay({ weekdays: [1, 3, 5] }, '2026-06-29'), true);  // Du bor
  assert.strictEqual(DATA.goalRunsOnDay({ weekdays: [2, 4, 6] }, '2026-06-29'), false); // Du yo'q
});

test('goalRunsOnDay: CHEKKA — yaroqsiz iso ham xato bermaydi (true)', () => {
  const { DATA } = loadData();
  assert.strictEqual(DATA.goalRunsOnDay({ weekdays: [1] }, 'xxxx'), true);
});

test('getTodayPlan: bugun tanlanmagan bo\'lsa maqsad chiqmaydi', () => {
  const iso = todayIso();
  const todayDow = new Date(iso + 'T00:00:00').getDay();
  const wd = [0, 1, 2, 3, 4, 5, 6].filter(d => d !== todayDow); // bugundan boshqa hamma kun
  const goal = { id: 1, text: 'Sport', startDate: iso, days: 30, weekdays: wd, sessions: [{ sid: 's1', time: '09:00', dur: '1 soat' }] };
  const { DATA } = loadData({ 'mvow.goals': [goal] });
  const plan = DATA.getTodayPlan();
  assert.ok(Array.isArray(plan));
  assert.strictEqual(plan.filter(t => t.goalId === 1).length, 0);
});

test('getTodayPlan: bugun tanlangan bo\'lsa maqsad chiqadi', () => {
  const iso = todayIso();
  const todayDow = new Date(iso + 'T00:00:00').getDay();
  const goal = { id: 1, text: 'Sport', startDate: iso, days: 30, weekdays: [todayDow], sessions: [{ sid: 's1', time: '09:00', dur: '1 soat' }] };
  const { DATA } = loadData({ 'mvow.goals': [goal] });
  const plan = DATA.getTodayPlan();
  assert.strictEqual(plan.filter(t => t.goalId === 1).length, 1);
});

test('getTodayPlan: weekdays yo\'q (default) → maqsad har kuni chiqadi', () => {
  const iso = todayIso();
  const goal = { id: 1, text: 'Sport', startDate: iso, days: 30, sessions: [{ sid: 's1', time: '09:00', dur: '1 soat' }] };
  const { DATA } = loadData({ 'mvow.goals': [goal] });
  const plan = DATA.getTodayPlan();
  assert.strictEqual(plan.filter(t => t.goalId === 1).length, 1);
});
