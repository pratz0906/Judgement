import type { Player, PlayerRoundScore, RoundScore } from '../types/game';

export function calculateRoundScores(players: Player[]): PlayerRoundScore[] {
  return players.map(p => ({
    playerId: p.id,
    bid: p.bid!,
    tricksWon: p.tricksWon,
    roundPoints: p.bid === p.tricksWon ? 10 + 10 * p.tricksWon : -10 * p.bid!,
  }));
}

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
