/**
 * localStorage utilities for persisting game history.
 * Stores an array of GameRecord objects under a single key.
 */

import type { GameRecord } from '../types/game';

const STORAGE_KEY = 'judgement_game_history';

/** Reads all stored game records from localStorage. */
function readAll(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Appends a game record to localStorage. */
export function saveGameRecord(record: GameRecord): void {
  const records = readAll();
  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/** Returns all records, optionally filtered by player name (case-insensitive). */
export function getGameRecords(playerName?: string): GameRecord[] {
  const records = readAll();
  if (!playerName) return records;
  const lower = playerName.toLowerCase();
  return records.filter(r => r.playerName.toLowerCase() === lower);
}

/** Returns the most recent N games for a player, newest first. */
export function getRecentGames(playerName: string, count: number = 10): GameRecord[] {
  const records = getGameRecords(playerName);
  return records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
}

/** Removes all stored game records. */
export function clearGameRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}
