import { Board, Player } from './gameLogic';

/**
 * Test helper: builds a board from a short literal so tests stay readable.
 * Use '.' for an empty cell, e.g. boardFrom('XO.XO...X').
 */
export function boardFrom(literal: string): Board {
  if (literal.length !== 9) {
    throw new Error(`Board literal must have 9 characters, got "${literal}".`);
  }
  return [...literal].map((char) => {
    if (char === '.') return null;
    if (char === 'X' || char === 'O') return char as Player;
    throw new Error(`Invalid board character "${char}".`);
  });
}
