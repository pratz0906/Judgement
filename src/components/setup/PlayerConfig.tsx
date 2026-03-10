import type { PlayerConfig } from '../../types/game';

interface Props {
  players: PlayerConfig[];
  onChange: (players: PlayerConfig[]) => void;
}

export default function PlayerConfigComponent({ players, onChange }: Props) {
  const addPlayer = () => {
    if (players.length >= 6) return;
    onChange([...players, { name: `Bot ${players.length}`, isBot: true }]);
  };

  const removePlayer = () => {
    if (players.length <= 3) return;
    onChange(players.slice(0, -1));
  };

  const updatePlayer = (index: number, updates: Partial<PlayerConfig>) => {
    const updated = players.map((p, i) => (i === index ? { ...p, ...updates } : p));
    onChange(updated);
  };

  return (
    <div className="player-config" role="region" aria-label="Player configuration">
      <h3>Players ({players.length})</h3>
      <div className="player-list">
        {players.map((player, i) => (
          <div key={i} className="player-row">
            <label className="sr-only" htmlFor={`player-name-${i}`}>Player {i + 1} name</label>
            <input
              id={`player-name-${i}`}
              type="text"
              value={player.name}
              onChange={e => updatePlayer(i, { name: e.target.value })}
              className="player-name-input"
              maxLength={15}
            />
            <button
              className={`toggle-btn ${player.isBot ? 'bot' : 'human'}`}
              onClick={() => updatePlayer(i, { isBot: !player.isBot })}
              aria-label={`Player ${i + 1}: ${player.isBot ? 'Bot' : 'Human'}. Click to toggle.`}
            >
              {player.isBot ? 'Bot' : 'Human'}
            </button>
          </div>
        ))}
      </div>
      <div className="player-actions">
        <button onClick={removePlayer} disabled={players.length <= 3} aria-label="Remove last player">- Remove</button>
        <button onClick={addPlayer} disabled={players.length >= 6} aria-label="Add a player">+ Add</button>
      </div>
    </div>
  );
}
