import { create } from 'zustand'
import { TICK_MS } from '../game/constants'
import {
  createInitialState,
  purchaseUpgrade,
  rebuildLeaderboard,
  resolveHealthInspector,
  serveOrder,
  tickGame,
} from '../game/gameLoop'
import { clearAllPersistence, loadFromStorage, loadMergedState, persistGame } from '../game/persistence'
import type { GameState } from '../game/types'
import { upgradeCost } from '../game/economy'
import { UPGRADES } from '../game/constants'

let lastSaveAt = 0

type GameStore = GameState & {
  tick: () => void
  startNewGame: () => void
  continueGame: () => void
  openSettings: () => void
  openLeaderboard: () => void
  backToMenu: () => void
  enterGame: () => void
  serve: (orderId: string) => void
  buyUpgrade: (id: string) => void
  setTab: (tab: GameState['gamePanelTab']) => void
  dismissLevelUp: () => void
  dismissQuest: () => void
  updateSettings: (patch: Partial<GameState['settings']>) => void
  resetGame: () => void
  resolveInspector: (payFine: boolean) => void
  importState: (state: GameState) => void
  refreshGlobalBoard: () => Promise<void>
}

let lastTick = Date.now()

export const useGameStore = create<GameStore>((set, get) => ({
  ...rebuildLeaderboard(createInitialState()),

  tick: () => {
    const now = Date.now()
    const dt = Math.min(250, now - lastTick)
    lastTick = now
    set((s) => tickGame(s, now, dt))
    if (now - lastSaveAt > 2000) {
      lastSaveAt = now
      persistGame(get() as GameState)
    }
  },

  startNewGame: () => {
    lastTick = Date.now()
    lastSaveAt = Date.now()
    const fresh = rebuildLeaderboard(createInitialState())
    set({ ...fresh, screen: 'game' })
    persistGame(get() as GameState)
  },

  continueGame: () => {
    lastTick = Date.now()
    lastSaveAt = Date.now()
    const loaded = loadFromStorage()
    const base = loaded ? rebuildLeaderboard(loaded) : rebuildLeaderboard(createInitialState())
    set({ ...base, screen: 'game' })
    persistGame(get() as GameState)
  },

  openSettings: () => set({ screen: 'settings' }),
  openLeaderboard: () => set({ screen: 'leaderboard' }),
  backToMenu: () => set({ screen: 'menu' }),

  enterGame: () => {
    lastTick = Date.now()
    set({ screen: 'game' })
  },

  serve: (orderId: string) => {
    const now = Date.now()
    set((s) => serveOrder(s, orderId, now))
    persistGame(get() as GameState)
  },

  buyUpgrade: (id: string) => {
    const def = UPGRADES.find((u) => u.id === id)
    if (!def) return
    const s = get()
    const cost = upgradeCost(s, id, def.baseCost, def.maxLevel)
    if (cost == null) return
    set((st) => purchaseUpgrade(st, id, cost))
    persistGame(get() as GameState)
  },

  setTab: (tab) => set({ gamePanelTab: tab }),

  dismissLevelUp: () => set({ pendingLevelUp: null }),

  dismissQuest: () => set({ pendingQuest: null }),

  updateSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }))
    persistGame(get() as GameState)
  },

  resetGame: () => {
    lastTick = Date.now()
    lastSaveAt = Date.now()
    void clearAllPersistence()
    set(createInitialState())
  },

  resolveInspector: (payFine: boolean) => {
    set((s) => resolveHealthInspector(s, payFine))
    persistGame(get() as GameState)
  },

  importState: (state: GameState) => {
    set(rebuildLeaderboard({ ...state, screen: 'game' }))
    persistGame(get() as GameState)
  },

  refreshGlobalBoard: async () => {
    const url = import.meta.env.VITE_LEADERBOARD_URL as string | undefined
    if (!url) return
    try {
      const res = await fetch(url)
      if (!res.ok) return
      const data = (await res.json()) as { entries?: GameState['globalLeaderboard'] }
      if (Array.isArray(data.entries)) {
        set({ globalLeaderboard: data.entries })
      }
    } catch {
      /* ignore */
    }
  },
}))

/** Call once before React mounts so saves load from IndexedDB + localStorage. */
export async function hydrateStoreFromPersistence(): Promise<void> {
  const loaded = await loadMergedState()
  if (loaded) {
    const next = rebuildLeaderboard({ ...loaded, screen: 'menu' })
    useGameStore.setState(next)
    persistGame(next)
  }
}

export function startGameLoop() {
  lastTick = Date.now()
  return window.setInterval(() => {
    useGameStore.getState().tick()
  }, TICK_MS)
}
