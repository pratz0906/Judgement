import type { Card, Player, TrickState } from '../types/game';
import { Suit, Rank } from '../types/game';
import { getPlayableCards } from './tricks';
import { getValidBids } from './bidding';

export function aiBid(
  hand: Card[],
  trumpSuit: Suit,
  totalTricks: number,
  players: Player[],
  playerIndex: number,
  dealerIndex: number
): number {
  // Count power cards
  let power = 0;
  for (const card of hand) {
    if (card.suit === trumpSuit) {
      if (card.rank === Rank.Ace || card.rank === Rank.King) power += 1;
      else if (card.rank === Rank.Queen) power += 0.5;
    } else {
      if (card.rank === Rank.Ace) power += 0.7;
      else if (card.rank === Rank.King) power += 0.3;
    }
  }

  let bid = Math.round(power);
  bid = Math.max(0, Math.min(bid, totalTricks));

  // Validate against last bidder restriction
  const validBids = getValidBids(totalTricks, players, playerIndex, dealerIndex);
  if (!validBids.includes(bid)) {
    // Pick closest valid bid
    bid = validBids.reduce((closest, b) =>
      Math.abs(b - bid) < Math.abs(closest - bid) ? b : closest
    , validBids[0]);
  }

  return bid;
}

export function aiPlayCard(
  hand: Card[],
  trick: TrickState,
  trumpSuit: Suit,
  player: Player
): Card {
  const playable = getPlayableCards(hand, trick.leadSuit);
  const needsMoreTricks = (player.bid ?? 0) > player.tricksWon;

  // If leading
  if (trick.cardsPlayed.length === 0) {
    if (needsMoreTricks) {
      // Play highest card
      return playable.reduce((best, c) => c.rank > best.rank ? c : best);
    } else {
      // Dump lowest
      return playable.reduce((worst, c) => c.rank < worst.rank ? c : worst);
    }
  }

  // If following
  const currentWinningCard = getCurrentWinner(trick, trumpSuit);

  if (needsMoreTricks) {
    // Try to win with the lowest winning card
    const winners = playable.filter(c => wouldBeat(c, currentWinningCard, trick.leadSuit!, trumpSuit));
    if (winners.length > 0) {
      return winners.reduce((lowest, c) => c.rank < lowest.rank ? c : lowest);
    }
  }

  // Dump lowest card
  return playable.reduce((worst, c) => c.rank < worst.rank ? c : worst);
}

function getCurrentWinner(trick: TrickState, trumpSuit: Suit): Card {
  let best = trick.cardsPlayed[0].card;
  for (let i = 1; i < trick.cardsPlayed.length; i++) {
    const card = trick.cardsPlayed[i].card;
    if (wouldBeat(card, best, trick.leadSuit!, trumpSuit)) {
      best = card;
    }
  }
  return best;
}

function wouldBeat(challenger: Card, current: Card, leadSuit: Suit, trumpSuit: Suit): boolean {
  const cIsTrump = challenger.suit === trumpSuit;
  const wIsTrump = current.suit === trumpSuit;

  if (cIsTrump && !wIsTrump) return true;
  if (!cIsTrump && wIsTrump) return false;
  if (cIsTrump && wIsTrump) return challenger.rank > current.rank;

  const cIsLead = challenger.suit === leadSuit;
  const wIsLead = current.suit === leadSuit;

  if (cIsLead && !wIsLead) return true;
  if (!cIsLead && wIsLead) return false;
  if (cIsLead && wIsLead) return challenger.rank > current.rank;

  return false;
}
