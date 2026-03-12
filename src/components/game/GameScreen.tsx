/**
 * Main game container that renders the correct phase-specific component
 * (peeking, bidding, playing, trick result, round result, or game over)
 * along with the shared header and player indicator.
 */

import { useGame } from '../../context/GameContext';
import TrumpIndicator from '../shared/TrumpIndicator';
import PlayerIndicator from '../shared/PlayerIndicator';
import PeekScreen from './PeekScreen';
import BiddingPhase from './BiddingPhase';
import PlayingPhase from './PlayingPhase';
import TrickResult from './TrickResult';
import RoundResult from './RoundResult';
import GameOver from './GameOver';

export default function GameScreen() {
  const { state } = useGame();

  const renderPhase = () => {
    switch (state.phase) {
      case 'peeking':
        return <PeekScreen />;
      case 'bidding':
        return <BiddingPhase />;
      case 'playing':
        return <PlayingPhase />;
      case 'trickResult':
        return <TrickResult />;
      case 'roundResult':
        return <RoundResult />;
      case 'gameOver':
        return <GameOver />;
      default:
        return null;
    }
  };

  if (state.phase === 'gameOver') {
    return <div className="game-screen">{renderPhase()}</div>;
  }

  // First leader is the player after the dealer (clockwise)
  const firstLeaderIndex = (state.dealerIndex + 1) % state.players.length;

  return (
    <div className="game-screen">
      <div className="game-header" role="banner">
        <TrumpIndicator
          suit={state.trumpSuit}
          round={state.currentRoundIndex + 1}
          totalRounds={state.roundStructure.length}
        />
        <div className="cards-info" aria-live="polite">
          Cards: {state.roundStructure[state.currentRoundIndex]} | Trick: {state.trickNumber}/{state.roundStructure[state.currentRoundIndex]}
        </div>
      </div>
      <PlayerIndicator
        players={state.players}
        currentPlayerIndex={state.currentPlayerIndex}
        dealerIndex={state.dealerIndex}
        firstLeaderIndex={firstLeaderIndex}
      />
      <main className="game-main">
        {renderPhase()}
      </main>
    </div>
  );
}
