import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initGame, applyAnswer } from '../js/engine.js';

export const ATTRS = [
  { id: 'isReal', label: '真实', group: 'g' },
  { id: 'isMale', label: '男性', group: 'g' },
  { id: 'isWestern', label: '欧美', group: 'g' },
  { id: 'isScientist', label: '科学家', group: 'g' },
];

export const CHARS = [
  { id: 'newton', name: '牛顿', emoji: 'x', attrs: { isReal: true, isMale: true, isWestern: true, isScientist: true } },
  { id: 'einstein', name: '爱因斯坦', emoji: 'x', attrs: { isReal: true, isMale: true, isWestern: true, isScientist: true } },
  { id: 'mickey', name: '米老鼠', emoji: 'x', attrs: { isReal: false, isMale: true, isWestern: true, isScientist: false } },
];

test('initGame 初始权重全为 1', () => {
  const g = initGame(CHARS, ATTRS);
  assert.deepEqual(g.weights, { newton: 1, einstein: 1, mickey: 1 });
  assert.deepEqual(g.asked, []);
  assert.deepEqual(g.history, []);
});

test('applyAnswer 按乘子更新并按最大值归一化', () => {
  let g = initGame(CHARS, ATTRS);
  g = applyAnswer(g, 'isReal', 'no');
  assert.equal(g.weights.mickey, 1);
  assert.equal(g.weights.newton, 0.1);
  assert.equal(g.weights.einstein, 0.1);
  assert.deepEqual(g.asked, ['isReal']);
  assert.deepEqual(g.history, [{ attrId: 'isReal', answer: 'no' }]);
});

test('applyAnswer 未知属性按中性处理', () => {
  const chars = [{ id: 'a', name: 'A', emoji: 'x', attrs: {} }];
  const g = applyAnswer(initGame(chars, ATTRS), 'isReal', 'yes');
  assert.equal(g.weights.a, 1);
});

test('applyAnswer 不修改入参', () => {
  const g0 = initGame(CHARS, ATTRS);
  const snapshot = JSON.stringify(g0);
  applyAnswer(g0, 'isReal', 'yes');
  assert.equal(JSON.stringify(g0), snapshot);
});
