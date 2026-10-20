import { Difficulty, Player } from '../logic/gameLogic';

interface GameControlsProps {
  difficulty: Difficulty;
  humanSymbol: Player;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onSymbolChange: (symbol: Player) => void;
}

/**
 * Difficulty and player-symbol selectors.
 * Changing either one starts a fresh round, so options are never changed
 * silently in the middle of a game.
 */
export default function GameControls({
  difficulty,
  humanSymbol,
  onDifficultyChange,
  onSymbolChange,
}: GameControlsProps) {
  return (
    <div className="controls">
      <div className="control-group">
        <span className="control-label" id="difficulty-label">
          Difficulty
        </span>
        <div className="segmented" role="group" aria-labelledby="difficulty-label">
          <button
            type="button"
            className={`segment${difficulty === 'easy' ? ' segment-active' : ''}`}
            aria-pressed={difficulty === 'easy'}
            onClick={() => onDifficultyChange('easy')}
          >
            Easy
          </button>
          <button
            type="button"
            className={`segment${difficulty === 'unbeatable' ? ' segment-active' : ''}`}
            aria-pressed={difficulty === 'unbeatable'}
            onClick={() => onDifficultyChange('unbeatable')}
          >
            Unbeatable
          </button>
        </div>
        <p className="control-note">
          {difficulty === 'easy'
            ? 'Easy mode is beatable — the AI sometimes plays a weaker move.'
            : 'Unbeatable mode searches optimally — it cannot be forced to lose.'}
        </p>
      </div>

      <div className="control-group">
        <span className="control-label" id="symbol-label">
          Play as
        </span>
        <div className="segmented" role="group" aria-labelledby="symbol-label">
          <button
            type="button"
            className={`segment${humanSymbol === 'X' ? ' segment-active' : ''}`}
            aria-pressed={humanSymbol === 'X'}
            onClick={() => onSymbolChange('X')}
          >
            ✕ X
          </button>
          <button
            type="button"
            className={`segment${humanSymbol === 'O' ? ' segment-active' : ''}`}
            aria-pressed={humanSymbol === 'O'}
            onClick={() => onSymbolChange('O')}
          >
            ◯ O
          </button>
        </div>
      </div>

      <p className="control-note">
        Changing difficulty or symbol starts a fresh round.
      </p>
    </div>
  );
}
