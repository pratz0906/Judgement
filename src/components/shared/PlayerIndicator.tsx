import type { Player } from '../../types/game';

interface Props {
  players: Player[];
  currentPlayerIndex: number;
  dealerIndex: number;
  firstLeaderIndex?: number;
}

export default function PlayerIndicator({ players, currentPlayerIndex, dealerIndex, firstLeaderIndex }: Props) {
  return (
    <div className="player-indicator" role="list" aria-label="Players">
      {players.map((player, idx) => {
        const isActive = idx === currentPlayerIndex;
        return (
          <div
            key={player.id}
            className={`player-badge ${isActive ? 'player-active' : ''} ${player.isBot ? 'player-bot' : ''}`}
            role="listitem"
            aria-current={isActive ? 'true' : undefined}
          >
            <span className="player-name">
              {player.name}
              {idx === dealerIndex && <span className="dealer-badge" aria-label="Dealer">D</span>}
              {idx === firstLeaderIndex && <span className="leader-badge" aria-label="First to play">1</span>}
            </span>
            <span className="player-stats">
              {player.bid !== null ? `Bid: ${player.bid}` : '...'} | Won: {player.tricksWon}
            </span>
          </div>
        );
      })}
    </div>
  );
}
