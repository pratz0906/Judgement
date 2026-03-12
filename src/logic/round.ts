/**
 * Round structure generation and trump suit cycling.
 * Supports multiple game modes: upDown, upOnly, downOnly, and custom.
 */

import { Suit, SUIT_ORDER } from '../types/game';

export type RoundMode = 'upDown' | 'upOnly' | 'downOnly' | 'custom';

/** Maximum cards each player can receive in a round (52 ÷ playerCount). */
export function getMaxCardsPerPlayer(playerCount: number): number {
  return Math.floor(52 / playerCount);
}

/**
 * Builds the sequence of card counts for each round based on the selected mode.
 * - upDown: 1 → max → 1 (e.g. 1,2,...,13,...,2,1)
 * - upOnly: 1 → max
 * - downOnly: max → 1
 * - custom: user-supplied list, filtered to valid range
 */
export function generateRoundStructure(
  playerCount: number,
  mode: RoundMode,
  customRounds?: number[]
): number[] {
  const max = getMaxCardsPerPlayer(playerCount);

  switch (mode) {
    case 'upDown': {
      const up = Array.from({ length: max }, (_, i) => i + 1);
      const down = Array.from({ length: max - 1 }, (_, i) => max - 1 - i);
      return [...up, ...down];
    }
    case 'upOnly':
      return Array.from({ length: max }, (_, i) => i + 1);
    case 'downOnly':
      return Array.from({ length: max }, (_, i) => max - i);
    case 'custom':
      if (customRounds && customRounds.length > 0) {
        return customRounds.filter(n => n >= 1 && n <= max);
      }
      return [1];
  }
}

/** Cycles the trump suit through SUIT_ORDER (Spades → Diamonds → Clubs → Hearts → repeat). */
export function getTrumpForRound(roundIndex: number): Suit {
  return SUIT_ORDER[roundIndex % 4];
}
