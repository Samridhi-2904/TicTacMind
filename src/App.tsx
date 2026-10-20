import { useEffect, useRef, useState } from 'react';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import ScoreBoard from './components/ScoreBoard';
import { pickAiMove } from './logic/difficulty';
import {
  Board,
  Difficulty,
  Player,
  createEmptyBoard,
  findWinningLine,
  getGameResult,
  makeMove,
  otherPlayer,
} from './logic/gameLogic';
import { ScoredMove, chooseBestMove } from './logic/minimax';
import { EMPTY_SCORES, Scores, loadScores, saveScores } from './logic/scores';

const AI_MOVE_DELAY_MS = 450;

export default function App() {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [humanSymbol, setHumanSymbol] = useState<Player>('X');
  const [turn, setTurn] = useState<Player>('X'); // X always opens
  const [difficulty, setDifficulty] = useState<Difficulty>('unbeatable');
  const [hint, setHint] = useState<ScoredMove | null>(null);
  const [winningCells, setWinningCells] = useState<number[] | null>(null);
  const [thinking, setThinking] = useState(false);
  const [scores, setScores] = useState<Scores>(loadScores);

  const aiSymbol = otherPlayer(humanSymbol);
  const result = getGameResult(board, humanSymbol, aiSymbol);
  const gameOver = result !== 'playing';
  const humanTurn = !gameOver && !thinking && turn === humanSymbol;

  // Bumped on every new round so a delayed AI move from an old round can
  // never touch a freshly reset board.
  const gameVersionRef = useRef(0);

  // Persist scores; failures (blocked storage) are swallowed inside saveScores.
  useEffect(() => {
    saveScores(scores);
  }, [scores]);

  // Computer's turn: show "thinking" briefly, then play the algorithm's move.
  useEffect(() => {
    if (gameOver || turn !== aiSymbol) {
      setThinking(false);
      return;
    }
    setThinking(true);
    const version = gameVersionRef.current;
    const timer = window.setTimeout(() => {
      if (version !== gameVersionRef.current) return; // a new round started
      const chosen = pickAiMove(board, aiSymbol, humanSymbol, difficulty);
      setThinking(false);
      if (chosen) applyMove(chosen.index, aiSymbol);
    }, AI_MOVE_DELAY_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, turn, gameOver, aiSymbol, humanSymbol, difficulty]);

  /** Applies a legal move and resolves the round in one place. */
  function applyMove(index: number, player: Player) {
    const nextBoard = makeMove(board, index, player);
    setBoard(nextBoard);
    setHint(null); // a hint must never survive into the next position

    const line = findWinningLine(nextBoard);
    if (line) setWinningCells(line.cells);

    // The score is updated exactly once, here, at the moment the round ends.
    const nextResult = getGameResult(nextBoard, humanSymbol, aiSymbol);
    if (nextResult === 'human-win') {
      setScores((previous) => ({ ...previous, human: previous.human + 1 }));
    } else if (nextResult === 'ai-win') {
      setScores((previous) => ({ ...previous, ai: previous.ai + 1 }));
    } else if (nextResult === 'draw') {
      setScores((previous) => ({ ...previous, draws: previous.draws + 1 }));
    } else {
      setTurn(otherPlayer(player));
    }
  }

  function handleCellClick(index: number) {
    if (!humanTurn || board[index] !== null) return;
    applyMove(index, humanSymbol);
  }

  function handleShowHint() {
    if (!humanTurn) return;
    const move = chooseBestMove(board, humanSymbol, aiSymbol);
    if (!move) return;
    setHint(move);
  }

  function startNewGame() {
    gameVersionRef.current += 1;
    setBoard(createEmptyBoard());
    setTurn('X');
    setHint(null);
    setWinningCells(null);
    setThinking(false);
  }

  function handleSymbolChange(symbol: Player) {
    if (symbol === humanSymbol) return;
    setHumanSymbol(symbol);
    startNewGame(); // switching sides always begins a fresh round
  }

  function handleDifficultyChange(next: Difficulty) {
    if (next === difficulty) return;
    setDifficulty(next);
    startNewGame(); // never alter difficulty silently mid-round
  }

  function statusMessage(): string {
    if (result === 'human-win') return 'You won!';
    if (result === 'ai-win') return 'The AI won this round.';
    if (result === 'draw') return "It's a draw!";
    if (thinking) return 'Computer is thinking...';
    if (turn === aiSymbol) return 'Computer plays first — X always goes first.';
    return 'Your turn — choose a cell.';
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          TicTac<span className="title-accent">Mind</span>
        </h1>
        <p className="subtitle">The Tic-Tac-Toe AI — Minimax + Alpha-Beta Pruning</p>
      </header>

      <main className="layout">
        <section className="game-panel" aria-label="Game">
          <GameStatus message={statusMessage()} result={result} />

          <GameBoard
            board={board}
            winningCells={winningCells}
            hintIndex={hint?.index ?? null}
            disabled={gameOver || thinking || turn !== humanSymbol}
            onCellClick={handleCellClick}
          />

          <p className="hint-message" role="status" aria-live="polite">
            {hint ? 'Suggested move highlighted.' : '\u00A0'}
          </p>

          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleShowHint}
              disabled={!humanTurn}
            >
              Show Best Move
            </button>
            <button type="button" className="btn" onClick={startNewGame}>
              New Game
            </button>
          </div>
        </section>

        <aside className="sidebar">
          <GameControls
            difficulty={difficulty}
            humanSymbol={humanSymbol}
            onDifficultyChange={handleDifficultyChange}
            onSymbolChange={handleSymbolChange}
          />
          <ScoreBoard scores={scores} onReset={() => setScores({ ...EMPTY_SCORES })} />
        </aside>
      </main>
    </div>
  );
}
