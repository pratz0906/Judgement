/**
 * History screen: shows a table of the last 10 games for the current player.
 * Displays date, players, rounds, score, result, and bid success rate.
 */

import { useGame } from '../../context/GameContext';
import { getRecentGames } from '../../utils/storage';

export default function HistoryScreen() {
  const { state, navigateTo } = useGame();

  const humanPlayer = state.players.find(p => !p.isBot);
  const playerName = humanPlayer?.name ?? 'You';

  const games = getRecentGames(playerName, 10);

  return (
    <div className="history-screen">
      <h1>Game History</h1>
      <p className="stats-player-name">{playerName} — Last 10 Games</p>

      {games.length === 0 ? (
        <p className="no-data">No games played yet. Play a game to see your history!</p>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Players</th>
                <th>Rounds</th>
                <th>Score</th>
                <th>Result</th>
                <th>Bid Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {games.map(game => {
                const successfulBids = game.rounds.filter(r => r.bid === r.tricksWon).length;
                const bidAccuracy = game.rounds.length > 0
                  ? ((successfulBids / game.rounds.length) * 100).toFixed(0)
                  : '0';
                const dateStr = new Date(game.date).toLocaleDateString();

                return (
                  <tr key={game.id} className={game.won ? 'history-win' : 'history-loss'}>
                    <td>{dateStr}</td>
                    <td>{game.playerCount}</td>
                    <td>{game.totalRounds}</td>
                    <td>{game.finalScore}</td>
                    <td>{game.won ? 'Won' : 'Lost'}</td>
                    <td>{successfulBids}/{game.rounds.length} ({bidAccuracy}%)</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="stats-actions">
        <button className="back-btn" onClick={() => navigateTo('game')}>Back</button>
      </div>
    </div>
  );
}
