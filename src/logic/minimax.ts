/**
 * Minimax with (and without) Alpha-Beta Pruning for Tic-Tac-Toe.
 *
 * The AI is the maximizing player and the human is the minimizing player.
 * Scoring convention (depth-aware, so the AI prefers fast wins and slow losses):
 *
 *   AI wins        ->  10 - depth
 *   Human wins     -> -10 + depth
 *   Draw           ->   0
 *
 * The search never touches React state: it only receives plain boards.
 */

import {
  Board,
  Player,
  checkWinner,
  getAvailableMoves,
  isBoardFull,
  makeMove,
} from './gameLogic';

/** A position is finished when someone has completed a line or the board is full. */
export function isGameOver(board: Board): boolean {
  return checkWinner(board) !== null || isBoardFull(board);
}

export const AI_WIN_SCORE = 10;
export const HUMAN_WIN_SCORE = -10;

/**
 * Search order used both for tie-breaking and to help Alpha-Beta prune:
 * center first, then corners, then edges. It is fully deterministic, so
 * Unbeatable mode never relies on randomness.
 */
const MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];

function orderedMoves(board: Board): number[] {
  const empty = new Set(getAvailableMoves(board));
  return MOVE_ORDER.filter((index) => empty.has(index));
}

/**
 * Score of a finished position, or null when the game can still continue.
 * A win is checked before a draw, so a full board with a winner is a win.
 */
function terminalScore(
  board: Board,
  aiPlayer: Player,
  depth: number,
): number | null {
  const winner = checkWinner(board);
  if (winner === aiPlayer) return AI_WIN_SCORE - depth;
  if (winner !== null) return HUMAN_WIN_SCORE + depth;
  if (isBoardFull(board)) return 0;
  return null;
}

/**
 * Plain Minimax.
 *
 * Recursion idea: at a terminal cell of the game tree we return a fixed
 * score. Otherwise we try every legal move for `currentPlayer`, recurse one
 * level deeper, and keep the maximum score when the AI is to move (it wants
 * the best outcome) or the minimum score when the human is to move (it
 * assumes the human also plays well).
 */
export function minimax(
  board: Board,
  currentPlayer: Player,
  aiPlayer: Player,
  humanPlayer: Player,
  depth: number,
): number {
  const terminal = terminalScore(board, aiPlayer, depth);
  if (terminal !== null) return terminal;

  const maximizing = currentPlayer === aiPlayer;
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const index of orderedMoves(board)) {
    const nextBoard = makeMove(board, index, currentPlayer);
    const score = minimax(
      nextBoard,
      maximizing ? humanPlayer : aiPlayer,
      aiPlayer,
      humanPlayer,
      depth + 1,
    );
    bestScore = maximizing
      ? Math.max(bestScore, score)
      : Math.min(bestScore, score);
  }

  return bestScore;
}

/**
 * Minimax with Alpha-Beta Pruning.
 *
 * alpha = best score the maximizer can guarantee so far.
 * beta  = best score the minimizer can guarantee so far.
 *
 * If a branch can no longer influence its ancestor (alpha >= beta) we stop
 * exploring it — the final best score stays exactly the same as plain
 * Minimax, just fewer positions are evaluated.
 */
export function minimaxAlphaBeta(
  board: Board,
  currentPlayer: Player,
  aiPlayer: Player,
  humanPlayer: Player,
  alpha: number,
  beta: number,
  depth: number,
): number {
  const terminal = terminalScore(board, aiPlayer, depth);
  if (terminal !== null) return terminal;

  const maximizing = currentPlayer === aiPlayer;
  let bestScore = maximizing ? -Infinity : Infinity;

  for (const index of orderedMoves(board)) {
    const nextBoard = makeMove(board, index, currentPlayer);
    const score = minimaxAlphaBeta(
      nextBoard,
      maximizing ? humanPlayer : aiPlayer,
      aiPlayer,
      humanPlayer,
      alpha,
      beta,
      depth + 1,
    );

    if (maximizing) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore);
    }

    // Prune: this branch can no longer change the decision at this node.
    if (alpha >= beta) break;
  }

  return bestScore;
}

export interface ScoredMove {
  index: number;
  score: number;
}

/**
 * Picks the best move for `maximizingPlayer` using Alpha-Beta Pruning.
 *
 * This one function serves both purposes in the app:
 *   - the AI calls it with (aiPlayer, humanPlayer)
 *   - the hint system calls it with (humanPlayer, aiPlayer)
 *
 * Equal-scoring moves are resolved by the fixed move ordering, so the
 * choice is consistent — no randomness, and never an inferior move.
 * Returns null when no legal move exists.
 */
export function chooseBestMove(
  board: Board,
  maximizingPlayer: Player,
  minimizingPlayer: Player,
): ScoredMove | null {
  // Never return a move for a finished round.
  if (isGameOver(board)) return null;

  const moves = orderedMoves(board);
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;

  for (const index of moves) {
    const nextBoard = makeMove(board, index, maximizingPlayer);
    const score = minimaxAlphaBeta(
      nextBoard,
      minimizingPlayer,
      maximizingPlayer,
      minimizingPlayer,
      alpha,
      Infinity,
      1,
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
    // Root acts as a maximizing node: keep alpha in sync so that later
    // siblings can be pruned too.
    alpha = Math.max(alpha, bestScore);
  }

  return { index: bestMove, score: bestScore };
}

/** Optimal move for the AI, or null if the round is already over. */
export function getBestMove(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
): number | null {
  return chooseBestMove(board, aiPlayer, humanPlayer)?.index ?? null;
}

/** Optimal move for the HUMAN — used by the "Show Best Move" hint. */
export function getBestHint(
  board: Board,
  humanPlayer: Player,
  aiPlayer: Player,
): number | null {
  return chooseBestMove(board, humanPlayer, aiPlayer)?.index ?? null;
}
