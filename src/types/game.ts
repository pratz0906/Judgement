export enum Suit {
  Spades = 'Spades',
  Diamonds = 'Diamonds',
  Clubs = 'Clubs',
  Hearts = 'Hearts',
}

export const SUIT_ORDER: Suit[] = [Suit.Spades, Suit.Diamonds, Suit.Clubs, Suit.Hearts];

export enum Rank {
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
  Jack = 11,
  Queen = 12,
  King = 13,
  Ace = 14,
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface Player {
  id: number;
  name: string;
  isBot: boolean;
  hand: Card[];
  bid: number | null;
  tricksWon: number;
}

export interface PlayerConfig {
  name: string;
  isBot: boolean;
}

export type GamePhase =
  | 'setup'
  | 'peeking'
  | 'bidding'
  | 'playing'
  | 'trickResult'
  | 'roundResult'
  | 'gameOver';

export interface TrickCard {
  playerId: number;
  card: Card;
}

export interface TrickState {
  cardsPlayed: TrickCard[];
  leadPlayerId: number;
  leadSuit: Suit | null;
}

export interface PlayerRoundScore {
  playerId: number;
  bid: number;
  tricksWon: number;
  roundPoints: number;
}

export interface RoundScore {
  roundNumber: number;
  cardsDealt: number;
  trump: Suit;
  playerScores: PlayerRoundScore[];
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  roundStructure: number[];
  currentRoundIndex: number;
  trumpSuit: Suit;
  dealerIndex: number;
  currentPlayerIndex: number;
  trick: TrickState;
  trickNumber: number;
  trickWinner: number | null;
  scoreHistory: RoundScore[];
  peekQueue: number[];
}
