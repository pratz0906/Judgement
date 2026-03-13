import './App.css'
import { GameProvider, useGame } from './context/GameContext'
import SetupScreen from './components/setup/SetupScreen'
import GameScreen from './components/game/GameScreen'
import StatsScreen from './components/stats/StatsScreen'
import HistoryScreen from './components/stats/HistoryScreen'

function AppContent() {
  const { state, currentView } = useGame();

  if (currentView === 'stats') return <StatsScreen />;
  if (currentView === 'history') return <HistoryScreen />;

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
