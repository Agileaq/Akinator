import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

function makeFakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}

beforeEach(() => {
  globalThis.localStorage = makeFakeStorage();
});

const { loadUserCharacters, saveUserCharacter, clearUserCharacters, loadStats, saveStats } =
  await import('../js/storage.js');

test('loadUserCharacters 默认返回空数组', () => {
  assert.deepEqual(loadUserCharacters(), []);
});

test('保存后可读回，且过滤非法项', () => {
  saveUserCharacter({ id: 'u1', name: '甲', emoji: 'x', attrs: { isReal: true }, learned: true });
  localStorage.setItem('akinator.userCharacters.v1', JSON.stringify([{ bad: true }]));
  const list = loadUserCharacters();
  assert.deepEqual(list, []);
});

test('saveUserCharacter 追加而非覆盖', () => {
  saveUserCharacter({ id: 'u1', name: '甲', attrs: {} });
  saveUserCharacter({ id: 'u2', name: '乙', attrs: {} });
  assert.equal(loadUserCharacters().length, 2);
});

test('clearUserCharacters 清空', () => {
  saveUserCharacter({ id: 'u1', name: '甲', attrs: {} });
  clearUserCharacters();
  assert.deepEqual(loadUserCharacters(), []);
});

test('loadStats 默认零并容错', () => {
  assert.deepEqual(loadStats(), { games: 0, guessed: 0 });
  localStorage.setItem('akinator.stats.v1', '{bad json');
  assert.deepEqual(loadStats(), { games: 0, guessed: 0 });
});

test('saveStats 可读回', () => {
  saveStats({ games: 3, guessed: 1 });
  assert.deepEqual(loadStats(), { games: 3, guessed: 1 });
});

test('存储抛错时读取返回默认值且写入/删除不抛错', () => {
  globalThis.localStorage = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {
      throw new Error('SecurityError');
    },
  };
  assert.deepEqual(loadUserCharacters(), []);
  assert.deepEqual(loadStats(), { games: 0, guessed: 0 });
  assert.doesNotThrow(() => saveUserCharacter({ id: 'u', name: '甲', attrs: {} }));
  assert.doesNotThrow(() => saveStats({ games: 1, guessed: 1 }));
  assert.doesNotThrow(() => clearUserCharacters());
});
