/**
 * Global game state provider.
 * Wraps the game reducer and exposes state, dispatch, and convenience helpers.
 * Handles bot auto-play (bidding & card play) and auto-acknowledging trick results.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import type { GameState, Card } from '../types/game';
import type { GameAction } from '../logic/gameActions';
import { gameReducer, initialState } from '../logic/gameReducer';
import { getPlayableCards } from '../logic/tricks';
import { getValidBids } from '../logic/bidding';
import { aiBid, aiPlayCard } from '../logic/ai';
import { calculateTotalScores } from '../logic/scoring';
import { saveGameRecord } from '../utils/storage';

export type AppView = 'game' | 'stats' | 'history';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  getPlayableCardsForCurrentPlayer: () => Card[];
  getValidBidsForCurrentPlayer: () => number[];
  currentView: AppView;
  navigateTo: (view: AppView) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const botTimeoutRef = useRef<number | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('game');
  const gameSavedRef = useRef(false);

  const navigateTo = useCallback((view: AppView) => setCurrentView(view), []);

  // Reset view to 'game' when game is restarted
  const wrappedDispatch = useCallback<React.Dispatch<GameAction>>((action) => {
    if (action.type === 'RESTART') {
      setCurrentView('game');
      gameSavedRef.current = false;
    }
    dispatch(action);
  }, []);

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

  // Auto-save game record to localStorage when the game ends
  useEffect(() => {
    if (state.phase !== 'gameOver' || gameSavedRef.current) return;
    gameSavedRef.current = true;

    const humanPlayer = state.players.find(p => !p.isBot);
    if (!humanPlayer) return;

    const totals = calculateTotalScores(state.scoreHistory);
    const humanTotal = totals.find(t => t.playerId === humanPlayer.id)?.total ?? 0;
    const won = totals[0]?.playerId === humanPlayer.id;

    const humanRounds = state.scoreHistory.map(round => {
      const ps = round.playerScores.find(s => s.playerId === humanPlayer.id);
      return {
        bid: ps?.bid ?? 0,
        tricksWon: ps?.tricksWon ?? 0,
        cardsDealt: round.cardsDealt,
        roundPoints: ps?.roundPoints ?? 0,
      };
    });

    const otherPlayers = state.players
      .filter(p => p.id !== humanPlayer.id)
      .map(p => ({
        name: p.name,
        score: totals.find(t => t.playerId === p.id)?.total ?? 0,
      }));

    saveGameRecord({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      playerName: humanPlayer.name,
      playerCount: state.players.length,
      totalRounds: state.scoreHistory.length,
      won,
      finalScore: humanTotal,
      otherPlayers,
      rounds: humanRounds,
    });
  }, [state.phase, state.players, state.scoreHistory]);

  return (
    <GameContext.Provider value={{ state, dispatch: wrappedDispatch, getPlayableCardsForCurrentPlayer, getValidBidsForCurrentPlayer, currentView, navigateTo }}>
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
