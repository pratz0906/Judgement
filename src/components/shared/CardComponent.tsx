import type { Card as CardType } from '../../types/game';
import { SUIT_SYMBOLS, SUIT_COLORS, RANK_DISPLAY } from '../../constants/deck';

interface Props {
  card: CardType;
  faceUp?: boolean;
  playable?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export default function CardComponent({ card, faceUp = true, playable = true, onClick, small }: Props) {
  if (!faceUp) {
    return <div className={`card card-back ${small ? 'card-small' : ''}`} aria-hidden="true" />;
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const rank = RANK_DISPLAY[card.rank];
  const label = `${rank} of ${card.suit}`;
  const isInteractive = playable && onClick;

  return (
    <div
      className={`card ${color === 'red' ? 'card-red' : 'card-black'} ${!playable ? 'card-dimmed' : ''} ${small ? 'card-small' : ''}`}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : 'img'}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={label}
      aria-disabled={!playable || undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className="card-corner card-top-left" aria-hidden="true">
        <span className="card-rank">{rank}</span>
        <span className="card-suit">{symbol}</span>
      </div>
      <div className="card-center" aria-hidden="true">{symbol}</div>
      <div className="card-corner card-bottom-right" aria-hidden="true">
        <span className="card-rank">{rank}</span>
        <span className="card-suit">{symbol}</span>
      </div>
    </div>
  );
}
