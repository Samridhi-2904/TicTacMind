/**
 * Difficulty policy — kept separate from the Minimax core so the algorithm
 * itself stays simple and untouched by "weakness".
 *
 * Unbeatable: always the optimal Alpha-Beta move. No deliberate mistakes.
 * Easy:       50% optimal move, 50% a uniformly random *legal* move, so the
 *             computer can be beaten but still never breaks the rules.
 */

import { Board, Player, getAvailableMoves, makeMove } from './gameLogic';
import { ScoredMove, chooseBestMove, minimaxAlphaBeta } from './minimax';

const RANDOM_MOVE_CHANCE = 0.5;

function randomMove(board: Board): number | null {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Chooses the computer's next move for the given difficulty.
 * The returned score always describes the move that was actually chosen,
 * so the info panel never reports a misleading value.
 * Returns null when no legal move exists (round already over).
 */
export function pickAiMove(
  board: Board,
  aiPlayer: Player,
  humanPlayer: Player,
  difficulty: 'easy' | 'unbeatable',
): ScoredMove | null {
  const best = chooseBestMove(board, aiPlayer, humanPlayer);
  if (best === null) return null;
  if (difficulty === 'unbeatable') return best;

  // Easy mode.
  if (Math.random() < RANDOM_MOVE_CHANCE) return best;

  const index = randomMove(board);
  if (index === null) return null;
  const score = minimaxAlphaBeta(
    makeMove(board, index, aiPlayer),
    humanPlayer,
    aiPlayer,
    humanPlayer,
    -Infinity,
    Infinity,
    1,
  );
  return { index, score };
}
