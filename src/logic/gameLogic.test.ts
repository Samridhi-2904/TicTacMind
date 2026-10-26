import { describe, expect, it } from 'vitest';
import { boardFrom } from './testHelpers';
import {
  createEmptyBoard,
  findWinningLine,
  getAvailableMoves,
  getGameResult,
  isBoardFull,
  isValidMove,
  makeMove,
  checkWinner,
} from './gameLogic';

const HUMAN = 'X' as const;
const AI = 'O' as const;

describe('winner detection', () => {
  it('TEST 1: an empty board has no winner and is not a draw', () => {
    const board = createEmptyBoard();
    expect(checkWinner(board)).toBeNull();
    expect(isBoardFull(board)).toBe(false);
    expect(getGameResult(board, HUMAN, AI)).toBe('playing');
  });

  it('TEST 2: a completed row identifies the winner', () => {
    expect(checkWinner(boardFrom('XXX.OO...'))).toBe('X');
    expect(checkWinner(boardFrom('...XXX.OO'))).toBe('X');
    expect(checkWinner(boardFrom('OOO.XX...'))).toBe('O');
  });

  it('TEST 3: a completed column identifies the winner', () => {
    expect(checkWinner(boardFrom('X..X..X..'))).toBe('X');
    expect(checkWinner(boardFrom('.X..X..X.'))).toBe('X');
    expect(checkWinner(boardFrom('X.O..O..O'))).toBe('O');
  });

  it('TEST 4: both diagonals identify the winner', () => {
    expect(checkWinner(boardFrom('X...X...X'))).toBe('X');
    expect(checkWinner(boardFrom('..X.X.X..'))).toBe('X');
  });

  it('TEST 5: a board with no winner and empty cells is not a draw', () => {
    const board = boardFrom('XOX.O....');
    expect(checkWinner(board)).toBeNull();
    expect(isBoardFull(board)).toBe(false);
    expect(getGameResult(board, HUMAN, AI)).toBe('playing');
  });

  it('TEST 6: a full board with no winner is a draw', () => {
    const board = boardFrom('XOXXOOOXX');
    expect(checkWinner(board)).toBeNull();
    expect(isBoardFull(board)).toBe(true);
    expect(getGameResult(board, HUMAN, AI)).toBe('draw');
  });

  it('returns the winning cells used for the highlight', () => {
    const line = findWinningLine(boardFrom('X..X..X..'));
    expect(line).toEqual({ player: 'X', cells: [0, 3, 6] });
  });

  it('TEST 8: a decided round is never reported as still playing', () => {
    expect(getGameResult(boardFrom('XXX.OO...'), HUMAN, AI)).toBe('human-win');
    expect(getGameResult(boardFrom('OOO.XX...'), HUMAN, AI)).toBe('ai-win');
    expect(getGameResult(boardFrom('XOXXOOOXX'), HUMAN, AI)).toBe('draw');
  });
});

describe('moves', () => {
  it('TEST 7: a player cannot overwrite an occupied cell', () => {
    const board = boardFrom('X........');
    expect(isValidMove(board, 0)).toBe(false);
    expect(() => makeMove(board, 0, 'O')).toThrow(/Invalid move/);
    // The original board is untouched after the rejected move.
    expect(board[0]).toBe('X');
  });

  it('makeMove returns a new board without mutating the old one', () => {
    const board = createEmptyBoard();
    const next = makeMove(board, 4, 'O');
    expect(next[4]).toBe('O');
    expect(board[4]).toBeNull();
    expect(next).not.toBe(board);
  });

  it('getAvailableMoves returns every empty index, or none when full', () => {
    expect(getAvailableMoves(createEmptyBoard())).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(getAvailableMoves(boardFrom('X.OXOXXOX'))).toEqual([1]);
    expect(getAvailableMoves(boardFrom('XOXXOOOXX'))).toEqual([]);
  });
});
