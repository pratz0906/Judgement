import type { Card } from '../types/game';
import { createFullDeck } from '../constants/deck';

export function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sortHand(hand: Card[]): Card[] {
  const suitOrder = { Spades: 0, Hearts: 1, Clubs: 2, Diamonds: 3 };
  return [...hand].sort((a, b) => {
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) return suitDiff;
    return a.rank - b.rank;
  });
}

export function deal(playerCount: number, cardsPerPlayer: number): Card[][] {
  const deck = shuffle(createFullDeck());
  const hands: Card[][] = [];
  for (let i = 0; i < playerCount; i++) {
    const hand = deck.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer);
    hands.push(sortHand(hand));
  }
  return hands;
}
