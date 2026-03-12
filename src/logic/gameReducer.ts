/**
 * Central game reducer handling all state transitions for the Judgement card game.
 * Actions flow: START_GAME → (PLAYER_PEEKED) → PLACE_BID → PLAY_CARD →
 *   ACKNOWLEDGE_TRICK → (repeat or NEXT_ROUND) → GAME_OVER / RESTART.
 */

import type { GameState, Player } from '../types/game';
import { Suit } from '../types/game';
import type { GameAction } from './gameActions';
import { deal } from './deck';
import { getTrumpForRound } from './round';
import { resolveTrickWinner } from './tricks';
import { calculateRoundScores } from './scoring';

export const initialState: GameState = {
  phase: 'setup',
  players: [],
  roundStructure: [],
  currentRoundIndex: 0,
  trumpSuit: Suit.Spades,
  dealerIndex: 0,
  currentPlayerIndex: 0,
  trick: { cardsPlayed: [], leadPlayerId: 0, leadSuit: null },
  trickNumber: 0,
  trickWinner: null,
  scoreHistory: [],
  peekQueue: [],
};

function nextPlayerIndex(current: number, playerCount: number): number {
  return (current + 1) % playerCount;
}

/** Deals cards, sets trump, and determines the first bidder for the current round. */
function startDealing(state: GameState): GameState {
  const cardsPerPlayer = state.roundStructure[state.currentRoundIndex];
  const trump = getTrumpForRound(state.currentRoundIndex);
  const hands = deal(state.players.length, cardsPerPlayer);

  const players = state.players.map((p, i) => ({
    ...p,
    hand: hands[i],
    bid: null,
    tricksWon: 0,
  }));

  const humanPlayers = players.filter(p => !p.isBot);
  const peekQueue = humanPlayers.length > 1 ? humanPlayers.map(p => p.id) : [];
  const firstBidder = nextPlayerIndex(state.dealerIndex, players.length);

  return {
    ...state,
    phase: peekQueue.length > 0 ? 'peeking' : 'bidding',
    players,
    trumpSuit: trump,
    currentPlayerIndex: firstBidder,
    trick: { cardsPlayed: [], leadPlayerId: firstBidder, leadSuit: null },
    trickNumber: 1,
    trickWinner: null,
    peekQueue,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const players: Player[] = action.players.map((p, i) => ({
        id: i,
        name: p.name,
        isBot: p.isBot,
        hand: [],
        bid: null,
        tricksWon: 0,
      }));

      return startDealing({
        ...initialState,
        players,
        roundStructure: action.roundStructure,
      });
    }

    case 'PLAYER_PEEKED': {
      const newQueue = state.peekQueue.filter(id => id !== action.playerId);
      if (newQueue.length === 0) {
        return { ...state, phase: 'bidding', peekQueue: [] };
      }
      return { ...state, peekQueue: newQueue };
    }

    case 'PLACE_BID': {
      const players = state.players.map(p =>
        p.id === action.playerId ? { ...p, bid: action.bid } : p
      );

      const allBid = players.every(p => p.bid !== null);
      const nextPlayer = nextPlayerIndex(state.currentPlayerIndex, players.length);

      if (allBid) {
        const leadPlayer = nextPlayerIndex(state.dealerIndex, players.length);
        return {
          ...state,
          players,
          phase: 'playing',
          currentPlayerIndex: leadPlayer,
          trick: { cardsPlayed: [], leadPlayerId: leadPlayer, leadSuit: null },
        };
      }

      return {
        ...state,
        players,
        currentPlayerIndex: nextPlayer,
      };
    }

    case 'PLAY_CARD': {
      const card = action.card;
      const players = state.players.map(p =>
        p.id === action.playerId
          ? { ...p, hand: p.hand.filter(c => c.id !== card.id) }
          : p
      );

      const leadSuit = state.trick.cardsPlayed.length === 0 ? card.suit : state.trick.leadSuit;
      const newTrick = {
        ...state.trick,
        cardsPlayed: [...state.trick.cardsPlayed, { playerId: action.playerId, card }],
        leadSuit,
      };

    // If all players have played, resolve the trick winner
      if (newTrick.cardsPlayed.length === players.length) {
        const winnerId = resolveTrickWinner(newTrick, state.trumpSuit);
        const updatedPlayers = players.map(p =>
          p.id === winnerId ? { ...p, tricksWon: p.tricksWon + 1 } : p
        );

        return {
          ...state,
          players: updatedPlayers,
          trick: newTrick,
          phase: 'trickResult',
          trickWinner: winnerId,
        };
      }

      return {
        ...state,
        players,
        trick: newTrick,
        currentPlayerIndex: nextPlayerIndex(state.currentPlayerIndex, players.length),
      };
    }

    case 'ACKNOWLEDGE_TRICK': {
      const cardsPerPlayer = state.roundStructure[state.currentRoundIndex];

      // All tricks for the round are complete — record scores and show round result
      if (state.trickNumber >= cardsPerPlayer) {
        const roundScores = calculateRoundScores(state.players);
        const roundScore = {
          roundNumber: state.currentRoundIndex + 1,
          cardsDealt: cardsPerPlayer,
          trump: state.trumpSuit,
          playerScores: roundScores,
        };

        return {
          ...state,
          phase: 'roundResult',
          scoreHistory: [...state.scoreHistory, roundScore],
        };
      }

      // More tricks remain — start the next trick led by the previous winner
      const leadPlayer = state.trickWinner!;
      return {
        ...state,
        phase: 'playing',
        currentPlayerIndex: leadPlayer,
        trick: { cardsPlayed: [], leadPlayerId: leadPlayer, leadSuit: null },
        trickNumber: state.trickNumber + 1,
        trickWinner: null,
      };
    }

    case 'NEXT_ROUND': {
      const nextRoundIndex = state.currentRoundIndex + 1;

      if (nextRoundIndex >= state.roundStructure.length) {
        return { ...state, phase: 'gameOver' };
      }

      const nextDealer = nextPlayerIndex(state.dealerIndex, state.players.length);

      return startDealing({
        ...state,
        currentRoundIndex: nextRoundIndex,
        dealerIndex: nextDealer,
      });
    }

    case 'RESTART':
      return { ...initialState };

    default:
      return state;
  }
}
