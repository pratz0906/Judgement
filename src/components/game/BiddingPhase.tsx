import { useGame } from '../../context/GameContext';
import type { Player } from '../../types/game';
import { seatPosition } from '../../utils/seatPosition';
import HandDisplay from '../shared/HandDisplay';

export default function BiddingPhase() {
  const { state, dispatch, getValidBidsForCurrentPlayer } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  const validBids = getValidBidsForCurrentPlayer();
  const totalTricks = state.roundStructure[state.currentRoundIndex];
  const playerCount = state.players.length;
  const dealerIndex = state.dealerIndex;
  const firstLeader = (dealerIndex + 1) % playerCount;
  const humanIndex = state.players.findIndex((p: Player) => !p.isBot);
  const singleHuman = state.players.filter((p: Player) => !p.isBot).length === 1
    ? state.players.find((p: Player) => !p.isBot)!
    : null;

  return (
    <div className="bidding-phase" role="region" aria-label="Bidding phase">
      <h2 aria-live="polite">{currentPlayer.isBot ? `${currentPlayer.name} is thinking...` : `${currentPlayer.name} — Place Your Bid`}</h2>
      <p className="trick-count">Tricks this round: {totalTricks}</p>

      <div className="circle-table circle-table-bid" role="img" aria-label="Bidding table">
        <div className="circle-center-label">Bids</div>
        {state.players.map((player: Player, idx: number) => {
          const pos = seatPosition(idx, playerCount, humanIndex);
          const isActive = idx === state.currentPlayerIndex;
          const isDealer = idx === dealerIndex;
          const isFirstLeader = idx === firstLeader;

          return (
            <div
              key={player.id}
              className="circle-seat"
              style={{ left: pos.left, top: pos.top }}
            >
              <div className={`seat-label ${isActive ? 'seat-active' : ''}`} aria-current={isActive ? 'true' : undefined}>
                {player.name}
                {isDealer && <span className="dealer-badge" aria-label="Dealer">D</span>}
                {isFirstLeader && <span className="leader-badge" aria-label="First to play">1</span>}
              </div>
              <div className="seat-bid" aria-label={`${player.name}'s bid: ${player.bid !== null ? player.bid : 'pending'}`}>
                {player.bid !== null ? player.bid : '...'}
              </div>
            </div>
          );
        })}
      </div>

      {!currentPlayer.isBot ? (
        <>
          <HandDisplay cards={currentPlayer.hand} />
          <div className="bid-buttons" role="group" aria-label="Bid options">
            {validBids.map(bid => (
              <button
                key={bid}
                className="bid-btn"
                aria-label={`Bid ${bid}`}
                onClick={() => dispatch({ type: 'PLACE_BID', playerId: currentPlayer.id, bid })}
              >
                {bid}
              </button>
            ))}
          </div>
        </>
      ) : singleHuman ? (
        <HandDisplay cards={singleHuman.hand} />
      ) : null}
    </div>
  );
}
