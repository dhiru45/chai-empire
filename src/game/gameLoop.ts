import {
  BOT_NAMES,
  QUESTS,
  RANDOM_EVENTS,
  RESTOCK_MS,
  START_CUPS,
  START_MAX_STOCK,
  rollNextEventDelayMs,
} from './constants'
import {
  brewDeltaPerTick,
  buildRandomOrder,
  computeOrderPayout,
  customerIntervalSeconds,
  effectiveSeats,
  maxStockValue,
  maybeAddXp,
  orderSpawnMult,
  passiveIncomeAmount,
  seasonForDay,
} from './economy'
import type { GameEvent, GameState, QuestRuntime } from './types'

function cloneQuests(): QuestRuntime[] {
  return QUESTS.map((q) => ({
    ...q,
    progress: 0,
    completed: false,
  }))
}

export function createInitialState(): GameState {
  const now = Date.now()
  return {
    money: 50,
    reputation: 55,
    xp: 0,
    level: 1,
    day: 1,
    season: 'Spring',
    totalServed: 0,
    totalEarned: 0,
    brewProgress: 0,
    stock: START_CUPS,
    maxStock: START_MAX_STOCK,
    baseSeats: 4,
    orders: [],
    upgrades: Object.fromEntries(
      [
        'tea_quality',
        'ginger',
        'masala',
        'elaichi',
        'seats',
        'biscuits',
        'samosa',
        'pakoda',
        'stock',
        'speed',
        'global',
        'delivery',
        'franchise',
      ].map((id) => [id, 0]),
    ),
    quests: cloneQuests(),
    leaderboard: [],
    globalLeaderboard: [],
    activeEvent: null,
    settings: { sound: true, music: true, stallName: 'My Tapri' },
    restockUntil: 0,
    nextCustomerAt: now + 1800,
    nextEventAt: now + rollNextEventDelayMs(),
    passiveMs: 0,
    serveTimestamps: [],
    noTimeoutStreak: 0,
    lastLeaderboardTick: now,
    unlockedCosmetics: [],
    pendingLevelUp: null,
    pendingQuest: null,
    pendingEventChoice: null,
    nextVipMultiplier: 1,
    priceSurgeUntil: 0,
    screen: 'menu',
    gamePanelTab: 'orders',
    tickNonce: 0,
    lastTickAt: now,
  }
}

export function rebuildLeaderboard(state: GameState): GameState {
  const playerScore = Math.floor(state.totalEarned + state.money + state.totalServed * 5)
  const player: GameState['leaderboard'][0] = {
    id: 'player',
    name: state.settings.stallName || 'You',
    score: playerScore,
    level: state.level,
    isPlayer: true,
    date: new Date().toISOString(),
  }
  const bots = BOT_NAMES.map((name, i) => {
    const id = `bot_${i}`
    const seed = (state.tickNonce + i * 997) % 5000
    const score = Math.max(0, playerScore - 2000 + seed * 3 + i * 400)
    return {
      id,
      name,
      score,
      level: Math.max(1, Math.min(20, Math.floor(score / 800))),
      isPlayer: false as const,
    }
  })
  const leaderboard = [player, ...bots].sort((a, b) => b.score - a.score)
  return { ...state, leaderboard }
}

function rollEvent(): GameEvent {
  const tpl = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]!
  const duration =
    tpl.maxDurationMs > 0
      ? tpl.minDurationMs + Math.random() * (tpl.maxDurationMs - tpl.minDurationMs)
      : 0
  return {
    id: tpl.id,
    name: tpl.name,
    icon: tpl.icon,
    durationMs: duration,
    remainingMs: duration,
    effectKind: tpl.effectKind,
    effectValue: tpl.effectValue,
  }
}

