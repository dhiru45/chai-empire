import {
  BREW_PCT_PER_SEC,
  COST_MULT,
  FLAVORS,
  MIN_ORDER_TIMER,
  SNACKS,
  START_MAX_STOCK,
  xpForNextLevel,
} from './constants'
import type { GameEvent, GameState, Order } from './types'

export function getUpgradeLevel(state: GameState, id: string): number {
  return state.upgrades[id] ?? 0
}

export function upgradeCost(state: GameState, id: string, baseCost: number, maxLevel: number): number | null {
  const level = getUpgradeLevel(state, id)
  if (level >= maxLevel) return null
  const surge = state.priceSurgeUntil > Date.now() ? 1.4 : 1
  return Math.ceil(baseCost * Math.pow(COST_MULT, level) * surge)
}

export function effectiveSeats(state: GameState): number {
  const extra = getUpgradeLevel(state, 'seats')
  return state.baseSeats + extra
}

export function maxStockValue(state: GameState): number {
  const lvl = getUpgradeLevel(state, 'stock')
  return START_MAX_STOCK + lvl * 5
}

function qualityMult(state: GameState): number {
  const l = getUpgradeLevel(state, 'tea_quality')
  return 1 + 0.2 * l
}

function masalaRevenueMult(state: GameState): number {
  const l = getUpgradeLevel(state, 'masala')
  return 1 + 0.25 * l
}

function elaichiTipMult(state: GameState): number {
  const l = getUpgradeLevel(state, 'elaichi')
  return 1 + 0.1 * l
}

function eventRevenueMult(state: GameState): number {
  const ev = state.activeEvent
  if (!ev) return 1
  if (ev.effectKind === 'revenue') return 1 + ev.effectValue
  return 1
}

function eventEarningsMult(state: GameState): number {
  const ev = state.activeEvent
  if (ev?.effectKind === 'earnings_mult') return ev.effectValue
  return 1
}

export function computeOrderPayout(state: GameState, order: Order): number {
  const flavor = FLAVORS.find((f) => f.id === order.flavorId)
  if (!flavor) return 0
  let total = flavor.basePrice
  for (const sid of order.snackIds) {
    const s = SNACKS.find((x) => x.id === sid)
    if (s) total += s.upsell
  }
  total *= qualityMult(state) * masalaRevenueMult(state) * elaichiTipMult(state)
  total *= eventRevenueMult(state) * eventEarningsMult(state)
  if (state.activeEvent?.id === 'tourist_bus') {
    const globalIds = new Set(['lemon', 'matcha', 'oolong'])
    if (globalIds.has(order.flavorId)) total *= 1.15
  }
  if (order.vipMultiplier) total *= order.vipMultiplier
  return Math.max(1, Math.round(total))
}

export function brewRateMult(state: GameState): number {
  const speed = getUpgradeLevel(state, 'speed')
  let m = 1 + 0.3 * speed
  const ev = state.activeEvent
  if (ev?.effectKind === 'brew_speed') m *= 1 + ev.effectValue
  return Math.max(0.15, m)
}

export function brewDeltaPerTick(state: GameState, dtSec: number): number {
  return BREW_PCT_PER_SEC * brewRateMult(state) * dtSec
}

export function orderTimeLimitSeconds(level: number): number {
  return Math.max(MIN_ORDER_TIMER, 22 - level * 1)
}

export function customerIntervalSeconds(state: GameState): number {
  const rep = Math.max(0, Math.min(100, state.reputation))
  let base = 15 - (rep / 100) * 7
  const spawn = orderSpawnMult(state)
  base /= Math.max(0.35, spawn)
  return Math.max(2.5, base + (Math.random() * 2 - 1) * 0.4)
}

export function orderSpawnMult(state: GameState): number {
  let m = 1
  const g = getUpgradeLevel(state, 'ginger')
  m *= 1 + 0.15 * g
  const ev = state.activeEvent
  if (ev?.effectKind === 'order_volume') m *= 1 + ev.effectValue
  if (ev?.effectKind === 'customer_penalty') m *= 1 - ev.effectValue
  return Math.max(0.2, m)
}

