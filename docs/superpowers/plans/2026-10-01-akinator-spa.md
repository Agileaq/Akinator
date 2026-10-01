# Akinator 单页猜谜游戏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个离线、零依赖的原生单页 Akinator 猜谜游戏，支持模糊回答与玩家教新角色。

**Architecture:** 属性加权评分推理引擎（纯函数模块，可单测）+ 原生 DOM 状态机 + localStorage 持久化。数据（30 条属性、约 50 个角色）与逻辑分离。

**Tech Stack:** 原生 HTML / CSS / JavaScript（ES Modules），Node 内置测试运行器 `node --test`，无任何第三方依赖，无构建步骤。

**Spec:** `docs/superpowers/specs/2026-10-01-akinator-spa-design.md`

## Global Constraints

- 零运行时依赖、零构建；双击 `index.html` 即可运行。
- 全部使用 ES Modules（`package.json` 设 `"type": "module"`）。
- `engine.js` 与 `storage.js` 之外不得操作 DOM；`engine.js` 必须是纯函数，不读取全局状态。
- 界面语言为简体中文。
- 属性固定 30 条，`id` 全局唯一。
- 回答集合固定：`yes | no | probably | probablyNot | unknown`。
- 权重乘子固定：yes `{true:3.0,false:0.3,unknown:1.0}`；no `{true:0.3,false:3.0,unknown:1.0}`；probably `{true:1.6,false:0.6,unknown:1.0}`；probablyNot `{true:0.6,false:1.6,unknown:1.0}`；unknown 全 `1.0`。每次更新后按最大值归一化。
- 猜测阈值 `0.85`，最大问题数 `25`。
- localStorage 键：`akinator.userCharacters.v1`、`akinator.stats.v1`。
- 每个任务的测试命令统一为 `npm test`（即 `node --test tests/`）。

---

### Task 1: 项目脚手架与角色数据

**Files:**
- Create: `package.json`
- Create: `js/data/characters.js`
- Test: `tests/characters.test.js`

**Interfaces:**
- Consumes: 无
- Produces:
  - `ATTRIBUTES: Array<{id:string, label:string, group:string}>`（长度 30）
  - `CHARACTERS: Array<{id:string, name:string, emoji:string, attrs:Record<string,boolean>}>`
  - `makeCharacter(id, name, emoji, trueAttrs?) => character`（内部/测试可用，导出）

- [ ] **Step 1: 写失败的测试**

创建 `tests/characters.test.js`：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL —— 无法解析 `../js/data/characters.js` 或 `package.json` 不存在。

- [ ] **Step 3: 创建 `package.json`**

```json
{
  "name": "akinator-spa",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 4: 创建 `js/data/characters.js`**

```js
export const ATTRIBUTES = [
  { id: 'isReal', label: '是真实存在的人物', group: '真实性' },
  { id: 'isFictional', label: '是虚构角色', group: '真实性' },
  { id: 'isHuman', label: '是人类', group: '形态' },
  { id: 'isAnimal', label: '是动物或拟人动物', group: '形态' },
  { id: 'isMale', label: '是男性', group: '身份' },
  { id: 'isFemale', label: '是女性', group: '身份' },
  { id: 'isAlive', label: '现在还在世', group: '状态' },
  { id: 'isHistorical', label: '是古代或历史人物', group: '状态' },
  { id: 'isChinese', label: '与中国或华语圈相关', group: '地域' },
  { id: 'isWestern', label: '来自欧美', group: '地域' },
  { id: 'isEntertainment', label: '从事娱乐或演艺', group: '领域' },
  { id: 'isActor', label: '是演员', group: '领域' },
  { id: 'isSinger', label: '是歌手或音乐人', group: '领域' },
  { id: 'isAthlete', label: '是运动员', group: '领域' },
  { id: 'isPolitician', label: '是政治人物或领袖', group: '领域' },
  { id: 'isScientist', label: '是科学家或学者', group: '领域' },
  { id: 'isWriter', label: '是作家', group: '领域' },
  { id: 'isBusiness', label: '是企业家或商人', group: '领域' },
  { id: 'isArtist', label: '是艺术家或画家', group: '领域' },
  { id: 'isRoyal', label: '是皇室或贵族', group: '身份' },
  { id: 'isWarrior', label: '是战士或武打人物', group: '身份' },
  { id: 'isChild', label: '是儿童或少年形象', group: '身份' },
  { id: 'isMovieCharacter', label: '出自影视作品', group: '虚构来源' },
  { id: 'isCartoon', label: '是动漫或卡通角色', group: '虚构来源' },
  { id: 'isGameCharacter', label: '出自电子游戏', group: '虚构来源' },
  { id: 'isFromAsiaFiction', label: '出自亚洲动漫或游戏', group: '虚构来源' },
  { id: 'isSuperhero', label: '是超级英雄', group: '虚构属性' },
  { id: 'isVillain', label: '是反派', group: '虚构属性' },
  { id: 'hasSuperpower', label: '有超能力', group: '虚构属性' },
  { id: 'hasMagic', label: '会魔法或超自然能力', group: '虚构属性' },
];

