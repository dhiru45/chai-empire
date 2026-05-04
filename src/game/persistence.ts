import { QUESTS, SAVE_KEY, rollNextEventDelayMs } from './constants'
import { createInitialState } from './gameLoop'
import type { GameState, QuestRuntime } from './types'

const IDB_NAME = 'chai-empire'
const IDB_STORE = 'game-save'
const IDB_VERSION = 1

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'))
      return
    }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IDB open failed'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
  })
}

function runIdbRead<T>(apply: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  return openIdb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        let settled = false
        const finish = (err: unknown, val?: T) => {
          if (settled) return
          settled = true
          db.close()
          if (err) reject(err instanceof Error ? err : new Error(String(err)))
          else resolve(val)
        }
        try {
          const tx = db.transaction(IDB_STORE, 'readonly')
          tx.onerror = () => finish(tx.error)
          const req = apply(tx.objectStore(IDB_STORE))
          req.onerror = () => finish(req.error)
          req.onsuccess = () => finish(undefined, req.result as T)
        } catch (e) {
          finish(e)
        }
      }),
  )
}

function runIdbWrite(apply: (store: IDBObjectStore) => void): Promise<void> {
  return openIdb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        let settled = false
        const finish = (err?: unknown) => {
          if (settled) return
          settled = true
          db.close()
          if (err) reject(err instanceof Error ? err : new Error(String(err)))
          else resolve()
        }
        try {
          const tx = db.transaction(IDB_STORE, 'readwrite')
          tx.oncomplete = () => finish()
          tx.onerror = () => finish(tx.error)
          tx.onabort = () => finish(tx.error ?? new Error('IDB transaction aborted'))
          apply(tx.objectStore(IDB_STORE))
        } catch (e) {
          finish(e)
        }
      }),
  )
}

async function saveToIdb(state: GameState): Promise<void> {
  try {
    await runIdbWrite((store) => {
      store.put(state, SAVE_KEY)
    })
  } catch {
    /* ignore */
  }
}

async function loadFromIdb(): Promise<GameState | null> {
  try {
    const raw = await runIdbRead((store) => store.get(SAVE_KEY))
    if (!raw || typeof raw !== 'object') return null
    return hydrateState(raw as Partial<GameState>)
  } catch {
    return null
  }
}

async function deleteIdbSave(): Promise<void> {
  try {
    await runIdbWrite((store) => {
      store.delete(SAVE_KEY)
    })
  } catch {
    /* ignore */
  }
}

function pickNewerState(a: GameState, b: GameState): GameState {
  const ta = typeof a.lastTickAt === 'number' ? a.lastTickAt : 0
  const tb = typeof b.lastTickAt === 'number' ? b.lastTickAt : 0
  return ta >= tb ? a : b
}

function mergeQuests(saved?: QuestRuntime[]): QuestRuntime[] {
  const byId = new Map((saved ?? []).map((q) => [q.id, q]))
  return QUESTS.map((def) => {
    const s = byId.get(def.id)
    return {
      ...def,
      progress: s?.progress ?? 0,
      completed: s?.completed ?? false,
    }
  })
}

export function hydrateState(raw: Partial<GameState> | null): GameState {
  const base = createInitialState()
  if (!raw || typeof raw !== 'object') return base
  const upgrades = { ...base.upgrades, ...(raw.upgrades ?? {}) }
  const now = Date.now()
  const merged: GameState = {
    ...base,
    ...raw,
    upgrades,
    orders: Array.isArray(raw.orders) ? raw.orders : base.orders,
    quests: mergeQuests(raw.quests),
    leaderboard: Array.isArray(raw.leaderboard) ? raw.leaderboard : base.leaderboard,
    globalLeaderboard: Array.isArray(raw.globalLeaderboard)
      ? raw.globalLeaderboard
      : base.globalLeaderboard,
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    unlockedCosmetics: Array.isArray(raw.unlockedCosmetics)
      ? raw.unlockedCosmetics
      : base.unlockedCosmetics,
    serveTimestamps: Array.isArray(raw.serveTimestamps) ? raw.serveTimestamps : [],
  }
  if (merged.nextEventAt < now) merged.nextEventAt = now + rollNextEventDelayMs()
  if (merged.nextCustomerAt < now) merged.nextCustomerAt = now + 800
  if (merged.restockUntil > 0 && merged.restockUntil < now - 60_000) {
    merged.restockUntil = 0
    merged.stock = Math.max(merged.stock, Math.min(merged.maxStock, merged.maxStock))
  }
  if (typeof merged.lastTickAt !== 'number') merged.lastTickAt = now
  return merged
}

export function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

/** Writes to localStorage (sync) and IndexedDB (async). Use for all in-game saves. */
export function persistGame(state: GameState): void {
  saveToStorage(state)
  void saveToIdb(state)
}

/**
 * Loads the newest save from IndexedDB and localStorage so progress survives tab close,
 * storage eviction quirks, and older builds that only used localStorage.
 */
export async function loadMergedState(): Promise<GameState | null> {
  let idbState: GameState | null = null
  try {
    idbState = await loadFromIdb()
  } catch {
    idbState = null
  }
  const lsState = loadFromStorage()
  if (!idbState && !lsState) return null
  if (!idbState) return lsState
  if (!lsState) return idbState
  return pickNewerState(idbState, lsState)
}

export async function clearAllPersistence(): Promise<void> {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    /* ignore */
  }
  await deleteIdbSave()
}

export function loadFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return hydrateState(JSON.parse(raw) as Partial<GameState>)
  } catch {
    return null
  }
}

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(SAVE_KEY)
  } catch {
    return false
  }
}

export function exportSave(state: GameState): string {
  return JSON.stringify(state, null, 2)
}

export function importSave(json: string): GameState | null {
  try {
    return hydrateState(JSON.parse(json) as Partial<GameState>)
  } catch {
    return null
  }
}

export async function fetchGlobalScores(): Promise<GameState['globalLeaderboard']> {
  const url = import.meta.env.VITE_LEADERBOARD_URL as string | undefined
  if (!url) return []
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = (await res.json()) as { entries?: GameState['globalLeaderboard'] }
    return Array.isArray(data.entries) ? data.entries : []
  } catch {
    return []
  }
}

export async function submitGlobalScore(state: GameState): Promise<void> {
  const url = import.meta.env.VITE_LEADERBOARD_URL as string | undefined
  if (!url) return
  const score = Math.floor(state.totalEarned + state.money + state.totalServed * 5)
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: state.settings.stallName,
        score,
        level: state.level,
        date: new Date().toISOString(),
      }),
    })
  } catch {
    /* optional */
  }
}
