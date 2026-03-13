/**
 * Stats screen: displays aggregate statistics for the player across all games.
 * Shows 8 key metrics — win/loss rates, hand rates, averages, and bid accuracy.
 */

import { useGame } from '../../context/GameContext';
import { getGameRecords } from '../../utils/storage';
import { calculatePlayerStats } from '../../logic/stats';
import { clearGameRecords } from '../../utils/storage';

function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export default function StatsScreen() {
  const { state, navigateTo } = useGame();

  // Determine the human player name from current game state, or fall back to 'You'
  const humanPlayer = state.players.find(p => !p.isBot);
  const playerName = humanPlayer?.name ?? 'You';

  const records = getGameRecords(playerName);
  const stats = calculatePlayerStats(records);

  const handleClearStats = () => {
    if (window.confirm('Are you sure you want to clear all game history and stats? This cannot be undone.')) {
      clearGameRecords();
      navigateTo('game');
    }
  };

  return (
    <div className="stats-screen">
      <h1>Player Stats</h1>
      <p className="stats-player-name">{playerName}</p>

      {stats.gamesPlayed === 0 ? (
        <p className="no-data">No games played yet. Play a game to see your stats!</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Game Win Rate</div>
            <div className="stat-value">{stats.gamesWon}/{stats.gamesPlayed}</div>
            <div className="stat-pct">({pct(stats.winRate)})</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Game Loss Rate</div>
            <div className="stat-value">{stats.gamesLost}/{stats.gamesPlayed}</div>
            <div className="stat-pct">({pct(stats.lossRate)})</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Won Hands</div>
            <div className="stat-value">{stats.handsWon}/{stats.totalHands}</div>
            <div className="stat-pct">({pct(stats.wonHandsRate)})</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Lost Hands</div>
            <div className="stat-value">{stats.handsLost}/{stats.totalHands}</div>
            <div className="stat-pct">({pct(stats.lostHandsRate)})</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Score (You)</div>
            <div className="stat-value">{stats.avgScore.toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Score (Others)</div>
            <div className="stat-value">{stats.avgOtherScore.toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Successful Bids</div>
            <div className="stat-value">{stats.successfulBids}/{stats.totalBids}</div>
            <div className="stat-pct">({pct(stats.successfulBidRate)})</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Unsuccessful Bids</div>
            <div className="stat-value">{stats.unsuccessfulBids}/{stats.totalBids}</div>
            <div className="stat-pct">({pct(stats.unsuccessfulBidRate)})</div>
          </div>
        </div>
      )}

      <div className="stats-actions">
        <button className="back-btn" onClick={() => navigateTo('game')}>Back</button>
        {stats.gamesPlayed > 0 && (
          <button className="clear-btn" onClick={handleClearStats}>Clear Stats</button>
        )}
      </div>
    </div>
  );
}
