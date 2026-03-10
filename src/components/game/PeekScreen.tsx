import { useState } from 'react';
import { useGame } from '../../context/GameContext';
import type { Player } from '../../types/game';
import HandDisplay from '../shared/HandDisplay';

export default function PeekScreen() {
  const { state, dispatch } = useGame();
  const [revealed, setRevealed] = useState(false);

  const currentPeekId = state.peekQueue[0];
  const player = state.players.find((p: Player) => p.id === currentPeekId);

  if (!player) return null;

  if (!revealed) {
    return (
      <div className="peek-screen" role="alertdialog" aria-label={`${player.name}'s turn to peek`}>
        <div className="peek-overlay">
          <h2>{player.name}'s Turn</h2>
          <p>Tap below to see your cards</p>
          <button className="peek-btn" onClick={() => setRevealed(true)}>
            Reveal Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="peek-screen" role="region" aria-label={`${player.name}'s hand`}>
      <h2>{player.name}'s Hand</h2>
      <HandDisplay cards={player.hand} />
      <button
        className="done-btn"
        onClick={() => {
          setRevealed(false);
          dispatch({ type: 'PLAYER_PEEKED', playerId: player.id });
        }}
      >
        Done - Pass Device
      </button>
    </div>
  );
}
