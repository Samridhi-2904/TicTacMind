import { describe, expect, it } from 'vitest';
import { boardFrom } from './testHelpers';
import {
  Board,
  Player,
  getAvailableMoves,
  getGameResult,
  makeMove,
} from './gameLogic';
import {
  chooseBestMove,
  getBestHint,
  getBestMove,
  minimax,
  minimaxAlphaBeta,
} from './minimax';

describe('tactical move selection', () => {
  it('TEST 9: the AI takes an immediate winning move (AI = X)', () => {
    // X can complete the top row by playing index 2.
    expect(getBestMove(boardFrom('XX.OO....'), 'X', 'O')).toBe(2);
  });

  it('TEST 9: the AI takes an immediate winning move (AI = O)', () => {
    expect(getBestMove(boardFrom('OO.XX....'), 'O', 'X')).toBe(2);
    expect(getBestMove(boardFrom('...OO....'), 'O', 'X')).toBe(5);
  });

  it('TEST 10: the AI blocks an immediate human win (AI = O)', () => {
    // X threatens index 2, so O must play 2.
    expect(getBestMove(boardFrom('XX..O....'), 'O', 'X')).toBe(2);
  });

  it('TEST 10: the AI blocks an immediate human win (AI = X)', () => {
    // O threatens index 6, so X must play 6.
    expect(getBestMove(boardFrom('X.O.O..O.'), 'X', 'O')).toBe(6);
  });

  it('TEST 11: the AI never chooses an occupied cell', () => {
    const positions = [
      'X.O..X.O.',
      'XX..O..O.',
      '.X.OXO..X',
      'XOOX.X...',
      'OX.XOX.O.',
      'X.X.O.O.O',
    ];
    for (const literal of positions) {
      const board = boardFrom(literal);
      for (const [ai, human] of [
        ['X', 'O'],
        ['O', 'X'],
      ] as const) {
        const move = getBestMove(board, ai, human);
        if (move !== null) {
          expect(board[move]).toBeNull();
        }
      }
    }
  });

  it('TEST 12 / 23: no move is returned once the round is over', () => {
    // Win on the board (empty cells remain) and a full board both return null.
    expect(getBestMove(boardFrom('XXX.O....'), 'O', 'X')).toBeNull();
    expect(getBestMove(boardFrom('XOXOOXXOX'), 'X', 'O')).toBeNull();
    expect(getBestHint(boardFrom('XOXOOXXOX'), 'X', 'O')).toBeNull();
    expect(chooseBestMove(boardFrom('XXX.O....'), 'O', 'X')).toBeNull();
  });

  it('prefers a fast win over a slow win (depth-aware scoring)', () => {
    // X can win immediately at index 2; a slower win would score less.
    const board = boardFrom('XX.....O.');
    const move = getBestMove(board, 'X', 'O');
    expect(move).toBe(2);
  });
});

describe('move hints', () => {
  it('TEST 13: the hint always identifies an empty cell', () => {
    const positions = ['X.O..X.O.', 'XX..O..O.', '.X.OXO..X', 'XOOX.X...'];
    for (const literal of positions) {
      const board = boardFrom(literal);
      const hint = getBestHint(board, 'X', 'O');
      expect(hint).not.toBeNull();
      expect(board[hint as number]).toBeNull();
    }
  });

  it('TEST 13: the hint recommends an immediate human win', () => {
    // Human X can win at index 2, and must not be lured elsewhere.
    expect(getBestHint(boardFrom('XX..O....'), 'X', 'O')).toBe(2);
  });

  it('TEST 13: the hint recommends blocking an immediate AI win', () => {
    expect(getBestHint(boardFrom('OO..X....'), 'X', 'O')).toBe(2);
  });

  it('TEST 14: requesting a hint never modifies the board', () => {
    const board = boardFrom('X.O..X.O.');
    const copy = [...board];
    getBestHint(board, 'X', 'O');
    expect(board).toEqual(copy);
  });
});

describe('alpha-beta pruning matches plain minimax', () => {
  const positions = [
    '.........',
    'X........',
    'X.O..X.O.',
    'XX..O..O.',
    '.X.OXO..X',
    'XOOX.X...',
    'OX.XOX.O.',
    'X.X.O.O.O',
  ];

  it('TEST 22: identical scores for every position and player', () => {
    const roles: readonly (readonly [Player, Player])[] = [
      ['X', 'O'],
      ['O', 'X'],
    ];
    for (const literal of positions) {
      const board = boardFrom(literal);
      for (const [ai, human] of roles) {
        for (const turn of ['X', 'O'] as const) {
          const plain = minimax(board, turn, ai, human, 0);
          const pruned = minimaxAlphaBeta(board, turn, ai, human, -Infinity, Infinity, 0);
          expect(pruned).toBe(plain);
        }
      }
    }
  });

  it('TEST 22: the root score from the pruned search equals the plain minimax value', () => {
    for (const literal of positions) {
      const board = boardFrom(literal);
      const chosen = chooseBestMove(board, 'X', 'O');
      if (chosen === null) continue;
      expect(chosen.score).toBe(minimax(board, 'X', 'X', 'O', 0));
    }
  });
});

describe('unbeatable AI (exhaustive)', () => {
  /**
   * Explores every legal game against the AI. The human tries every
   * possible reply at every position; the AI always plays its single best
   * move. Returns true only if the human can force a win somewhere.
   */
  function humanCanForceWin(
    board: Board,
    turn: Player,
    ai: Player,
    human: Player,
  ): boolean {
    const result = getGameResult(board, human, ai);
    if (result === 'human-win') return true;
    if (result !== 'playing') return false;

    if (turn === human) {
      for (const index of getAvailableMoves(board)) {
        if (humanCanForceWin(makeMove(board, index, human), ai, ai, human)) {
          return true;
        }
      }
      return false;
    }

    const best = chooseBestMove(board, ai, human);
    expect(best).not.toBeNull();
    return humanCanForceWin(makeMove(board, best!.index, ai), human, ai, human);
  }

  it('TEST 21: the AI cannot be forced to lose as X', () => {
    expect(humanCanForceWin(boardFrom('.........'), 'X', 'X', 'O')).toBe(false);
  });

  it('TEST 21: the AI cannot be forced to lose as O', () => {
    expect(humanCanForceWin(boardFrom('.........'), 'X', 'O', 'X')).toBe(false);
  });

  /** A deliberately naive opponent: win if possible, else first empty cell. */
  function playNaiveHuman(start: Board, ai: Player, human: Player): string {
    let board = start;
    let turn: Player = 'X';
    for (let ply = 0; ply < 9; ply += 1) {
      const result = getGameResult(board, human, ai);
      if (result !== 'playing') return result;

      let index: number | null = null;
      if (turn === human) {
        for (const candidate of getAvailableMoves(board)) {
          const next = makeMove(board, candidate, human);
          if (getGameResult(next, human, ai) === 'human-win') {
            index = candidate;
            break;
          }
        }
        if (index === null) index = getAvailableMoves(board)[0];
      } else {
        const best = chooseBestMove(board, ai, human);
        if (best === null) break;
        index = best.index;
      }
      board = makeMove(board, index, turn);
      turn = turn === 'X' ? 'O' : 'X';
    }
    return getGameResult(board, human, ai);
  }

  it('TEST 21: the AI beats a careless opponent with either symbol', () => {
    expect(playNaiveHuman(boardFrom('.........'), 'O', 'X')).toBe('ai-win');
    expect(playNaiveHuman(boardFrom('.........'), 'X', 'O')).toBe('ai-win');
  });
});