export function getQuestProgress(state: GameState, q: QuestRuntime): number {
  const up = state.upgrades
  switch (q.kind) {
    case 'serve_total':
      return state.totalServed
    case 'earn_total':
      return Math.floor(state.totalEarned)
    case 'buy_any_snack':
      return Math.max(up.biscuits ?? 0, up.samosa ?? 0, up.pakoda ?? 0) >= 1 ? 1 : 0
    case 'speed_serve': {
      const now = Date.now()
      const recent = state.serveTimestamps.filter((t) => now - t <= 30_000)
      return recent.length
    }
    case 'no_timeout_streak':
      return state.noTimeoutStreak
    case 'serve_window': {
      const now = Date.now()
      const recent = state.serveTimestamps.filter((t) => now - t <= 45_000)
      return recent.length
    }
    case 'upgrade_level':
      return q.upgradeId ? (up[q.upgradeId] ?? 0) : 0
    case 'buy_upgrade_id':
      return q.upgradeId ? ((up[q.upgradeId] ?? 0) >= 1 ? 1 : 0) : 0
    case 'reputation':
      return Math.floor(state.reputation)
    case 'player_level':
      return state.level
    case 'buy_global':
      return (up.global ?? 0) >= 1 ? 1 : 0
    case 'max_seats_upgrade':
      return (up.seats ?? 0) >= 5 ? 1 : 0
    case 'buy_delivery':
      return (up.delivery ?? 0) >= 1 ? 1 : 0
    case 'buy_franchise':
      return (up.franchise ?? 0) >= 1 ? 1 : 0
    case 'max_speed_upgrade': {
      const def = q.upgradeId ?? 'speed'
      return (up[def] ?? 0) >= 4 ? 1 : 0
    }
    default:
      return 0
  }
}

function applyQuestCompletions(state: GameState): GameState {
  let next = state
  let pending: QuestRuntime | null = null
  for (const q of next.quests) {
    if (q.completed) continue
    const p = getQuestProgress(next, q)
    if (p >= q.target) {
      const completedQuest: QuestRuntime = { ...q, progress: q.target, completed: true }
      next = {
        ...next,
        quests: next.quests.map((x) => (x.id === q.id ? completedQuest : x)),
        money: next.money + q.rewardMoney,
        unlockedCosmetics: q.cosmeticUnlock
          ? [...next.unlockedCosmetics, q.cosmeticUnlock]
          : next.unlockedCosmetics,
      }
      next = maybeAddXp(next, q.rewardXp)
      pending = completedQuest
    }
  }
  return pending ? { ...next, pendingQuest: pending } : next
}

export function tickGame(state: GameState, now: number, dtMs: number): GameState {
  let next: GameState = {
    ...state,
    tickNonce: state.tickNonce + 1,
    lastTickAt: now,
    maxStock: maxStockValue(state),
  }

  const dtSec = dtMs / 1000

  if (next.restockUntil > 0 && now >= next.restockUntil) {
    next = { ...next, stock: next.maxStock, restockUntil: 0, brewProgress: 100 }
  }

  const passive = passiveIncomeAmount(next)
  if (passive > 0) {
    next = { ...next, passiveMs: next.passiveMs + dtMs }
    const step = 15_000
    while (next.passiveMs >= step) {
      next = { ...next, passiveMs: next.passiveMs - step, money: next.money + passive }
    }
  }

  if (next.priceSurgeUntil > 0 && now >= next.priceSurgeUntil) {
    next = { ...next, priceSurgeUntil: 0 }
  }

  if (next.activeEvent) {
    const ev = next.activeEvent
    if (ev.remainingMs > 0) {
      const rem = Math.max(0, ev.remainingMs - dtMs)
      if (rem <= 0) {
        next = { ...next, activeEvent: null }
        if (ev.effectKind === 'upgrade_cost') {
          next = { ...next, priceSurgeUntil: 0 }
        }
      } else {
        next = { ...next, activeEvent: { ...ev, remainingMs: rem } }
      }
    }
  }

  if (!next.activeEvent && !next.pendingEventChoice && now >= next.nextEventAt) {
    const evRoll = rollEvent()
    if (evRoll.id === 'health_inspector') {
      next = { ...next, pendingEventChoice: 'health_inspector', nextEventAt: now + rollNextEventDelayMs() }
    } else if (evRoll.id === 'vip') {
      next = {
        ...next,
        nextVipMultiplier: Math.max(next.nextVipMultiplier, evRoll.effectValue),
        nextEventAt: now + rollNextEventDelayMs(),
      }
    } else {
      const priceUntil =
        evRoll.effectKind === 'upgrade_cost' ? now + evRoll.remainingMs : next.priceSurgeUntil
      next = {
        ...next,
        activeEvent: evRoll,
        priceSurgeUntil: priceUntil,
        nextEventAt: now + rollNextEventDelayMs(),
      }
    }
  }

  const expired: string[] = []
  next = {
    ...next,
    orders: next.orders
      .map((o) => {
        const t = o.timer - dtSec
        if (t <= 0) {
          expired.push(o.id)
          return null
        }
        return { ...o, timer: t }
      })
      .filter(Boolean) as typeof next.orders,
  }

  if (expired.length) {
    const repDrop = Math.min(100, expired.length * 4)
    next = {
      ...next,
      reputation: Math.max(0, next.reputation - repDrop),
      noTimeoutStreak: 0,
    }
  }

  const restocking = next.restockUntil > 0 && now < next.restockUntil
  if (!restocking) {
    if (next.stock >= next.maxStock) {
      next = { ...next, brewProgress: 100 }
    } else {
      let bp = next.brewProgress
      if (bp >= 100) bp = 0
      bp += brewDeltaPerTick(next, dtSec)
      let st = next.stock
      while (bp >= 100 && st < next.maxStock) {
        bp -= 100
        st += 1
      }
      if (st >= next.maxStock) {
        next = { ...next, stock: next.maxStock, brewProgress: 100 }
      } else {
        next = { ...next, stock: st, brewProgress: bp }
      }
    }
  }

  const seats = effectiveSeats(next)
  const spawnMult = orderSpawnMult(next)
  if (next.orders.length < seats && now >= next.nextCustomerAt) {
    const order = buildRandomOrder(next)
    if (order) {
      let vip = 1
      if (next.nextVipMultiplier > 1) {
        vip = next.nextVipMultiplier
      }
      const o = vip > 1 ? { ...order, vipMultiplier: vip } : order
      next = {
        ...next,
        orders: [...next.orders, o],
        nextVipMultiplier: 1,
        nextCustomerAt: now + customerIntervalSeconds(next) * 1000,
      }
    } else {
      next = { ...next, nextCustomerAt: now + 800 }
    }
  }

  if (
    spawnMult > 1.2 &&
    next.orders.length < seats &&
    Math.random() < 0.04 * (spawnMult - 1)
  ) {
    const extra = buildRandomOrder(next)
    if (extra && next.orders.length < seats)
      next = { ...next, orders: [...next.orders, extra] }
  }

  if (now - next.lastLeaderboardTick >= 10_000) {
    next = rebuildLeaderboard({ ...next, lastLeaderboardTick: now })
    for (const row of next.leaderboard) {
      if (!row.isPlayer) {
        row.score += Math.floor(30 + Math.random() * 120)
      }
    }
    next.leaderboard.sort((a, b) => b.score - a.score)
  }

  next = applyQuestCompletions(next)

  if (next.totalServed > 0 && next.totalServed % 100 === 0) {
    next = { ...next, day: next.day + 1, season: seasonForDay(next.day) }
  }

  return next
}

