import { useGame } from '../../context/GameContext';
import type { Player } from '../../types/game';
import { seatPosition } from '../../utils/seatPosition';
import CardComponent from '../shared/CardComponent';

export default function TrickResult() {
  const { state } = useGame();
  const winner = state.players.find((p: Player) => p.id === state.trickWinner);
  const playerCount = state.players.length;
  const humanIndex = state.players.findIndex((p: Player) => !p.isBot);

  return (
    <div className="trick-result playing-phase" role="region" aria-label="Trick result">
      <h2 aria-live="polite">{winner?.name === 'You' ? 'You win the trick!' : `${winner?.name} wins the trick!`}</h2>
      <div className="circle-table">
        <div className="circle-center-label trick-winner-center">
          {winner?.name === 'You' ? 'You win!' : `${winner?.name} wins!`}
        </div>
        {state.players.map((player: Player, idx: number) => {
          const pos = seatPosition(idx, playerCount, humanIndex);
          const played = state.trick.cardsPlayed.find(tc => tc.playerId === player.id);
          const isWinner = player.id === state.trickWinner;

          return (
            <div
              key={player.id}
              className="circle-seat"
              style={{ left: pos.left, top: pos.top }}
            >
              <div className={`seat-label ${isWinner ? 'seat-winner' : ''}`}>
                {player.name}
              </div>
              <div className="seat-stats-row">
                Won: {player.tricksWon} | Bid: {player.bid ?? '?'}
              </div>
              <div className={`seat-card-slot ${isWinner ? 'seat-card-winner' : ''}`}>
                {played && <CardComponent card={played.card} small />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="hand-section">
        <div className="hand-placeholder" />
      </div>
    </div>
  );
}
