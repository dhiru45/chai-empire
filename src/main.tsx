import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { persistGame } from './game/persistence'
import type { GameState } from './game/types'
import { hydrateStoreFromPersistence, useGameStore } from './store/gameStore'

function flushOnLeave() {
  persistGame(useGameStore.getState() as GameState)
}

void hydrateStoreFromPersistence().then(() => {
  window.addEventListener('pagehide', flushOnLeave)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnLeave()
  })
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
