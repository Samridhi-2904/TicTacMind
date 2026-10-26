import { describe, expect, it } from 'vitest';
import { boardFrom } from './testHelpers';
import {
  Board,
  createEmptyBoard,
  getAvailableMoves,
  getGameResult,
  makeMove,
} from './gameLogic';
import { pickAiMove } from './difficulty';
import { isGameOver } from './minimax';

/** Builds a random but legal position by playing random legal moves. */
function randomBoard(): Board {
  let board = createEmptyBoard();
  const plies = Math.floor(Math.random() * 9);
  let turn: 'X' | 'O' = 'X';
  for (let ply = 0; ply < plies; ply += 1) {
    if (getGameResult(board, 'X', 'O') !== 'playing') break;
    const moves = getAvailableMoves(board);
    board = makeMove(board, moves[Math.floor(Math.random() * moves.length)], turn);
    turn = turn === 'X' ? 'O' : 'X';
  }
  return board;
}

describe('easy difficulty', () => {
  it('TEST 20: easy mode always makes a legal move', () => {
    for (let trial = 0; trial < 500; trial += 1) {
      const board = randomBoard();
      const move = pickAiMove(board, 'O', 'X', 'easy');
      if (move === null) {
        // Null only means the round is already over (win or full board).
        expect(isGameOver(board)).toBe(true);
      } else {
        expect(board[move.index]).toBeNull();
      }
    }
  });

  it('easy mode does vary its play (randomness exists but is controlled)', () => {
    const seen = new Set<number>();
    for (let trial = 0; trial < 200; trial += 1) {
      const move = pickAiMove(createEmptyBoard(), 'X', 'O', 'easy');
      expect(move).not.toBeNull();
      seen.add(move!.index);
    }
    // The optimal-only line could not produce more than a few distinct moves.
    expect(seen.size).toBeGreaterThan(2);
  });
});

describe('unbeatable difficulty', () => {
  it('always returns the optimal move — no random mistakes', () => {
    const board = boardFrom('XX..O....'); // O must block at index 2
    for (let trial = 0; trial < 100; trial += 1) {
      expect(pickAiMove(board, 'O', 'X', 'unbeatable')?.index).toBe(2);
    }
  });

  it('returns null when no legal move exists', () => {
    const full = boardFrom('XOXOOXXOX');
    expect(pickAiMove(full, 'X', 'O', 'unbeatable')).toBeNull();
    expect(pickAiMove(full, 'X', 'O', 'easy')).toBeNull();
  });
});
