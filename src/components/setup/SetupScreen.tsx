/**
 * Setup screen: lets users configure player names/bots, choose a round mode,
 * and start the game.
 */

import { useState } from 'react';
import type { PlayerConfig } from '../../types/game';
import { useGame } from '../../context/GameContext';
import type { RoundMode } from '../../logic/round';
import { generateRoundStructure } from '../../logic/round';
import PlayerConfigComponent from './PlayerConfig';
import RoundConfigComp from './RoundConfig';

export default function SetupScreen() {
  const { dispatch, navigateTo } = useGame();
  const [players, setPlayers] = useState<PlayerConfig[]>([
    { name: 'You', isBot: false },
    { name: 'Bot Alice', isBot: true },
    { name: 'Bot Bob', isBot: true },
    { name: 'Bot Carol', isBot: true },
  ]);
  const [roundMode, setRoundMode] = useState<RoundMode>('upDown');
  const [customRounds, setCustomRounds] = useState('');

  const startGame = () => {
    let roundStructure: number[];
    if (roundMode === 'custom') {
      const parsed = customRounds
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      roundStructure = generateRoundStructure(players.length, 'custom', parsed);
    } else {
      roundStructure = generateRoundStructure(players.length, roundMode);
    }

    if (roundStructure.length === 0) {
      alert('Please enter valid round numbers.');
      return;
    }

    dispatch({ type: 'START_GAME', players, roundStructure });
  };

  return (
    <div className="setup-screen">
      <h1>Kachufool</h1>
      <p className="subtitle">The Judgement Card Game</p>
      <PlayerConfigComponent players={players} onChange={setPlayers} />
      <RoundConfigComp
        playerCount={players.length}
        mode={roundMode}
        customRounds={customRounds}
        onModeChange={setRoundMode}
        onCustomChange={setCustomRounds}
      />
      <button className="start-btn" onClick={startGame}>Start Game</button>
      <div className="nav-buttons">
        <button className="nav-btn" onClick={() => navigateTo('stats')}>Stats</button>
        <button className="nav-btn" onClick={() => navigateTo('history')}>History</button>
      </div>
    </div>
  );
}
