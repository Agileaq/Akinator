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

export function learnAttributes(game) {
  const attrs = {};
  for (const { attrId, answer } of game.history) {
    if (answer === 'yes') attrs[attrId] = true;
    else if (answer === 'no') attrs[attrId] = false;
  }
  return attrs;
}
