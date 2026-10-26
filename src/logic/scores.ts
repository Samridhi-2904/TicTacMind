/**
 * Scoreboard persistence.
 *
 * Scores are kept in localStorage so they survive a page reload, but the game
 * must still work when storage is unavailable (private mode, disabled storage,
 * invalid JSON from an older version). Every read is validated and every write
 * is wrapped, so failures can never break the game.
 */

export interface Scores {
  human: number;
  ai: number;
  draws: number;
}

export const EMPTY_SCORES: Scores = { human: 0, ai: 0, draws: 0 };

const STORAGE_KEY = 'tictacmind.scores.v1';

function toCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

export function loadScores(): Scores {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SCORES };
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { ...EMPTY_SCORES };
    const record = parsed as Record<string, unknown>;
    return {
      human: toCount(record.human),
      ai: toCount(record.ai),
      draws: toCount(record.draws),
    };
  } catch {
    // Storage missing, blocked, or corrupt JSON — start from zero scores.
    return { ...EMPTY_SCORES };
  }
}

export function saveScores(scores: Scores): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Storage unavailable: scores simply do not persist for this session.
  }
}
