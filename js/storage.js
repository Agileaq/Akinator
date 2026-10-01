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

export function loadUserCharacters() {
  const value = safeParse(storageGet(USER_KEY), []);
  return Array.isArray(value) ? value.filter(isValidCharacter) : [];
}

export function saveUserCharacter(character) {
  const list = loadUserCharacters();
  list.push(character);
  storageSet(USER_KEY, JSON.stringify(list));
  return list;
}

export function clearUserCharacters() {
  storageRemove(USER_KEY);
}

export function loadStats() {
  const value = safeParse(storageGet(STATS_KEY), { games: 0, guessed: 0 });
  return { games: Number(value.games) || 0, guessed: Number(value.guessed) || 0 };
}

export function saveStats(stats) {
  storageSet(
    STATS_KEY,
    JSON.stringify({ games: Number(stats.games) || 0, guessed: Number(stats.guessed) || 0 })
  );
}
