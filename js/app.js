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
