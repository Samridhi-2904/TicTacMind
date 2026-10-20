import { useEffect, useState } from 'react';
import { Scores } from '../logic/scores';

interface ScoreBoardProps {
  scores: Scores;
  onReset: () => void;
}

/** Human / AI / draw counters with a two-step reset so scores are not
 *  cleared by a single accidental click. */
export default function ScoreBoard({ scores, onReset }: ScoreBoardProps) {
  const [confirming, setConfirming] = useState(false);

  // Revert the pending confirmation if it is not used quickly.
  useEffect(() => {
    if (!confirming) return;
    const timer = window.setTimeout(() => setConfirming(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirming]);

  function handleResetClick() {
    if (confirming) {
      onReset();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  }

  return (
    <section className="scoreboard" aria-label="Scoreboard">
      <h2>Scoreboard</h2>
      <div className="score-row">
        <span className="score-label score-human">You</span>
        <span className="score-value" data-testid="score-human">
          {scores.human}
        </span>
      </div>
      <div className="score-row">
        <span className="score-label score-ai">AI</span>
        <span className="score-value" data-testid="score-ai">
          {scores.ai}
        </span>
      </div>
      <div className="score-row">
        <span className="score-label score-draw">Draws</span>
        <span className="score-value" data-testid="score-draws">
          {scores.draws}
        </span>
      </div>
      <button
        type="button"
        className={`btn btn-quiet${confirming ? ' btn-confirm' : ''}`}
        onClick={handleResetClick}
      >
        {confirming ? 'Click again to reset' : 'Reset scores'}
      </button>
    </section>
  );
}
