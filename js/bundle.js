(function () {
'use strict';

// js/data/characters.js
const ATTRIBUTES = [
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

function makeCharacter(id, name, emoji, trueAttrs = {}) {
  const attrs = {};
  for (const a of ATTRIBUTES) attrs[a.id] = false;
  for (const [k, v] of Object.entries(trueAttrs)) if (v) attrs[k] = true;
  return { id, name, emoji, attrs };
}

const CHARACTERS = [
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

// js/engine.js
const ANSWERS = ['yes', 'no', 'probably', 'probablyNot', 'unknown'];

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

function initGame(characters, attributes) {
  const weights = {};
  for (const c of characters) weights[c.id] = 1;
  return { characters, attributes, weights, asked: [], history: [], excluded: [] };
}

function applyAnswer(game, attrId, answer) {
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

function selectQuestion(game) {
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

function shareOf(game, charId) {
  let sum = 0;
  for (const id of Object.keys(game.weights)) sum += game.weights[id];
  if (sum <= 0) return 0;
  return (game.weights[charId] || 0) / sum;
}

function topGuess(game) {
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

function shouldGuess(game, { threshold = 0.85, maxQuestions = 25 } = {}) {
  const t = topGuess(game);
  if (!t) return true;
  if (game.history.length >= maxQuestions) return true;
  return t.share >= threshold;
}

function exclude(game, charId) {
  const weights = { ...game.weights };
  delete weights[charId];
  return { ...game, weights: normalize(weights), excluded: [...game.excluded, charId] };
}

function activeCount(game) {
  return Object.keys(game.weights).length;
}

function learnAttributes(game) {
  const attrs = {};
  for (const { attrId, answer } of game.history) {
    if (answer === 'yes') attrs[attrId] = true;
    else if (answer === 'no') attrs[attrId] = false;
  }
  return attrs;
}

// js/storage.js
const USER_KEY = 'akinator.userCharacters.v1';
const STATS_KEY = 'akinator.stats.v1';

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // best-effort: storage may be unavailable or full
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // best-effort: storage may be unavailable
  }
}

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

function loadUserCharacters() {
  const value = safeParse(storageGet(USER_KEY), []);
  return Array.isArray(value) ? value.filter(isValidCharacter) : [];
}

function saveUserCharacter(character) {
  const list = loadUserCharacters();
  list.push(character);
  storageSet(USER_KEY, JSON.stringify(list));
  return list;
}

function clearUserCharacters() {
  storageRemove(USER_KEY);
}

function loadStats() {
  const value = safeParse(storageGet(STATS_KEY), { games: 0, guessed: 0 });
  return { games: Number(value.games) || 0, guessed: Number(value.guessed) || 0 };
}

function saveStats(stats) {
  storageSet(
    STATS_KEY,
    JSON.stringify({ games: Number(stats.games) || 0, guessed: Number(stats.guessed) || 0 })
  );
}

// js/app.js
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
      return;
    }
    const attrId = selectQuestion(state.game);
    if (attrId) {
      state.currentAttr = ATTRIBUTES.find((a) => a.id === attrId);
      state.screen = 'asking';
      render();
      return;
    }
    advance();
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
})();
