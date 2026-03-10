import { useGame } from '../../context/GameContext';
import type { Player } from '../../types/game';
import { seatPosition } from '../../utils/seatPosition';
import CardComponent from '../shared/CardComponent';
import HandDisplay from '../shared/HandDisplay';

export default function PlayingPhase() {
  const { state, dispatch, getPlayableCardsForCurrentPlayer } = useGame();
  const currentPlayer = state.players[state.currentPlayerIndex];
  const playableCards = getPlayableCardsForCurrentPlayer();
  const playerCount = state.players.length;
  const dealerIndex = state.dealerIndex;
  const firstLeader = (dealerIndex + 1) % playerCount;
  const humanIndex = state.players.findIndex((p: Player) => !p.isBot);
  const singleHuman = state.players.filter((p: Player) => !p.isBot).length === 1
    ? state.players.find((p: Player) => !p.isBot)!
    : null;

  const getCardForPlayer = (playerId: number) =>
    state.trick.cardsPlayed.find(tc => tc.playerId === playerId);

  return (
    <div className="playing-phase" role="region" aria-label="Playing phase">
      <h2 aria-live="polite">{currentPlayer.isBot ? `${currentPlayer.name} is playing...` : `${currentPlayer.name} — Play a Card`}</h2>

      <div className="circle-table" role="img" aria-label={`Table showing trick ${state.trickNumber}`}>
        <div className="circle-center-label">Trick {state.trickNumber}</div>
        {state.players.map((player: Player, idx: number) => {
          const pos = seatPosition(idx, playerCount, humanIndex);
          const played = getCardForPlayer(player.id);
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
              <div className="seat-stats-row">
                Bid: {player.bid ?? '?'} | Won: {player.tricksWon}
              </div>
              <div className="seat-card-slot">
                {played ? (
                  <CardComponent card={played.card} small />
                ) : (
                  <div className="card-back card-small card-placeholder" aria-hidden="true" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hand-section">
        {!currentPlayer.isBot ? (
          <HandDisplay
            cards={currentPlayer.hand}
            playableCards={playableCards}
            onCardClick={card => {
              if (playableCards.find(c => c.id === card.id)) {
                dispatch({ type: 'PLAY_CARD', playerId: currentPlayer.id, card });
              }
            }}
          />
        ) : singleHuman ? (
          <HandDisplay cards={singleHuman.hand} />
        ) : (
          <div className="hand-placeholder" />
        )}
      </div>
    </div>
  );
}
