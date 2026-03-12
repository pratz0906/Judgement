import type { RoundMode } from '../../logic/round';
import { getMaxCardsPerPlayer } from '../../logic/round';

interface Props {
  playerCount: number;
  mode: RoundMode;
  customRounds: string;
  onModeChange: (mode: RoundMode) => void;
  onCustomChange: (value: string) => void;
}

export default function RoundConfig({ playerCount, mode, customRounds, onModeChange, onCustomChange }: Props) {
  const maxCards = getMaxCardsPerPlayer(playerCount);

  return (
    <div className="round-config" role="region" aria-label="Round structure configuration">
      <h3>Round Structure</h3>
      <fieldset className="round-options">
        <legend className="sr-only">Choose a round structure</legend>
        <label className={mode === 'upDown' ? 'selected' : ''}>
          <input type="radio" name="roundMode" checked={mode === 'upDown'} onChange={() => onModeChange('upDown')} />
          Up & Down (1 to {maxCards} to 1)
        </label>
        <label className={mode === 'upOnly' ? 'selected' : ''}>
          <input type="radio" name="roundMode" checked={mode === 'upOnly'} onChange={() => onModeChange('upOnly')} />
          Up Only (1 to {maxCards})
        </label>
        <label className={mode === 'downOnly' ? 'selected' : ''}>
          <input type="radio" name="roundMode" checked={mode === 'downOnly'} onChange={() => onModeChange('downOnly')} />
          Down Only ({maxCards} to 1)
        </label>
        <label className={mode === 'custom' ? 'selected' : ''}>
          <input type="radio" name="roundMode" checked={mode === 'custom'} onChange={() => onModeChange('custom')} />
          Custom
        </label>
      </fieldset>
      {mode === 'custom' && (
        <div className="custom-rounds">
          <label htmlFor="custom-rounds-input" className="sr-only">Custom round structure</label>
          <input
            id="custom-rounds-input"
            type="text"
            placeholder={`e.g., 1,2,3,4,3,2,1 (max ${maxCards} per round)`}
            value={customRounds}
            onChange={e => onCustomChange(e.target.value)}
            className="custom-input"
          />
          <small>Comma-separated card counts per round. Max {maxCards} cards per round.</small>
        </div>
      )}
    </div>
  );
}