export function makeCharacter(id, name, emoji, trueAttrs = {}) {
  const attrs = {};
  for (const a of ATTRIBUTES) attrs[a.id] = false;
  for (const [k, v] of Object.entries(trueAttrs)) if (v) attrs[k] = true;
  return { id, name, emoji, attrs };
}

export const CHARACTERS = [
  makeCharacter('newton', '牛顿', '🍎', { isReal: true, isHuman: true, isMale: true, isWestern: true, isScientist: true, isHistorical: true }),
  makeCharacter('einstein', '爱因斯坦', '⚛️', { isReal: true, isHuman: true, isMale: true, isWestern: true, isScientist: true, isHistorical: true }),
  makeCharacter('libai', '李白', '🍶', { isReal: true, isHuman: true, isMale: true, isChinese: true, isWriter: true, isHistorical: true }),
  makeCharacter('confucius', '孔子', '📜', { isReal: true, isHuman: true, isMale: true, isChinese: true, isWriter: true, isHistorical: true }),
  makeCharacter('qinshihuang', '秦始皇', '🏯', { isReal: true, isHuman: true, isMale: true, isChinese: true, isPolitician: true, isRoyal: true, isHistorical: true }),
  makeCharacter('wuzetian', '武则天', '👑', { isReal: true, isHuman: true, isFemale: true, isChinese: true, isPolitician: true, isRoyal: true, isHistorical: true }),
  makeCharacter('davinci', '达芬奇', '🎨', { isReal: true, isHuman: true, isMale: true, isWestern: true, isArtist: true, isScientist: true, isHistorical: true }),
  makeCharacter('beethoven', '贝多芬', '🎼', { isReal: true, isHuman: true, isMale: true, isWestern: true, isSinger: true, isHistorical: true }),
  makeCharacter('mozart', '莫扎特', '🎹', { isReal: true, isHuman: true, isMale: true, isWestern: true, isSinger: true, isHistorical: true }),
  makeCharacter('chenglong', '成龙', '🐉', { isReal: true, isHuman: true, isMale: true, isChinese: true, isEntertainment: true, isActor: true, isWarrior: true, isAlive: true }),
  makeCharacter('liudehua', '刘德华', '🎤', { isReal: true, isHuman: true, isMale: true, isChinese: true, isEntertainment: true, isActor: true, isSinger: true, isAlive: true }),
  makeCharacter('zhoujielun', '周杰伦', '🎵', { isReal: true, isHuman: true, isMale: true, isChinese: true, isEntertainment: true, isSinger: true, isAlive: true }),
  makeCharacter('yaoming', '姚明', '🏀', { isReal: true, isHuman: true, isMale: true, isChinese: true, isAthlete: true, isAlive: true }),
  makeCharacter('messi', '梅西', '⚽', { isReal: true, isHuman: true, isMale: true, isWestern: true, isAthlete: true, isAlive: true }),
  makeCharacter('musk', '马斯克', '🚀', { isReal: true, isHuman: true, isMale: true, isWestern: true, isBusiness: true, isAlive: true }),
  makeCharacter('jobs', '乔布斯', '📱', { isReal: true, isHuman: true, isMale: true, isWestern: true, isBusiness: true }),
  makeCharacter('sunwukong', '孙悟空', '🐒', { isFictional: true, isAnimal: true, isMale: true, isChinese: true, isWarrior: true, isFromAsiaFiction: true, hasMagic: true, hasSuperpower: true }),
  makeCharacter('lindaiyu', '林黛玉', '🌸', { isFictional: true, isHuman: true, isFemale: true, isChinese: true, isFromAsiaFiction: true }),
  makeCharacter('nezha', '哪吒', '🔥', { isFictional: true, isHuman: true, isMale: true, isChinese: true, isChild: true, isWarrior: true, isFromAsiaFiction: true, hasMagic: true, hasSuperpower: true }),
  makeCharacter('harrypotter', '哈利·波特', '⚡', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isChild: true, isMovieCharacter: true, hasMagic: true }),
  makeCharacter('hermione', '赫敏', '📖', { isFictional: true, isHuman: true, isFemale: true, isWestern: true, isChild: true, isMovieCharacter: true, hasMagic: true }),
  makeCharacter('voldemort', '伏地魔', '🐍', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isMovieCharacter: true, isVillain: true, hasMagic: true }),
  makeCharacter('spiderman', '蜘蛛侠', '🕷️', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isMovieCharacter: true, isSuperhero: true, hasSuperpower: true }),
  makeCharacter('ironman', '钢铁侠', '🤖', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isMovieCharacter: true, isSuperhero: true, isBusiness: true, hasSuperpower: true }),
  makeCharacter('batman', '蝙蝠侠', '🦇', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isMovieCharacter: true, isSuperhero: true, isBusiness: true }),
  makeCharacter('superman', '超人', '🦸', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isMovieCharacter: true, isSuperhero: true, hasSuperpower: true }),
  makeCharacter('thanos', '灭霸', '💜', { isFictional: true, isMale: true, isWestern: true, isMovieCharacter: true, isVillain: true, hasSuperpower: true }),
  makeCharacter('mickey', '米老鼠', '🐭', { isFictional: true, isAnimal: true, isMale: true, isWestern: true, isCartoon: true, isMovieCharacter: true }),
  makeCharacter('donald', '唐老鸭', '🦆', { isFictional: true, isAnimal: true, isMale: true, isWestern: true, isCartoon: true, isMovieCharacter: true }),
  makeCharacter('pikachu', '皮卡丘', '⚡', { isFictional: true, isAnimal: true, isFromAsiaFiction: true, isCartoon: true, isGameCharacter: true }),
  makeCharacter('doraemon', '哆啦A梦', '🐱', { isFictional: true, isAnimal: true, isMale: true, isFromAsiaFiction: true, isCartoon: true, isChild: true }),
  makeCharacter('conan', '柯南', '🔍', { isFictional: true, isHuman: true, isMale: true, isChild: true, isFromAsiaFiction: true, isCartoon: true }),
  makeCharacter('naruto', '鸣人', '🍥', { isFictional: true, isHuman: true, isMale: true, isFromAsiaFiction: true, isCartoon: true, isWarrior: true, hasMagic: true, hasSuperpower: true }),
  makeCharacter('luffy', '路飞', '🏴‍☠️', { isFictional: true, isHuman: true, isMale: true, isFromAsiaFiction: true, isCartoon: true, isWarrior: true, hasSuperpower: true }),
  makeCharacter('mario', '马里奥', '🍄', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isGameCharacter: true }),
  makeCharacter('zelda', '塞尔达', '🏹', { isFictional: true, isHuman: true, isFemale: true, isWestern: true, isGameCharacter: true, isRoyal: true }),
  makeCharacter('link', '林克', '🗡️', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isGameCharacter: true, isWarrior: true }),
  makeCharacter('elsa', '艾莎', '❄️', { isFictional: true, isHuman: true, isFemale: true, isWestern: true, isRoyal: true, isMovieCharacter: true, isCartoon: true, hasMagic: true }),
  makeCharacter('moana', '莫阿娜', '🌊', { isFictional: true, isHuman: true, isFemale: true, isWestern: true, isMovieCharacter: true, isCartoon: true }),
  makeCharacter('simba', '辛巴', '🦁', { isFictional: true, isAnimal: true, isMale: true, isWestern: true, isRoyal: true, isMovieCharacter: true, isCartoon: true }),
  makeCharacter('spongebob', '海绵宝宝', '🧽', { isFictional: true, isAnimal: true, isMale: true, isWestern: true, isCartoon: true }),
  makeCharacter('shrek', '史莱克', '👹', { isFictional: true, isMale: true, isWestern: true, isCartoon: true, isMovieCharacter: true }),
  makeCharacter('holmes', '福尔摩斯', '🔎', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isMovieCharacter: true }),
  makeCharacter('gandalf', '甘道夫', '🧙', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isMovieCharacter: true, hasMagic: true }),
  makeCharacter('sauron', '索伦', '💀', { isFictional: true, isMale: true, isWestern: true, isMovieCharacter: true, isVillain: true, hasMagic: true }),
  makeCharacter('blackwidow', '黑寡妇', '🕸️', { isFictional: true, isHuman: true, isFemale: true, isWestern: true, isMovieCharacter: true, isSuperhero: true }),
  makeCharacter('wonderwoman', '神奇女侠', '🪢', { isFictional: true, isHuman: true, isFemale: true, isWestern: true, isMovieCharacter: true, isSuperhero: true, isRoyal: true, hasSuperpower: true }),
  makeCharacter('wanda', '旺达', '🔮', { isFictional: true, isHuman: true, isFemale: true, isWestern: true, isMovieCharacter: true, isSuperhero: true, hasMagic: true, hasSuperpower: true }),
  makeCharacter('captainamerica', '美国队长', '🛡️', { isFictional: true, isHuman: true, isMale: true, isWestern: true, isMovieCharacter: true, isSuperhero: true }),
  makeCharacter('xiyangyang', '喜羊羊', '🐑', { isFictional: true, isAnimal: true, isMale: true, isChinese: true, isCartoon: true }),
  makeCharacter('huluwa', '葫芦娃', '🎃', { isFictional: true, isHuman: true, isMale: true, isChinese: true, isChild: true, isCartoon: true, hasSuperpower: true }),
];
```

- [ ] **Step 5: 运行测试确认通过**

Run: `npm test`
Expected: PASS（5 个测试全绿）。

- [ ] **Step 6: 提交**

```bash
git add package.json js/data/characters.js tests/characters.test.js
git commit -m "feat: add attribute table and character database"
```

---

### Task 2: 引擎核心 — 初始化与权重更新

**Files:**
- Create: `js/engine.js`
- Test: `tests/engine.test.js`

**Interfaces:**
- Consumes: 无（测试内使用本地 fixtures）
- Produces:
  - `ANSWERS: string[]`
  - `initGame(characters, attributes) => Game`
  - `applyAnswer(game, attrId, answer) => Game`（返回新状态，不修改入参）
  - `Game` 形状：`{ characters, attributes, weights: Record<string,number>, asked: string[], history: Array<{attrId,answer}>, excluded: string[] }`

- [ ] **Step 1: 写失败的测试**

创建 `tests/engine.test.js`：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL —— 无法解析 `../js/engine.js`。

- [ ] **Step 3: 创建 `js/engine.js`（本任务部分）**

```js
export const ANSWERS = ['yes', 'no', 'probably', 'probablyNot', 'unknown'];

