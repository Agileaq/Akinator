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
  assert.ok(Math.abs(g.weights.newton - 0.1) < 1e-9);
  assert.ok(Math.abs(g.weights.einstein - 0.1) < 1e-9);
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

import { selectQuestion } from '../js/engine.js';

test('selectQuestion 选择把候选切得最均衡的属性，并列取 id 字典序最小', () => {
  const g = initGame(CHARS, ATTRS);
  assert.equal(selectQuestion(g), 'isReal');
});

test('selectQuestion 跳过已问过的属性', () => {
  let g = initGame(CHARS, ATTRS);
  g = applyAnswer(g, 'isReal', 'yes');
  assert.notEqual(selectQuestion(g), 'isReal');
});

test('selectQuestion 无可用属性时返回 null', () => {
  const g = initGame(CHARS, ATTRS);
  g.asked = ['isReal', 'isMale', 'isWestern', 'isScientist'];
  assert.equal(selectQuestion(g), null);
});

test('selectQuestion 忽略完全偏向一侧的属性', () => {
  const chars = [
    { id: 'a', name: 'A', emoji: 'x', attrs: { isReal: true } },
    { id: 'b', name: 'B', emoji: 'x', attrs: { isReal: true } },
  ];
  const g = initGame(chars, ATTRS);
  assert.equal(selectQuestion(g), null);
});

import { shareOf, topGuess, shouldGuess, exclude, activeCount } from '../js/engine.js';

test('shareOf / topGuess 计算占比与最优猜测', () => {
  let g = initGame(CHARS, ATTRS);
  g = applyAnswer(g, 'isReal', 'yes');
  const t = topGuess(g);
  assert.equal(t.character.id, 'newton');
  assert.ok(Math.abs(t.share - 1 / 2.1) < 1e-9);
});

test('shouldGuess 达到阈值 0.85 时返回 true', () => {
  const g = initGame(CHARS, ATTRS);
  g.weights = { newton: 1, einstein: 0.02, mickey: 0.01 };
  assert.equal(shouldGuess(g), true);
});

test('shouldGuess 达到最大问题数时返回 true', () => {
  const g = initGame([CHARS[0], CHARS[2]], ATTRS);
  g.history = Array.from({ length: 25 }, () => ({ attrId: 'x', answer: 'unknown' }));
  assert.equal(shouldGuess(g), true);
});

test('exclude 移除角色并重新归一化', () => {
  let g = initGame(CHARS, ATTRS);
  g = exclude(g, 'newton');
  assert.equal('newton' in g.weights, false);
  assert.deepEqual(g.excluded, ['newton']);
  assert.deepEqual(g.weights, { einstein: 1, mickey: 1 });
  assert.equal(activeCount(g), 2);
});

test('topGuess 无候选时返回 null', () => {
  const g = initGame(CHARS, ATTRS);
  g.weights = {};
  assert.equal(topGuess(g), null);
});

import { learnAttributes } from '../js/engine.js';

test('learnAttributes 只把明确的 yes/no 记为布尔值', () => {
  const g = initGame(CHARS, ATTRS);
  g.history = [
    { attrId: 'isReal', answer: 'yes' },
    { attrId: 'isMale', answer: 'no' },
    { attrId: 'isWestern', answer: 'probably' },
    { attrId: 'isScientist', answer: 'unknown' },
  ];
  assert.deepEqual(learnAttributes(g), { isReal: true, isMale: false });
});
