import { Suit, SUIT_ORDER } from '../types/game';

export type RoundMode = 'upDown' | 'upOnly' | 'downOnly' | 'custom';

export function getMaxCardsPerPlayer(playerCount: number): number {
  return Math.floor(52 / playerCount);
}

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

export function getTrumpForRound(roundIndex: number): Suit {
  return SUIT_ORDER[roundIndex % 4];
}
