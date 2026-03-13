/**
 * Computes aggregate player statistics from an array of GameRecord objects.
 *
 * Metrics:
 *  1. Game Win Rate     — games won / total games
 *  2. Game Loss Rate    — games lost / total games
 *  3. Won Hands         — total tricks won / total tricks played
 *  4. Lost Hands        — total tricks lost / total tricks played
 *  5. Average Score     — sum of player's final scores / total games
 *  6. Avg Other Score   — sum of all opponents' scores / total opponent entries
 *  7. Successful Bids   — rounds where bid === tricksWon / total rounds
 *  8. Unsuccessful Bids — rounds where bid !== tricksWon / total rounds
 */

import type { GameRecord } from '../types/game';

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  lossRate: number;
  handsWon: number;
  handsLost: number;
  totalHands: number;
  wonHandsRate: number;
  lostHandsRate: number;
  avgScore: number;
  avgOtherScore: number;
  successfulBids: number;
  unsuccessfulBids: number;
  totalBids: number;
  successfulBidRate: number;
  unsuccessfulBidRate: number;
}

/** Aggregates statistics across all provided game records. */
export function calculatePlayerStats(records: GameRecord[]): PlayerStats {
  const gamesPlayed = records.length;

  if (gamesPlayed === 0) {
    return {
      gamesPlayed: 0, gamesWon: 0, gamesLost: 0,
      winRate: 0, lossRate: 0,
      handsWon: 0, handsLost: 0, totalHands: 0,
      wonHandsRate: 0, lostHandsRate: 0,
      avgScore: 0, avgOtherScore: 0,
      successfulBids: 0, unsuccessfulBids: 0, totalBids: 0,
      successfulBidRate: 0, unsuccessfulBidRate: 0,
    };
  }

  let gamesWon = 0;
  let totalScore = 0;
  let handsWon = 0;
  let totalHands = 0;
  let successfulBids = 0;
  let totalBids = 0;
  let otherScoreSum = 0;
  let otherPlayerCount = 0;

  for (const game of records) {
    if (game.won) gamesWon++;
    totalScore += game.finalScore;

    // Per-round stats
    for (const round of game.rounds) {
      handsWon += round.tricksWon;
      totalHands += round.cardsDealt;
      totalBids++;
      if (round.bid === round.tricksWon) successfulBids++;
    }

    // Other players' scores
    for (const other of game.otherPlayers) {
      otherScoreSum += other.score;
      otherPlayerCount++;
    }
  }

  const gamesLost = gamesPlayed - gamesWon;
  const handsLost = totalHands - handsWon;
  const unsuccessfulBids = totalBids - successfulBids;

  return {
    gamesPlayed,
    gamesWon,
    gamesLost,
    winRate: gamesWon / gamesPlayed,
    lossRate: gamesLost / gamesPlayed,
    handsWon,
    handsLost,
    totalHands,
    wonHandsRate: totalHands > 0 ? handsWon / totalHands : 0,
    lostHandsRate: totalHands > 0 ? handsLost / totalHands : 0,
    avgScore: totalScore / gamesPlayed,
    avgOtherScore: otherPlayerCount > 0 ? otherScoreSum / otherPlayerCount : 0,
    successfulBids,
    unsuccessfulBids,
    totalBids,
    successfulBidRate: totalBids > 0 ? successfulBids / totalBids : 0,
    unsuccessfulBidRate: totalBids > 0 ? unsuccessfulBids / totalBids : 0,
  };
}
