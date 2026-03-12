/**
 * Scoring logic for Judgement (Kachufool).
 *
 * Scoring formula per round:
 *  - Correct bid:  +10 + (10 × tricks won)
 *  - Incorrect bid: -(10 × bid)
 */

import type { Player, PlayerRoundScore, RoundScore } from '../types/game';

/** Computes each player's score for the current round based on bid vs tricks won. */
export function calculateRoundScores(players: Player[]): PlayerRoundScore[] {
  return players.map(p => ({
    playerId: p.id,
    bid: p.bid!,
    tricksWon: p.tricksWon,
    roundPoints: p.bid === p.tricksWon ? 10 + 10 * p.tricksWon : -10 * p.bid!,
  }));
}

/** Aggregates scores across all completed rounds, sorted highest-first. */
export function calculateTotalScores(
  scoreHistory: RoundScore[]
): { playerId: number; total: number }[] {
  const totals = new Map<number, number>();

  for (const round of scoreHistory) {
    for (const ps of round.playerScores) {
      totals.set(ps.playerId, (totals.get(ps.playerId) ?? 0) + ps.roundPoints);
    }
  }

  return Array.from(totals.entries())
    .map(([playerId, total]) => ({ playerId, total }))
    .sort((a, b) => b.total - a.total);
}
