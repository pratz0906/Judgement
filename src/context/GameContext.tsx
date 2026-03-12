/**
 * Global game state provider.
 * Wraps the game reducer and exposes state, dispatch, and convenience helpers.
 * Handles bot auto-play (bidding & card play) and auto-acknowledging trick results.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { GameState, Card } from '../types/game';
import type { GameAction } from '../logic/gameActions';
import { gameReducer, initialState } from '../logic/gameReducer';
import { getPlayableCards } from '../logic/tricks';
import { getValidBids } from '../logic/bidding';
import { aiBid, aiPlayCard } from '../logic/ai';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  getPlayableCardsForCurrentPlayer: () => Card[];
  getValidBidsForCurrentPlayer: () => number[];
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const botTimeoutRef = useRef<number | null>(null);

  const getPlayableCardsForCurrentPlayer = useCallback((): Card[] => {
    const player = state.players[state.currentPlayerIndex];
    if (!player) return [];
    return getPlayableCards(player.hand, state.trick.leadSuit);
  }, [state]);

  const getValidBidsForCurrentPlayer = useCallback((): number[] => {
    const totalTricks = state.roundStructure[state.currentRoundIndex];
    return getValidBids(totalTricks, state.players, state.currentPlayerIndex, state.dealerIndex);
  }, [state]);

  // Bot auto-play: schedule AI bid or card play after a short delay
  useEffect(() => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer?.isBot) return;

    if (state.phase === 'bidding') {
      botTimeoutRef.current = window.setTimeout(() => {
        const totalTricks = state.roundStructure[state.currentRoundIndex];
        const bid = aiBid(
          currentPlayer.hand,
          state.trumpSuit,
          totalTricks,
          state.players,
          state.currentPlayerIndex,
          state.dealerIndex
        );
        dispatch({ type: 'PLACE_BID', playerId: currentPlayer.id, bid });
      }, 700);
    }

    if (state.phase === 'playing') {
      botTimeoutRef.current = window.setTimeout(() => {
        const card = aiPlayCard(
          currentPlayer.hand,
          state.trick,
          state.trumpSuit,
          currentPlayer
        );
        dispatch({ type: 'PLAY_CARD', playerId: currentPlayer.id, card });
      }, 800);
    }

    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
    };
  }, [state.phase, state.currentPlayerIndex, state.players, state.trumpSuit, state.trick, state.roundStructure, state.currentRoundIndex, state.dealerIndex]);

  // Auto-acknowledge trick results after 1.5 s so play continues without manual input
  useEffect(() => {
    if (state.phase === 'trickResult') {
      const timeout = window.setTimeout(() => {
        dispatch({ type: 'ACKNOWLEDGE_TRICK' });
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [state.phase, state.trickNumber]);

  return (
    <GameContext.Provider value={{ state, dispatch, getPlayableCardsForCurrentPlayer, getValidBidsForCurrentPlayer }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
