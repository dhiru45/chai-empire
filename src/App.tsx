import { useEffect, useState } from 'react'
import { GameScreen } from './components/GameScreen'
import { LeaderboardPanel } from './components/LeaderboardPanel'
import { MainMenu } from './components/MainMenu'
import { SettingsScreen } from './components/SettingsScreen'
import { startGameLoop, useGameStore } from './store/gameStore'

function MenuLeaderboard() {
  const leaderboard = useGameStore((s) => s.leaderboard)
  const globalBoard = useGameStore((s) => s.globalLeaderboard)
  const refreshGlobalBoard = useGameStore((s) => s.refreshGlobalBoard)
  const backToMenu = useGameStore((s) => s.backToMenu)
  const [tab, setTab] = useState<'local' | 'global'>('local')

  useEffect(() => {
    void refreshGlobalBoard()
  }, [refreshGlobalBoard])

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-primary)] px-4 py-8 text-[var(--cream)]">
      <div className="mx-auto max-w-lg space-y-4">
        <button type="button" className="text-sm text-[var(--gold)] underline" onClick={backToMenu}>
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-[var(--gold)]">Leaderboard</h1>
        <LeaderboardPanel local={leaderboard} global={globalBoard} tab={tab} onTab={setTab} />
      </div>
    </div>
  )
}

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const startNewGame = useGameStore((s) => s.startNewGame)
  const continueGame = useGameStore((s) => s.continueGame)
  const openLeaderboard = useGameStore((s) => s.openLeaderboard)
  const openSettings = useGameStore((s) => s.openSettings)
  const backToMenu = useGameStore((s) => s.backToMenu)

  useEffect(() => {
    const id = startGameLoop()
    return () => clearInterval(id)
  }, [])

  if (screen === 'menu') {
    return (
      <MainMenu
        onStart={startNewGame}
        onContinue={continueGame}
        onLeaderboard={openLeaderboard}
        onSettings={openSettings}
      />
    )
  }
  if (screen === 'settings') {
    return <SettingsScreen onBack={backToMenu} />
  }
  if (screen === 'leaderboard') {
    return <MenuLeaderboard />
  }
  return <GameScreen />
}
