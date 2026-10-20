import { Board } from '../logic/gameLogic';
import GameCell from './GameCell';

interface GameBoardProps {
  board: Board;
  winningCells: number[] | null;
  hintIndex: number | null;
  disabled: boolean;
  onCellClick: (index: number) => void;
}

/** The 3x3 board. Exactly nine cells, rendered from the game state. */
export default function GameBoard({
  board,
  winningCells,
  hintIndex,
  disabled,
  onCellClick,
}: GameBoardProps) {
  return (
    <div className="board" aria-label="Tic-Tac-Toe board">
      {board.map((value, index) => (
        <GameCell
          key={index}
          index={index}
          value={value}
          isWinning={winningCells?.includes(index) ?? false}
          isHint={hintIndex === index}
          // Occupied cells are disabled so an existing symbol can never be
          // overwritten; the whole board is disabled while the AI plays or
          // after the round ends.
          disabled={disabled || value !== null}
          onSelect={onCellClick}
        />
      ))}
    </div>
  );
}
