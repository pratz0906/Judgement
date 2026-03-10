import type { Card } from '../../types/game';
import CardComponent from './CardComponent';

interface Props {
  cards: Card[];
  playableCards?: Card[];
  onCardClick?: (card: Card) => void;
}

export default function HandDisplay({ cards, playableCards, onCardClick }: Props) {
  const playableIds = new Set(playableCards?.map(c => c.id) ?? cards.map(c => c.id));

  return (
    <div className="hand-display" role="group" aria-label={`Hand with ${cards.length} cards`}>
      {cards.map(card => (
        <CardComponent
          key={card.id}
          card={card}
          playable={playableIds.has(card.id)}
          onClick={() => onCardClick?.(card)}
        />
      ))}
    </div>
  );
}
