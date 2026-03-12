/**
 * Discriminated union of all actions dispatched to the game reducer.
 * Each variant represents a distinct user or system event.
 */

import type { Card, PlayerConfig } from '../types/game';

export type GameAction =
  | { type: 'START_GAME'; players: PlayerConfig[]; roundStructure: number[] }
  | { type: 'PLAYER_PEEKED'; playerId: number }
  | { type: 'PLACE_BID'; playerId: number; bid: number }
  | { type: 'PLAY_CARD'; playerId: number; card: Card }
  | { type: 'ACKNOWLEDGE_TRICK' }
  | { type: 'NEXT_ROUND' }
  | { type: 'RESTART' };
