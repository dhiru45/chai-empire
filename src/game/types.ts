export type Season = 'Spring' | 'Summer' | 'Monsoon' | 'Winter'

export type OrderUrgency = 'urgent' | 'normal' | 'easy'

export interface Order {
  id: string
  flavorId: string
  snackIds: string[]
  timeLimit: number
  timer: number
  urgency: OrderUrgency
  vipMultiplier?: number
}

export interface Settings {
  sound: boolean
  music: boolean
  stallName: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  score: number
  level: number
  isPlayer?: boolean
  date?: string
}

export type EventEffectKind =
  | 'order_volume'
  | 'revenue'
  | 'earnings_mult'
  | 'customer_penalty'
  | 'brew_speed'
  | 'upgrade_cost'
  | 'global_boost'
  | 'instant_choice'
  | 'vip_next'

export interface GameEvent {
  id: string
  name: string
  icon: string
  durationMs: number
  remainingMs: number
  effectKind: EventEffectKind
  effectValue: number
}

export type QuestKind =
  | 'serve_total'
  | 'earn_total'
  | 'buy_upgrade_id'
  | 'buy_any_snack'
  | 'speed_serve'
  | 'no_timeout_streak'
  | 'serve_window'
  | 'upgrade_level'
  | 'reputation'
  | 'player_level'
  | 'buy_global'
  | 'max_seats_upgrade'
  | 'buy_delivery'
  | 'buy_franchise'
  | 'max_speed_upgrade'

export interface QuestDef {
  id: string
  title: string
  description: string
  tier: 1 | 2 | 3 | 4
  kind: QuestKind
  target: number
  rewardMoney: number
  rewardXp: number
  upgradeId?: string
  cosmeticUnlock?: string
}

export interface QuestRuntime extends QuestDef {
  progress: number
  completed: boolean
}

export interface GameState {
  money: number
  reputation: number
  xp: number
  level: number
  day: number
  season: Season
  totalServed: number
  totalEarned: number
  brewProgress: number
  stock: number
  maxStock: number
  baseSeats: number
  orders: Order[]
  upgrades: Record<string, number>
  quests: QuestRuntime[]
  leaderboard: LeaderboardEntry[]
  globalLeaderboard: LeaderboardEntry[]
  activeEvent: GameEvent | null
  settings: Settings
  restockUntil: number
  nextCustomerAt: number
  nextEventAt: number
  passiveMs: number
  serveTimestamps: number[]
  noTimeoutStreak: number
  lastLeaderboardTick: number
  unlockedCosmetics: string[]
  pendingLevelUp: { level: number; unlock?: string } | null
  pendingQuest: QuestRuntime | null
  pendingEventChoice: 'health_inspector' | null
  nextVipMultiplier: number
  priceSurgeUntil: number
  screen: 'menu' | 'game' | 'settings' | 'leaderboard'
  gamePanelTab: 'orders' | 'upgrades' | 'market'
  tickNonce: number
  lastTickAt: number
}

export interface GlobalScorePayload {
  name: string
  score: number
  level: number
  date: string
}
