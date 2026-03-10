import type { Card } from '../types/game';
import { Suit, Rank } from '../types/game';

export const SUIT_SYMBOLS: Record<Suit, string> = {
  [Suit.Spades]: '\u2660',
  [Suit.Diamonds]: '\u2666',
  [Suit.Clubs]: '\u2663',
  [Suit.Hearts]: '\u2665',
};

export const SUIT_COLORS: Record<Suit, string> = {
  [Suit.Spades]: 'black',
  [Suit.Diamonds]: 'red',
  [Suit.Clubs]: 'black',
  [Suit.Hearts]: 'red',
};

export const RANK_DISPLAY: Record<Rank, string> = {
  [Rank.Two]: '2',
  [Rank.Three]: '3',
  [Rank.Four]: '4',
  [Rank.Five]: '5',
  [Rank.Six]: '6',
  [Rank.Seven]: '7',
  [Rank.Eight]: '8',
  [Rank.Nine]: '9',
  [Rank.Ten]: '10',
  [Rank.Jack]: 'J',
  [Rank.Queen]: 'Q',
  [Rank.King]: 'K',
  [Rank.Ace]: 'A',
};

export function createFullDeck(): Card[] {
  const suits = [Suit.Spades, Suit.Diamonds, Suit.Clubs, Suit.Hearts];
  const ranks = [
    Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven,
    Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace,
  ];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    }
  }
  return deck;
}
