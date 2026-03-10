import { useGame } from '../../context/GameContext';
import type { Player, PlayerRoundScore } from '../../types/game';
import Scoreboard from '../shared/Scoreboard';

export default function RoundResult() {
  const { state, dispatch } = useGame();
  const lastRound = state.scoreHistory[state.scoreHistory.length - 1];

  return (
    <div className="round-result" role="region" aria-label="Round results">
      <h2 aria-live="polite">Round {lastRound.roundNumber} Complete!</h2>
      <div className="round-summary">
        <table className="result-table" aria-label="Round scores">
          <thead>
            <tr>
              <th scope="col">Player</th>
              <th scope="col">Bid</th>
              <th scope="col">Won</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {lastRound.playerScores.map((ps: PlayerRoundScore) => {
              const player = state.players.find((p: Player) => p.id === ps.playerId);
              const hit = ps.bid === ps.tricksWon;
              return (
                <tr key={ps.playerId} className={hit ? 'score-hit' : 'score-miss'}>
                  <th scope="row">{player?.name}</th>
                  <td>{ps.bid}</td>
                  <td>{ps.tricksWon}</td>
                  <td className="points-cell">
                    {ps.roundPoints > 0 ? `+${ps.roundPoints}` : ps.roundPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Scoreboard scoreHistory={state.scoreHistory} players={state.players} currentRound={lastRound.roundNumber} />
      <button className="next-btn" onClick={() => dispatch({ type: 'NEXT_ROUND' })}>
        {state.currentRoundIndex + 1 >= state.roundStructure.length ? 'See Final Results' : 'Next Round'}
      </button>
    </div>
  );
}
