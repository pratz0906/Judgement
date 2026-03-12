/**
 * Trick-taking rules: determines which cards a player may play
 * and resolves which card wins each trick.
 */

import type { Card, TrickState } from '../types/game';
import { Suit } from '../types/game';

/**
 * Returns the subset of cards a player is allowed to play.
 * Must follow lead suit if possible; otherwise any card is valid.
 */
export function getPlayableCards(hand: Card[], leadSuit: Suit | null): Card[] {
  if (leadSuit === null) {
    return hand; // Leading: can play anything
  }
  const suitCards = hand.filter(c => c.suit === leadSuit);
  return suitCards.length > 0 ? suitCards : hand;
}

/** Determines the winner of a completed trick by comparing all played cards. */
export function resolveTrickWinner(trick: TrickState, trumpSuit: Suit): number {
  const { cardsPlayed, leadSuit } = trick;

  let winnerId = cardsPlayed[0].playerId;
  let winningCard = cardsPlayed[0].card;

  for (let i = 1; i < cardsPlayed.length; i++) {
    const { playerId, card } = cardsPlayed[i];
    if (beats(card, winningCard, leadSuit!, trumpSuit)) {
      winnerId = playerId;
      winningCard = card;
    }
  }

  return winnerId;
}

/**
 * Returns true if the challenger card beats the current winning card.
 * Priority: trump > lead suit > off-suit (off-suit never wins).
 */
function beats(challenger: Card, current: Card, leadSuit: Suit, trumpSuit: Suit): boolean {
  const challengerIsTrump = challenger.suit === trumpSuit;
  const currentIsTrump = current.suit === trumpSuit;

  // Trump beats non-trump
  if (challengerIsTrump && !currentIsTrump) return true;
  if (!challengerIsTrump && currentIsTrump) return false;

  // Both trump: higher rank wins
  if (challengerIsTrump && currentIsTrump) {
    return challenger.rank > current.rank;
  }

  // Neither is trump: only lead suit matters
  const challengerIsLead = challenger.suit === leadSuit;
  const currentIsLead = current.suit === leadSuit;

  if (challengerIsLead && !currentIsLead) return true;
  if (!challengerIsLead && currentIsLead) return false;
  if (challengerIsLead && currentIsLead) {
    return challenger.rank > current.rank;
  }

  // Neither is trump or lead suit: first card holds
  return false;
}
