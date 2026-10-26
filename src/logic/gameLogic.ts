/**
 * Pure Tic-Tac-Toe game rules.
 *
 * Nothing in this file knows about React or the DOM: the board is an ordinary
 * array, so every function here can be unit-tested on its own.
 *
 * Board layout (index mapping used everywhere in the project):
 *
 *   0 | 1 | 2
 *   ---------
 *   3 | 4 | 5
 *   ---------
 *   6 | 7 | 8
 */

export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Board = Cell[];
export type Difficulty = 'easy' | 'unbeatable';

/** "playing" = round in progress; the other three are final results. */
export type GameResult = 'playing' | 'human-win' | 'ai-win' | 'draw';

export const BOARD_SIZE = 9;

/** The only eight winning lines in Tic-Tac-Toe, defined once and reused. */
export const WINNING_COMBINATIONS: readonly number[][] = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // columns
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonals
  [2, 4, 6],
];

export function createEmptyBoard(): Board {
  return Array<Cell>(BOARD_SIZE).fill(null);
}

export function otherPlayer(player: Player): Player {
  return player === 'X' ? 'O' : 'X';
}

/** A move is legal when the cell exists and is empty. */
export function isValidMove(board: Board, index: number): boolean {
  return index >= 0 && index < BOARD_SIZE && board[index] === null;
}

/**
 * Returns the winning line if one exists.
 *
 * Kept as a single function so the winner check and the winning-line
 * highlight always agree — the UI highlights exactly what this returns.
 */
export function findWinningLine(
  board: Board,
): { player: Player; cells: number[] } | null {
  for (const cells of WINNING_COMBINATIONS) {
    const [a, b, c] = cells;
    const symbol = board[a];
    if (symbol !== null && symbol === board[b] && symbol === board[c]) {
      return { player: symbol, cells: [...cells] };
    }
  }
  return null;
}

/** Returns 'X' or 'O' if that player has completed a line, otherwise null. */
export function checkWinner(board: Board): Player | null {
  return findWinningLine(board)?.player ?? null;
}

/** All indices of empty cells. Empty array when the board is full. */
export function getAvailableMoves(board: Board): number[] {
  const moves: number[] = [];
  for (let index = 0; index < BOARD_SIZE; index += 1) {
    if (board[index] === null) moves.push(index);
  }
  return moves;
}

export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Returns a NEW board with `player` placed at `index`.
 * Throws on an illegal move so bugs surface immediately in development.
 */
export function makeMove(board: Board, index: number, player: Player): Board {
  if (!isValidMove(board, index)) {
    throw new Error(`Invalid move: cell ${index} is not playable.`);
  }
  const next = [...board];
  next[index] = player;
  return next;
}

/**
 * Derives the current result of a round from the board, so there is never a
 * second, conflicting "winner" variable to drift out of sync.
 * A win is always checked before a draw.
 */
export function getGameResult(
  board: Board,
  humanPlayer: Player,
  aiPlayer: Player,
): GameResult {
  const winner = checkWinner(board);
  if (winner === aiPlayer) return 'ai-win';
  if (winner === humanPlayer) return 'human-win';
  if (isBoardFull(board)) return 'draw';
  return 'playing';
}

/** Human-readable cell names, used for accessible labels and hints. */
export const CELL_NAMES: readonly string[] = [
  'top-left',
  'top-center',
  'top-right',
  'middle-left',
  'center',
  'middle-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];