export function serveOrder(state: GameState, orderId: string, now: number): GameState {
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) return state
  if (state.stock <= 0) return state

  const payout = computeOrderPayout(state, order)
  let next: GameState = {
    ...state,
    orders: state.orders.filter((o) => o.id !== orderId),
    stock: state.stock - 1,
    money: state.money + payout,
    totalEarned: state.totalEarned + payout,
    totalServed: state.totalServed + 1,
    reputation: Math.min(100, state.reputation + 1.2),
    serveTimestamps: [...state.serveTimestamps, now].filter((t) => now - t <= 60_000),
    noTimeoutStreak: state.noTimeoutStreak + 1,
    nextVipMultiplier: 1,
  }

  if (order.vipMultiplier) {
    next = { ...next, nextVipMultiplier: 1 }
  }

  if (next.stock <= 0) {
    next = { ...next, restockUntil: now + RESTOCK_MS }
  }

  next = maybeAddXp(next, 4 + Math.floor(payout / 20))
  next = applyQuestCompletions(next)
  return rebuildLeaderboard(next)
}

export function purchaseUpgrade(state: GameState, upgradeId: string, cost: number): GameState {
  if (state.money < cost) return state
  const level = state.upgrades[upgradeId] ?? 0
  let next: GameState = {
    ...state,
    money: state.money - cost,
    upgrades: { ...state.upgrades, [upgradeId]: level + 1 },
  }
  if (upgradeId === 'stock') {
    next = { ...next, maxStock: maxStockValue(next), stock: Math.min(next.stock + 5, maxStockValue(next)) }
  }
  next = applyQuestCompletions(next)
  return next
}

export function resolveHealthInspector(state: GameState, payFine: boolean): GameState {
  if (state.pendingEventChoice !== 'health_inspector') return state
  let next = { ...state, pendingEventChoice: null }
  if (payFine && next.money >= 30) {
    next = { ...next, money: next.money - 30 }
  } else {
    next = { ...next, reputation: Math.max(0, next.reputation - 10) }
  }
  return next
}

export { cloneQuests }
