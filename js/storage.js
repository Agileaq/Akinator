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
