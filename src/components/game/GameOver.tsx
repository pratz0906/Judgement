import { useGame } from '../../context/GameContext';
import type { Player } from '../../types/game';
import { calculateTotalScores } from '../../logic/scoring';
import Scoreboard from '../shared/Scoreboard';

export default function GameOver() {
  const { state, dispatch } = useGame();
  const totals = calculateTotalScores(state.scoreHistory);
  const winner = state.players.find((p: Player) => p.id === totals[0]?.playerId);

  return (
    <div className="game-over" role="region" aria-label="Game over results">
      <h1>Game Over!</h1>
      <div className="winner-banner" role="status" aria-live="polite">
        <h2>{winner?.name === 'You' ? 'You win!' : `${winner?.name} wins!`}</h2>
        <p className="winner-score">{totals[0]?.total} points</p>
      </div>
      <div className="final-standings">
        <h3>Final Standings</h3>
        <ol className="standings-list" aria-label="Final standings">
          {totals.map((t, i) => {
            const player = state.players.find((p: Player) => p.id === t.playerId);
            return (
              <li key={t.playerId} className={i === 0 ? 'first-place' : ''}>
                <span className="standing-name">{player?.name}</span>
                <span className="standing-score">{t.total} pts</span>
              </li>
            );
          })}
        </ol>
      </div>
      <Scoreboard
        scoreHistory={state.scoreHistory}
        players={state.players}
        currentRound={state.scoreHistory.length}
      />
      <button className="restart-btn" onClick={() => dispatch({ type: 'RESTART' })}>
        Play Again
      </button>
    </div>
  );
}
