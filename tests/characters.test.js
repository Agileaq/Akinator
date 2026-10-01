import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ATTRIBUTES, CHARACTERS, makeCharacter } from '../js/data/characters.js';

test('属性共 30 条且 id 唯一', () => {
  assert.equal(ATTRIBUTES.length, 30);
  const ids = ATTRIBUTES.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('角色至少 50 个，id 与 name 唯一', () => {
  assert.ok(CHARACTERS.length >= 50, `实际 ${CHARACTERS.length}`);
  assert.equal(new Set(CHARACTERS.map((c) => c.id)).size, CHARACTERS.length);
  assert.equal(new Set(CHARACTERS.map((c) => c.name)).size, CHARACTERS.length);
});

test('角色 attrs 只包含已知属性，且每条属性都有布尔值', () => {
  const known = new Set(ATTRIBUTES.map((a) => a.id));
  for (const c of CHARACTERS) {
    for (const [k, v] of Object.entries(c.attrs)) {
      assert.ok(known.has(k), `${c.id} 含未知属性 ${k}`);
      assert.equal(typeof v, 'boolean');
    }
    assert.equal(Object.keys(c.attrs).length, ATTRIBUTES.length);
  }
});

test('每个角色至少有一个 true 属性', () => {
  for (const c of CHARACTERS) {
    assert.ok(Object.values(c.attrs).some((v) => v === true), `${c.id} 没有 true 属性`);
  }
});

test('makeCharacter 未列出的属性默认为 false', () => {
  const c = makeCharacter('t', '测试', 'x', { isReal: true });
  assert.equal(c.attrs.isReal, true);
  assert.equal(c.attrs.isFictional, false);
});