const MULTIPLIER_TABLE = {
  yes: { true: 3.0, false: 0.3, unknown: 1.0 },
  no: { true: 0.3, false: 3.0, unknown: 1.0 },
  probably: { true: 1.6, false: 0.6, unknown: 1.0 },
  probablyNot: { true: 0.6, false: 1.6, unknown: 1.0 },
  unknown: { true: 1.0, false: 1.0, unknown: 1.0 },
};

function valueKey(v) {
  if (v === true) return 'true';
  if (v === false) return 'false';
  return 'unknown';
}

function normalize(weights) {
  let max = 0;
  for (const id of Object.keys(weights)) if (weights[id] > max) max = weights[id];
  if (max <= 0) return weights;
  const out = {};
  for (const id of Object.keys(weights)) out[id] = weights[id] / max;
  return out;
}

export function initGame(characters, attributes) {
  const weights = {};
  for (const c of characters) weights[c.id] = 1;
  return { characters, attributes, weights, asked: [], history: [], excluded: [] };
}

export function applyAnswer(game, attrId, answer) {
  const mult = MULTIPLIER_TABLE[answer];
  const weights = {};
  for (const c of game.characters) {
    if (!(c.id in game.weights)) continue;
    const v = c.attrs ? c.attrs[attrId] : undefined;
    weights[c.id] = game.weights[c.id] * mult[valueKey(v)];
  }
  return {
    ...game,
    weights: normalize(weights),
    asked: [...game.asked, attrId],
    history: [...game.history, { attrId, answer }],
  };
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add js/engine.js tests/engine.test.js
git commit -m "feat: engine weight updates with fuzzy answers"
```

---

### Task 3: 引擎 — 选题策略

**Files:**
- Modify: `js/engine.js`
- Test: `tests/engine.test.js`

**Interfaces:**
- Consumes: `Game`（Task 2）
- Produces: `selectQuestion(game) => string | null`（返回属性 id；无可用属性时返回 `null`）

- [ ] **Step 1: 写失败的测试**

在 `tests/engine.test.js` 末尾追加：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL —— `selectQuestion` 未导出。

- [ ] **Step 3: 在 `js/engine.js` 追加实现**

```js
export function selectQuestion(game) {
  let best = null;
  let bestScore = 0;
  for (const attr of game.attributes) {
    if (game.asked.includes(attr.id)) continue;
    let wYes = 0;
    let wNo = 0;
    let known = 0;
    for (const c of game.characters) {
      const w = game.weights[c.id];
      if (w === undefined || w <= 0) continue;
      const v = c.attrs ? c.attrs[attr.id] : undefined;
      if (v === true) {
        wYes += w;
        known += 1;
      } else if (v === false) {
        wNo += w;
        known += 1;
      }
    }
    if (known < 2) continue;
    const score = Math.min(wYes, wNo);
    if (score <= 0) continue;
    if (score > bestScore || (score === bestScore && best !== null && attr.id < best)) {
      best = attr.id;
      bestScore = score;
    }
  }
  return best;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add js/engine.js tests/engine.test.js
git commit -m "feat: engine question selection by balance score"
```

---

### Task 4: 引擎 — 猜测、停止与剔除

**Files:**
- Modify: `js/engine.js`
- Test: `tests/engine.test.js`

**Interfaces:**
- Consumes: `Game`（Task 2）
- Produces:
  - `shareOf(game, charId) => number`
  - `topGuess(game) => { character, share } | null`
  - `shouldGuess(game, options?) => boolean`，`options = { threshold = 0.85, maxQuestions = 25 }`
  - `exclude(game, charId) => Game`
  - `activeCount(game) => number`

- [ ] **Step 1: 写失败的测试**

在 `tests/engine.test.js` 末尾追加：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL —— 相关函数未导出。

- [ ] **Step 3: 在 `js/engine.js` 追加实现**

```js
export function shareOf(game, charId) {
  let sum = 0;
  for (const id of Object.keys(game.weights)) sum += game.weights[id];
  if (sum <= 0) return 0;
  return (game.weights[charId] || 0) / sum;
}

export function topGuess(game) {
  let topId = null;
  let topW = 0;
  for (const id of Object.keys(game.weights)) {
    if (game.weights[id] > topW) {
      topW = game.weights[id];
      topId = id;
    }
  }
  if (topId === null) return null;
  const character = game.characters.find((c) => c.id === topId);
  if (!character) return null;
  return { character, share: shareOf(game, topId) };
}

export function shouldGuess(game, { threshold = 0.85, maxQuestions = 25 } = {}) {
  const t = topGuess(game);
  if (!t) return true;
  if (game.history.length >= maxQuestions) return true;
  return t.share >= threshold;
}

export function exclude(game, charId) {
  const weights = { ...game.weights };
  delete weights[charId];
  return { ...game, weights: normalize(weights), excluded: [...game.excluded, charId] };
}

export function activeCount(game) {
  return Object.keys(game.weights).length;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add js/engine.js tests/engine.test.js
git commit -m "feat: engine guessing, thresholds and exclusion"
```

---

### Task 5: 引擎 — 学习属性映射

**Files:**
- Modify: `js/engine.js`
- Test: `tests/engine.test.js`

**Interfaces:**
- Consumes: `Game`（Task 2）
- Produces: `learnAttributes(game) => Record<string, boolean>`（`yes→true`，`no→false`，其余忽略即未知）

- [ ] **Step 1: 写失败的测试**

在 `tests/engine.test.js` 末尾追加：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL —— `learnAttributes` 未导出。

- [ ] **Step 3: 在 `js/engine.js` 追加实现**

```js
export function learnAttributes(game) {
  const attrs = {};
  for (const { attrId, answer } of game.history) {
    if (answer === 'yes') attrs[attrId] = true;
    else if (answer === 'no') attrs[attrId] = false;
  }
  return attrs;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add js/engine.js tests/engine.test.js
git commit -m "feat: engine learning attribute mapping"
```

---

### Task 6: 持久化模块

**Files:**
- Create: `js/storage.js`
- Test: `tests/storage.test.js`

**Interfaces:**
- Consumes: `globalThis.localStorage`（浏览器提供；测试注入内存实现）
- Produces:
  - `loadUserCharacters() => Array<character>`
  - `saveUserCharacter(character) => Array<character>`
  - `clearUserCharacters() => void`
  - `loadStats() => { games: number, guessed: number }`
  - `saveStats(stats) => void`

- [ ] **Step 1: 写失败的测试**

创建 `tests/storage.test.js`：

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL —— 无法解析 `../js/storage.js`。

- [ ] **Step 3: 创建 `js/storage.js`**

```js
const USER_KEY = 'akinator.userCharacters.v1';
const STATS_KEY = 'akinator.stats.v1';

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const value = JSON.parse(raw);
    return value === null || value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

function isValidCharacter(c) {
  return (
    c &&
    typeof c === 'object' &&
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    c.attrs &&
    typeof c.attrs === 'object'
  );
}

export function loadUserCharacters() {
  const value = safeParse(localStorage.getItem(USER_KEY), []);
  return Array.isArray(value) ? value.filter(isValidCharacter) : [];
}

export function saveUserCharacter(character) {
  const list = loadUserCharacters();
  list.push(character);
  localStorage.setItem(USER_KEY, JSON.stringify(list));
  return list;
}

export function clearUserCharacters() {
  localStorage.removeItem(USER_KEY);
}

export function loadStats() {
  const value = safeParse(localStorage.getItem(STATS_KEY), { games: 0, guessed: 0 });
  return { games: Number(value.games) || 0, guessed: Number(value.guessed) || 0 };
}

export function saveStats(stats) {
  localStorage.setItem(
    STATS_KEY,
    JSON.stringify({ games: Number(stats.games) || 0, guessed: Number(stats.guessed) || 0 })
  );
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: PASS。

- [ ] **Step 5: 提交**

```bash
git add js/storage.js tests/storage.test.js
git commit -m "feat: localStorage persistence for learned characters and stats"
```

---

### Task 7: 页面结构与视觉样式

**Files:**
- Create: `index.html`
- Create: `styles.css`

**Interfaces:**
- Consumes: 无
- Produces: DOM 契约（`app.js` 依赖这些 id）：
  - `<main id="app">`：唯一挂载点，初始为空。
  - `<script type="module" src="js/app.js">`
  - 其余元素一律由 `app.js` 动态生成，样式类名见下方 CSS。

- [ ] **Step 1: 创建 `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Akinator 猜谜</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="stars" aria-hidden="true"></div>
    <main id="app" class="app"></main>
    <script type="module" src="js/app.js"></script>
  </body>
</html>
```

- [ ] **Step 2: 创建 `styles.css`**

```css
:root {
  --bg-top: #1a0b2e;
  --bg-bottom: #0a0417;
  --gold: #f5c542;
  --gold-soft: #ffe08a;
  --violet: #8b5cf6;
  --text: #f3ecff;
  --muted: #b8a6d9;
  --card: rgba(45, 20, 80, 0.72);
}

* { box-sizing: border-box; }

html, body {
  height: 100%;
  margin: 0;
}

body {
  font-family: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  color: var(--text);
  background: radial-gradient(circle at 50% 0%, var(--bg-top), var(--bg-bottom) 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 16px;
  overflow-x: hidden;
}

.stars {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(2px 2px at 20% 30%, rgba(255, 224, 138, 0.8), transparent),
    radial-gradient(2px 2px at 70% 20%, rgba(255, 224, 138, 0.6), transparent),
    radial-gradient(1px 1px at 40% 70%, rgba(255, 255, 255, 0.7), transparent),
    radial-gradient(2px 2px at 85% 65%, rgba(139, 92, 246, 0.8), transparent),
    radial-gradient(1px 1px at 10% 85%, rgba(255, 255, 255, 0.6), transparent);
  animation: drift 12s ease-in-out infinite alternate;
}

@keyframes drift {
  from { transform: translateY(-6px); }
  to { transform: translateY(6px); }
}

.app {
  position: relative;
  width: min(520px, 100%);
  background: var(--card);
  border: 1px solid rgba(245, 197, 66, 0.35);
  border-radius: 24px;
  padding: 28px 22px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.25) inset;
  backdrop-filter: blur(6px);
  text-align: center;
  animation: fade-in 0.4s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

h1, h2 { margin: 0 0 12px; font-weight: 700; }
h1 { font-size: 26px; color: var(--gold-soft); letter-spacing: 1px; }
h2 { font-size: 20px; }

.lamp { font-size: 64px; margin: 8px 0 4px; animation: float 3s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.subtitle { color: var(--muted); line-height: 1.7; margin: 8px 0 20px; }

.question {
  font-size: 22px;
  font-weight: 700;
  margin: 18px 0 22px;
  min-height: 60px;
  animation: fade-in 0.35s ease;
}

.progress {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
  margin: 4px 0 18px;
}
.progress__fill {
  height: 100%;
  width: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--violet), var(--gold));
  transition: width 0.4s ease;
}

.answers { display: grid; gap: 10px; }
.answers .btn { width: 100%; }

.btn {
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  border-radius: 14px;
  padding: 13px 18px;
  color: #1a0b2e;
  background: linear-gradient(180deg, var(--gold-soft), var(--gold));
  border: none;
  transition: transform 0.12s ease, box-shadow 0.2s ease;
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245, 197, 66, 0.35); }
.btn:focus-visible { outline: 3px solid var(--violet); outline-offset: 2px; }
.btn--ghost {
  background: transparent;
  color: var(--text);
  border: 1px solid rgba(245, 197, 66, 0.5);
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.guess-avatar {
  font-size: 84px;
  line-height: 1;
  width: 150px;
  height: 150px;
  margin: 10px auto 14px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 3px solid var(--gold);
  background: radial-gradient(circle, rgba(139, 92, 246, 0.5), transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 197, 66, 0.4); }
  50% { box-shadow: 0 0 0 18px rgba(245, 197, 66, 0); }
}

.guess-name { font-size: 28px; font-weight: 800; color: var(--gold-soft); margin-bottom: 18px; }

.input {
  width: 100%;
  font: inherit;
  padding: 13px 16px;
  border-radius: 14px;
  border: 1px solid rgba(245, 197, 66, 0.5);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text);
  margin-bottom: 12px;
}
.input:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px rgba(245, 197, 66, 0.25); }

.actions { display: grid; gap: 10px; margin-top: 6px; }
.error { color: #ff8a8a; font-size: 14px; min-height: 20px; margin: 4px 0 8px; }
.stats { color: var(--muted); font-size: 14px; margin-top: 16px; }
.link-btn {
  background: none;
  border: none;
  color: var(--muted);
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
  margin-top: 10px;
}

@media (max-width: 420px) {
  .app { padding: 22px 16px; border-radius: 18px; }
  h1 { font-size: 22px; }
  .question { font-size: 19px; }
  .guess-avatar { width: 120px; height: 120px; font-size: 64px; }
}

@media (prefers-reduced-motion: reduce) {
  .stars, .lamp, .guess-avatar, .app { animation: none; }
}
```

- [ ] **Step 3: 手动验证渲染骨架**

Run: `node -e "const fs=require('fs');['index.html','styles.css'].forEach(f=>{if(!fs.existsSync(f))throw new Error(f+' missing')});console.log('files ok')"`
Expected: 输出 `files ok`。

- [ ] **Step 4: 提交**

```bash
git add index.html styles.css
git commit -m "feat: page shell and mystical divination styles"
```

---

### Task 8: 应用状态机与 DOM 编排

**Files:**
- Create: `js/app.js`

**Interfaces:**
- Consumes: `ATTRIBUTES, CHARACTERS`（Task 1）；`initGame, applyAnswer, selectQuestion, topGuess, shouldGuess, exclude, learnAttributes, activeCount`（Tasks 2–5）；`loadUserCharacters, saveUserCharacter, clearUserCharacters, loadStats, saveStats`（Task 6）
- Produces: 可运行的页面行为（无自动化测试，靠手动验证）

- [ ] **Step 1: 创建 `js/app.js`**

```js
import { ATTRIBUTES, CHARACTERS } from './data/characters.js';
import {
  initGame,
  applyAnswer,
  selectQuestion,
  topGuess,
  shouldGuess,
  exclude,
  learnAttributes,
  activeCount,
} from './engine.js';
import {
  loadUserCharacters,
  saveUserCharacter,
  clearUserCharacters,
  loadStats,
  saveStats,
} from './storage.js';

const ANSWER_LABELS = {
  yes: '是',
  probably: '也许是',
  no: '否',
  probablyNot: '也许不是',
  unknown: '不知道',
};

const app = document.getElementById('app');
const state = {
  screen: 'intro',
  game: null,
  currentAttr: null,
  guess: null,
  learnError: '',
  stats: loadStats(),
};

function allCharacters() {
  const user = loadUserCharacters();
  const builtinIds = new Set(CHARACTERS.map((c) => c.id));
  const builtinNames = new Set(CHARACTERS.map((c) => c.name));
  const extra = user.filter((c) => !builtinIds.has(c.id) && !builtinNames.has(c.name));
  return [...CHARACTERS, ...extra];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function render() {
  if (state.screen === 'intro') renderIntro();
  else if (state.screen === 'asking') renderAsking();
  else if (state.screen === 'guessing') renderGuessing();
  else if (state.screen === 'learn') renderLearn();
  else if (state.screen === 'win') renderWin();
}

function bind(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

function renderIntro() {
  app.innerHTML = `
    <div class="lamp">🪄</div>
    <h1>我是 Akinator</h1>
    <p class="subtitle">心里想一个真实或虚构的角色，我会用问题把它猜出来。</p>
    <div class="actions">
      <button class="btn" id="start">开始</button>
      ${loadUserCharacters().length ? '<button class="btn btn--ghost" id="clear">清除我教过的角色</button>' : ''}
    </div>
    <p class="stats">已玩 ${state.stats.games} 局 · 猜中 ${state.stats.guessed} 次</p>
  `;
  bind('start', 'click', startGame);
  bind('clear', 'click', () => {
    if (confirm('确定要清除你教过的所有角色吗？')) {
      clearUserCharacters();
      render();
    }
  });
}

function startGame() {
  state.game = initGame(allCharacters(), ATTRIBUTES);
  state.stats.games += 1;
  saveStats(state.stats);
  advance();
}

function advance() {
  if (shouldGuess(state.game)) {
    const t = topGuess(state.game);
    if (t) {
      state.guess = t;
      state.screen = 'guessing';
      render();
      return;
    }
    state.screen = 'learn';
    render();
    return;
  }
  const attrId = selectQuestion(state.game);
  if (!attrId) {
    const t = topGuess(state.game);
    if (t) {
      state.guess = t;
      state.screen = 'guessing';
    } else {
      state.screen = 'learn';
    }
    render();
    return;
  }
  state.currentAttr = ATTRIBUTES.find((a) => a.id === attrId);
  state.screen = 'asking';
  render();
}

function renderAsking() {
  const t = topGuess(state.game);
  const pct = t ? Math.round(t.share * 100) : 0;
  app.innerHTML = `
    <h2>我想想……</h2>
    <div class="question">${escapeHtml(state.currentAttr.label)}？</div>
    <div class="progress" aria-hidden="true">
      <div class="progress__fill" style="width:${pct}%"></div>
    </div>
    <div class="answers">
      ${Object.keys(ANSWER_LABELS).map(
        (key) => `<button class="btn" data-answer="${key}">${ANSWER_LABELS[key]}</button>`
      ).join('')}
    </div>
  `;
  app.querySelectorAll('[data-answer]').forEach((btn) => {
    btn.addEventListener('click', () => answer(btn.dataset.answer));
  });
}

function answer(value) {
  state.game = applyAnswer(state.game, state.currentAttr.id, value);
  advance();
}

function renderGuessing() {
  const { character } = state.guess;
  app.innerHTML = `
    <h2>我想到了！</h2>
    <div class="guess-avatar">${escapeHtml(character.emoji || '❓')}</div>
    <div class="guess-name">是${escapeHtml(character.name)}吗？</div>
    <div class="actions">
      <button class="btn" id="correct">猜对了</button>
      <button class="btn btn--ghost" id="retry">再试试</button>
      <button class="btn btn--ghost" id="giveup">都不是</button>
    </div>
  `;
  bind('correct', 'click', () => {
    state.stats.guessed += 1;
    saveStats(state.stats);
    state.screen = 'win';
    render();
  });
  bind('retry', 'click', () => {
    state.game = exclude(state.game, character.id);
    if (activeCount(state.game) < 2) {
      state.screen = 'learn';
      render();
    } else {
      advance();
    }
  });
  bind('giveup', 'click', () => {
    state.screen = 'learn';
    render();
  });
}

function renderLearn() {
  app.innerHTML = `
    <div class="lamp">📓</div>
    <h2>我输了，请收我为徒</h2>
    <p class="subtitle">告诉我你想的是谁，我下次就能记住。</p>
    <input class="input" id="name" maxlength="40" placeholder="角色名字" autocomplete="off" />
    <div class="error">${escapeHtml(state.learnError)}</div>
    <div class="actions">
      <button class="btn" id="save">记住它</button>
      <button class="btn btn--ghost" id="skip">不教了，重新开始</button>
    </div>
  `;
  bind('save', 'click', submitLearn);
  bind('skip', 'click', () => {
    state.learnError = '';
    state.screen = 'intro';
    render();
  });
  const input = document.getElementById('name');
  input.focus();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitLearn();
  });
}

function submitLearn() {
  const input = document.getElementById('name');
  const name = input.value.trim();
  if (!name) {
    state.learnError = '请先输入角色名字';
    render();
    return;
  }
  const exists = allCharacters().some((c) => c.name === name);
  if (exists) {
    state.learnError = '我好像已经认识它了';
    render();
    return;
  }
  saveUserCharacter({
    id: `user-${Date.now()}`,
    name,
    emoji: '❓',
    attrs: learnAttributes(state.game),
    learned: true,
    createdAt: Date.now(),
  });
  state.learnError = '';
  state.screen = 'intro';
  render();
}

function renderWin() {
  app.innerHTML = `
    <div class="lamp">🎉</div>
    <h1>我又猜中了！</h1>
    <p class="subtitle">要不要再来一局？</p>
    <div class="actions">
      <button class="btn" id="again">再玩一次</button>
    </div>
    <p class="stats">已玩 ${state.stats.games} 局 · 猜中 ${state.stats.guessed} 次</p>
  `;
  bind('again', 'click', startGame);
}

render();
```

- [ ] **Step 2: 静态检查（语法/导入解析）**

Run: `node --check js/app.js && npm test`
Expected: `node --check` 无输出；`npm test` 全绿。
说明：`node --check` 只校验语法；DOM 行为在下一步手动验证。

- [ ] **Step 3: 手动验证（在浏览器中）**

启动本地静态服务：`python3 -m http.server 8080`（在项目根目录运行），浏览器打开 `http://localhost:8080`，依次确认：
1. 开场显示“我是 Akinator”和“开始”按钮，无控制台报错。
2. 点“开始”后出现问题与“是/也许是/否/也许不是/不知道”五个按钮，进度条随作答变化。
3. 进度条或题量达到阈值后出现猜测头像与名字。
4. 点“再试试”会换一个猜测；“都不是”进入学习页。
5. 学习页输入一个新名字（如“张三丰”）保存后回到开场。
6. 刷新页面后重玩，选择与上次一致的答案序列，最终能猜到你教的新角色。
7. 猜对后战绩“猜中”加一，刷新后保留。
8. 开场出现“清除我教过的角色”，点击并确认后，用户角色被清空。
9. 窗口缩到手机宽度无横向滚动。

- [ ] **Step 4: 提交**

```bash
git add js/app.js
git commit -m "feat: game state machine and DOM orchestration"
```

---

### Task 9: 端到端验收与文档

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: 全部前序产物
- Produces: 可交付说明

- [ ] **Step 1: 运行完整测试套件**

Run: `npm test`
Expected: 全部通过（characters + engine + storage）。

- [ ] **Step 2: 创建 `README.md`**

```markdown
# Akinator 猜谜（单页应用）

离线运行、零依赖的 Akinator 式猜谜游戏。

## 运行

直接用浏览器打开 `index.html`，或：

    python3 -m http.server 8080
    # 打开 http://localhost:8080

## 测试

    npm test

## 玩法

心里想一个角色 → 回答一系列问题 → 让 Akinator 猜。猜不中时可以教它这个新角色，
新角色保存在浏览器 localStorage，下次可被猜中。

## 结构

- `js/data/characters.js` 属性表与角色库
- `js/engine.js` 纯函数推理引擎
- `js/storage.js` 本地持久化
- `js/app.js` 状态机与界面
```

- [ ] **Step 3: 按规格验收清单逐条手动确认**

对照 `docs/superpowers/specs/2026-10-01-akinator-spa-design.md` 第 10 节，逐条在浏览器确认并记录结果。任一条不通过则回到对应任务修复。

- [ ] **Step 4: 提交**

```bash
git add README.md
git commit -m "docs: add usage readme"
```

---

## Self-Review

**Spec coverage:**
- 技术选型（零依赖/ESM）→ Task 1（`package.json`）。
- 目录结构 → Tasks 1、2、6、7、8 按路径落地。
- 数据模型（30 属性、~50 角色、用户角色、战绩）→ Task 1 + Task 6。
- 推理算法（乘子、归一化、选题、停止、剔除、学习）→ Tasks 2–5，Global Constraints 固化常量。
- 状态机（intro/asking/guessing/learn/win）→ Task 8。
- 持久化键与容错 → Task 6。
- 视觉与无障碍（reduced-motion、焦点样式）→ Task 7。
- 测试策略 → Tasks 1–6 的 `node --test` 用例；UI 手动验证在 Task 8。
- 验收标准 → Task 9 Step 3。

**Placeholder scan:** 无 TBD/TODO；所有代码步骤均含可运行代码。

**Type consistency:** `initGame(characters, attributes)`、`applyAnswer(game, attrId, answer)`、`selectQuestion(game)`、`topGuess(game) => {character, share} | null`、`shouldGuess(game, options)`、`exclude(game, charId)`、`activeCount(game)`、`learnAttributes(game)`、`shareOf(game, charId)` 在 Tasks 2–5 定义，在 Task 8 以相同签名调用；storage 五个函数签名在 Task 6 定义并在 Task 8 一致使用。
