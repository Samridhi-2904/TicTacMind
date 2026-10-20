import { CELL_NAMES, Cell, Player } from '../logic/gameLogic';

const MARKS: Record<Player, string> = { X: '✕', O: '◯' };

interface GameCellProps {
  index: number;
  value: Cell;
  isWinning: boolean;
  isHint: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
}

/**
 * A single board square, rendered as a real <button> so it is reachable and
 * operable with the keyboard and assistive technology.
 */
export default function GameCell({
  index,
  value,
  isWinning,
  isHint,
  disabled,
  onSelect,
}: GameCellProps) {
  const label = [
    `${CELL_NAMES[index]} cell`,
    value ? `contains ${value}` : 'empty',
    isHint ? 'suggested move' : null,
    isWinning ? 'part of the winning line' : null,
  ]
    .filter(Boolean)
    .join(', ');

  const classes = [
    'cell',
    value === 'X' ? 'cell-x' : value === 'O' ? 'cell-o' : '',
    isWinning ? 'cell-win' : '',
    isHint ? 'cell-hint' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={() => onSelect(index)}
      disabled={disabled}
      aria-label={label}
    >
      {value ? (
        <span className="cell-mark" aria-hidden="true">
          {MARKS[value]}
        </span>
      ) : null}
      {isHint ? <span className="cell-hint-dot" aria-hidden="true" /> : null}
      {isWinning ? <span className="cell-win-badge" aria-hidden="true">✓</span> : null}
    </button>
  );
}
