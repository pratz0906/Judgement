import type { RoundScore, Player } from '../../types/game';
import { calculateTotalScores } from '../../logic/scoring';

interface Props {
  scoreHistory: RoundScore[];
  players: Player[];
  currentRound: number;
}

export default function Scoreboard({ scoreHistory, players, currentRound }: Props) {
  const totals = calculateTotalScores(scoreHistory);
  const totalMap = new Map(totals.map(t => [t.playerId, t.total]));

  return (
    <div className="scoreboard" role="region" aria-label="Scoreboard">
      <table aria-label="Scores by round">
        <thead>
          <tr>
            <th scope="col">Round</th>
            {players.map(player => (
              <th key={player.id} scope="col" className="player-cell">{player.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scoreHistory.map((round, i) => (
            <tr key={i}>
              <th scope="row" className={i === currentRound - 1 ? 'round-current' : ''}>
                R{round.roundNumber}
              </th>
              {players.map(player => {
                const ps = round.playerScores.find(s => s.playerId === player.id);
                if (!ps) return <td key={player.id}>-</td>;
                const hit = ps.bid === ps.tricksWon;
                return (
                  <td key={player.id} className={hit ? 'score-hit' : 'score-miss'}>
                    {ps.roundPoints}
                    <small className="bid-info"> ({ps.tricksWon}/{ps.bid})</small>
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="total-row">
            <th scope="row" className="total-col">Total</th>
            {players.map(player => (
              <td key={player.id} className="total-col">{totalMap.get(player.id) ?? 0}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
