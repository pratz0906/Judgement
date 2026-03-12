/**
 * Bidding rules for Judgement (Kachufool).
 *
 * The dealer (last bidder) is restricted: the total of all bids
 * must NOT equal the number of tricks available in the round.
 */

import type { Player } from '../types/game';

/** Checks whether the given player is the dealer (last to bid). */
export function isLastBidder(playerIndex: number, dealerIndex: number): boolean {
  return playerIndex === dealerIndex;
}

/**
 * Returns valid bid values for the current player.
 * For the dealer, the bid that would make total bids equal total tricks is excluded.
 */
export function getValidBids(
  totalTricks: number,
  players: Player[],
  currentPlayerIndex: number,
  dealerIndex: number
): number[] {
  const allBids = Array.from({ length: totalTricks + 1 }, (_, i) => i);

  if (!isLastBidder(currentPlayerIndex, dealerIndex)) {
    return allBids;
  }

  // Last bidder restriction: total bids cannot equal total tricks
  const sumOtherBids = players.reduce((sum, p, idx) => {
    if (idx === currentPlayerIndex) return sum;
    return sum + (p.bid ?? 0);
  }, 0);

  const forbidden = totalTricks - sumOtherBids;
  return allBids.filter(b => b !== forbidden);
}
