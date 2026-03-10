import { Suit } from '../../types/game';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../constants/deck';

interface Props {
  suit: Suit;
  round: number;
  totalRounds: number;
}

export default function TrumpIndicator({ suit, round, totalRounds }: Props) {
  return (
    <div className="trump-indicator" role="status" aria-label={`Trump suit is ${suit}, round ${round} of ${totalRounds}`}>
      <span className="trump-label">Trump:</span>
      <span className={`trump-suit ${SUIT_COLORS[suit] === 'red' ? 'text-red' : 'text-black'}`}>
        {SUIT_SYMBOLS[suit]} {suit}
      </span>
      <span className="round-label">Round {round}/{totalRounds}</span>
    </div>
  );
}
