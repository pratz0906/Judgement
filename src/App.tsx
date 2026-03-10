import './App.css'
import { GameProvider, useGame } from './context/GameContext'
import SetupScreen from './components/setup/SetupScreen'
import GameScreen from './components/game/GameScreen'

function AppContent() {
  const { state } = useGame();

  if (state.phase === 'setup') {
    return <SetupScreen />;
  }

  return <GameScreen />;
}

function App() {
  return (
    <GameProvider>
      <div className="app">
        <AppContent />
      </div>
    </GameProvider>
  );
}

export default App
