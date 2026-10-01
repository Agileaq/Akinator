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
