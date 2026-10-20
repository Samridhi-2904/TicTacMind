import { GameResult } from '../logic/gameLogic';

interface GameStatusProps {
  message: string;
  result: GameResult;
}

/**
 * Current game status. Announced politely to screen readers and styled by
 * result — but the text always says what is happening, so colour is never
 * the only signal.
 */
export default function GameStatus({ message, result }: GameStatusProps) {
  const toneClass =
    result === 'human-win'
      ? 'status-win'
      : result === 'ai-win'
        ? 'status-lose'
        : result === 'draw'
          ? 'status-draw'
          : 'status-playing';

  return (
    <p className={`status ${toneClass}`} role="status" aria-live="polite">
      {message}
    </p>
  );
}