export function passiveIncomeAmount(state: GameState): number {
  const d = getUpgradeLevel(state, 'delivery')
  if (d <= 0) return 0
  const mult = getUpgradeLevel(state, 'franchise') >= 1 ? 2 : 1
  return 8 * d * mult
}

export function pickWeightedUrgency(): Order['urgency'] {
  const r = Math.random()
  if (r < 0.2) return 'urgent'
  if (r < 0.55) return 'normal'
  return 'easy'
}

export function maybeAddXp(state: GameState, amount: number): GameState {
  let { xp, level } = state
  xp += amount
  let pending = state.pendingLevelUp
  const capLevel = 99
  while (level < capLevel) {
    const need = xpForNextLevel(level)
    if (xp < need) break
    xp -= need
    level += 1
    const unlock =
      level === 7 ? 'Kashmiri Kahwa' : level === 5 ? 'Bread Pakoda' : level === 8 ? 'Vada Pav' : undefined
    pending = { level, unlock }
  }
  return { ...state, xp, level, pendingLevelUp: pending ?? state.pendingLevelUp }
}

export function seasonForDay(day: number): GameState['season'] {
  const idx = Math.floor(((day - 1) % 20) / 5)
  const seasons: GameState['season'][] = ['Spring', 'Summer', 'Monsoon', 'Winter']
  return seasons[Math.min(3, Math.max(0, idx))]
}

export function formatOrderLabel(order: Order): { title: string; subtitle: string } {
  const flavor = FLAVORS.find((f) => f.id === order.flavorId)
  const snackLabels = order.snackIds
    .map((id) => SNACKS.find((s) => s.id === id)?.label)
    .filter(Boolean) as string[]
  return {
    title: flavor?.label ?? 'Chai',
    subtitle: snackLabels.length ? snackLabels.join(', ') : 'No snacks',
  }
}

export function isFlavorUnlocked(state: GameState, flavorId: string): boolean {
  const f = FLAVORS.find((x) => x.id === flavorId)
  if (!f) return false
  return f.unlock({ level: state.level, upgrades: state.upgrades })
}

export function isSnackUnlocked(state: GameState, snackId: string): boolean {
  const s = SNACKS.find((x) => x.id === snackId)
  if (!s) return false
  return s.unlock({ level: state.level, upgrades: state.upgrades })
}

export function buildRandomOrder(state: GameState): Order | null {
  const flavors = FLAVORS.filter((f) => f.unlock({ level: state.level, upgrades: state.upgrades }))
  if (!flavors.length) return null
  const flavor = flavors[Math.floor(Math.random() * flavors.length)]!
  const snacksUnlocked = SNACKS.filter((s) =>
    s.unlock({ level: state.level, upgrades: state.upgrades }),
  )
  const snackIds: string[] = []
  if (snacksUnlocked.length && Math.random() < 0.55) {
    const count = Math.random() < 0.2 && snacksUnlocked.length > 1 ? 2 : 1
    const pool = [...snacksUnlocked]
    for (let i = 0; i < count && pool.length; i++) {
      const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
      if (pick) snackIds.push(pick.id)
    }
  }
  const timeLimit = orderTimeLimitSeconds(state.level)
  const urgency = pickWeightedUrgency()
  const timer =
    urgency === 'urgent' ? timeLimit * 0.72 : urgency === 'easy' ? timeLimit * 1.08 : timeLimit
  return {
    id: `o_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    flavorId: flavor.id,
    snackIds,
    timeLimit,
    timer: Math.max(MIN_ORDER_TIMER, timer),
    urgency,
  }
}

export function eventMultiplierSummary(ev: GameEvent | null): string {
  if (!ev) return ''
  switch (ev.effectKind) {
    case 'order_volume':
      return `+${Math.round(ev.effectValue * 100)}% orders`
    case 'revenue':
      return `+${Math.round(ev.effectValue * 100)}% chai prices`
    case 'earnings_mult':
      return `${ev.effectValue}× earnings`
    case 'customer_penalty':
      return `-${Math.round(ev.effectValue * 100)}% customer flow`
    case 'brew_speed':
      return `${ev.effectValue >= 0 ? '+' : ''}${Math.round(ev.effectValue * 100)}% brew`
    case 'upgrade_cost':
      return `+${Math.round(ev.effectValue * 100)}% upgrade costs`
    default:
      return ev.name
  }
}
