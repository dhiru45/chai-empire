import type { QuestDef, Season } from './types'

export const SAVE_KEY = 'chaiEmpireState'
export const TICK_MS = 200
export const START_MONEY = 50
/** Base max stock at upgrade level 0 (`maxStock = START_MAX_STOCK + stockUpgrade * 5`). */
export const START_MAX_STOCK = 10
/** Cups in kettle when starting a new game (must be ≤ initial max stock). */
export const START_CUPS = 5
export const START_BASE_SEATS = 4
export const RESTOCK_MS = 3000
/** Progress toward next brewed cup (% per second); 100% completes one cup in ~7s before speed bonuses. */
export const BREW_PCT_PER_SEC = 100 / 7
export const COST_MULT = 1.6
export const MIN_ORDER_TIMER = 10

export const BOT_NAMES = [
  'Delhi Dhaba',
  'Mumbai Tapri',
  'Kolkata Kadak',
  'Chennai Filter',
  'Pune Irani',
] as const

export const SEASONS: Season[] = ['Spring', 'Summer', 'Monsoon', 'Winter']

export interface UpgradeDef {
  id: string
  name: string
  icon: string
  baseCost: number
  maxLevel: number
  description: string
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'tea_quality',
    name: 'Premium Tea Leaves',
    icon: '🍃',
    baseCost: 30,
    maxLevel: 5,
    description: '+20% revenue per level',
  },
  {
    id: 'ginger',
    name: 'Adrak Chai',
    icon: '🫚',
    baseCost: 50,
    maxLevel: 3,
    description: '+15% order volume per level',
  },
  {
    id: 'masala',
    name: 'Masala Chai',
    icon: '🌶️',
    baseCost: 80,
    maxLevel: 3,
    description: '+25% revenue per level',
  },
  {
    id: 'elaichi',
    name: 'Elaichi Chai',
    icon: '🌿',
    baseCost: 60,
    maxLevel: 3,
    description: '+10% tips per level',
  },
  {
    id: 'seats',
    name: 'More Seats',
    icon: '🪑',
    baseCost: 60,
    maxLevel: 5,
    description: '+1 seat per level',
  },
  {
    id: 'biscuits',
    name: 'Biscuits',
    icon: '🍪',
    baseCost: 40,
    maxLevel: 3,
    description: '+₹5 upsell per order',
  },
  {
    id: 'samosa',
    name: 'Samosa Counter',
    icon: '🥟',
    baseCost: 100,
    maxLevel: 3,
    description: '+₹15 upsell per order',
  },
  {
    id: 'pakoda',
    name: 'Pakoda Station',
    icon: '🧅',
    baseCost: 80,
    maxLevel: 3,
    description: '+₹12 upsell per order',
  },
  {
    id: 'stock',
    name: 'Larger Stock',
    icon: '📦',
    baseCost: 35,
    maxLevel: 5,
    description: '+5 max stock per level',
  },
  {
    id: 'speed',
    name: 'Faster Brew',
    icon: '⚡',
    baseCost: 70,
    maxLevel: 4,
    description: '+30% brew speed per level',
  },
  {
    id: 'global',
    name: 'Global Recipes',
    icon: '🌍',
    baseCost: 200,
    maxLevel: 1,
    description: 'Unlocks Matcha, Oolong, Lemon Tea',
  },
  {
    id: 'delivery',
    name: 'Delivery Scooter',
    icon: '🛵',
    baseCost: 150,
    maxLevel: 3,
    description: '+₹8 passive income / 15s per level',
  },
  {
    id: 'franchise',
    name: '2nd Stall',
    icon: '🏪',
    baseCost: 500,
    maxLevel: 1,
    description: 'Doubles passive income',
  },
]

export interface FlavorDef {
  id: string
  label: string
  basePrice: number
  unlock: (ctx: { level: number; upgrades: Record<string, number> }) => boolean
}

export const FLAVORS: FlavorDef[] = [
  {
    id: 'plain',
    label: 'Plain Chai',
    basePrice: 15,
    unlock: () => true,
  },
  {
    id: 'elaichi',
    label: 'Elaichi Chai',
    basePrice: 18,
    unlock: () => true,
  },
  {
    id: 'adrak',
    label: 'Adrak Chai',
    basePrice: 20,
    unlock: ({ upgrades }) => (upgrades.ginger ?? 0) >= 1,
  },
  {
    id: 'masala',
    label: 'Masala Chai',
    basePrice: 25,
    unlock: ({ upgrades }) => (upgrades.masala ?? 0) >= 1,
  },
  {
    id: 'lemon',
    label: 'Lemon Tea',
    basePrice: 22,
    unlock: ({ upgrades }) => (upgrades.global ?? 0) >= 1,
  },
  {
    id: 'matcha',
    label: 'Matcha Latte',
    basePrice: 30,
    unlock: ({ upgrades }) => (upgrades.global ?? 0) >= 1,
  },
  {
    id: 'oolong',
    label: 'Oolong Tea',
    basePrice: 28,
    unlock: ({ upgrades }) => (upgrades.global ?? 0) >= 1,
  },
  {
    id: 'kahwa',
    label: 'Kashmiri Kahwa',
    basePrice: 35,
    unlock: ({ level }) => level >= 7,
  },
]

export interface SnackDef {
  id: string
  label: string
  upsell: number
  unlock: (ctx: { level: number; upgrades: Record<string, number> }) => boolean
}

export const SNACKS: SnackDef[] = [
  {
    id: 'biscuits',
    label: 'Parle-G Biscuits',
    upsell: 5,
    unlock: ({ upgrades }) => (upgrades.biscuits ?? 0) >= 1,
  },
  {
    id: 'samosa',
    label: 'Samosa',
    upsell: 15,
    unlock: ({ upgrades }) => (upgrades.samosa ?? 0) >= 1,
  },
  {
    id: 'pakoda',
    label: 'Pakoda',
    upsell: 12,
    unlock: ({ upgrades }) => (upgrades.pakoda ?? 0) >= 1,
  },
  {
    id: 'bread_pakoda',
    label: 'Bread Pakoda',
    upsell: 18,
    unlock: ({ level }) => level >= 5,
  },
  {
    id: 'vada_pav',
    label: 'Vada Pav',
    upsell: 20,
    unlock: ({ level }) => level >= 8,
  },
]

export const QUESTS: QuestDef[] = [
  {
    id: 'first_cup',
    title: 'First Cup',
    description: 'Serve 1 chai',
    tier: 1,
    kind: 'serve_total',
    target: 1,
    rewardMoney: 20,
    rewardXp: 15,
  },
  {
    id: 'morning_rush',
    title: 'Morning Rush',
    description: 'Serve 10 customers',
    tier: 1,
    kind: 'serve_total',
    target: 10,
    rewardMoney: 50,
    rewardXp: 25,
  },
  {
    id: 'chai_wala',
    title: 'Chai Wala',
    description: 'Earn ₹200 total',
    tier: 1,
    kind: 'earn_total',
    target: 200,
    rewardMoney: 80,
    rewardXp: 30,
  },
  {
    id: 'snack_attack',
    title: 'Snack Attack',
    description: 'Buy any snack upgrade',
    tier: 1,
    kind: 'buy_any_snack',
    target: 1,
    rewardMoney: 60,
    rewardXp: 20,
    cosmeticUnlock: 'banner_snack',
  },
  {
    id: 'speed_serve',
    title: 'Speed Serve',
    description: 'Serve 5 orders in 30 seconds',
    tier: 1,
    kind: 'speed_serve',
    target: 5,
    rewardMoney: 80,
    rewardXp: 35,
  },
  {
    id: 'regular_customers',
    title: 'Regular Customers',
    description: 'Serve 50 customers',
    tier: 2,
    kind: 'serve_total',
    target: 50,
    rewardMoney: 150,
    rewardXp: 40,
  },
  {
    id: 'masala_king',
    title: 'Masala King',
    description: 'Buy Masala Chai upgrade',
    tier: 2,
    kind: 'buy_upgrade_id',
    target: 1,
    rewardMoney: 100,
    rewardXp: 35,
    upgradeId: 'masala',
  },
  {
    id: 'premium_blend',
    title: 'Premium Blend',
    description: 'Upgrade tea quality 3 times',
    tier: 2,
    kind: 'upgrade_level',
    target: 3,
    rewardMoney: 120,
    rewardXp: 45,
    upgradeId: 'tea_quality',
  },
  {
    id: 'no_waste',
    title: 'No Waste',
    description: 'Serve 20 orders without a timeout',
    tier: 2,
    kind: 'no_timeout_streak',
    target: 20,
    rewardMoney: 100,
    rewardXp: 40,
  },
  {
    id: 'peak_hour',
    title: 'Peak Hour',
    description: 'Serve 10 customers in 45 seconds',
    tier: 2,
    kind: 'serve_window',
    target: 10,
    rewardMoney: 90,
    rewardXp: 40,
  },
  {
    id: 'tycoon',
    title: 'Tycoon',
    description: 'Earn ₹1000 total',
    tier: 3,
    kind: 'earn_total',
    target: 1000,
    rewardMoney: 300,
    rewardXp: 80,
  },
  {
    id: 'global_chai',
    title: 'Global Chai',
    description: 'Unlock Global Recipes',
    tier: 3,
    kind: 'buy_global',
    target: 1,
    rewardMoney: 250,
    rewardXp: 70,
    cosmeticUnlock: 'banner_global',
  },
  {
    id: 'full_house',
    title: 'Full House',
    description: 'Max out seats upgrade',
    tier: 3,
    kind: 'max_seats_upgrade',
    target: 1,
    rewardMoney: 200,
    rewardXp: 60,
  },
  {
    id: 'delivery_king',
    title: 'Delivery King',
    description: 'Buy Delivery Scooter',
    tier: 3,
    kind: 'buy_delivery',
    target: 1,
    rewardMoney: 180,
    rewardXp: 55,
  },
  {
    id: 'rep_80',
    title: 'Beloved Stall',
    description: 'Reach 80 reputation',
    tier: 3,
    kind: 'reputation',
    target: 80,
    rewardMoney: 220,
    rewardXp: 65,
  },
  {
    id: 'empire_builder',
    title: 'Empire Builder',
    description: 'Reach Level 5',
    tier: 4,
    kind: 'player_level',
    target: 5,
    rewardMoney: 500,
    rewardXp: 120,
  },
  {
    id: 'chai_mogul',
    title: 'Chai Mogul',
    description: 'Earn ₹5000 total',
    tier: 4,
    kind: 'earn_total',
    target: 5000,
    rewardMoney: 800,
    rewardXp: 200,
  },
  {
    id: 'master_brewer',
    title: 'Master Brewer',
    description: 'Max Faster Brew upgrade',
    tier: 4,
    kind: 'max_speed_upgrade',
    target: 1,
    rewardMoney: 400,
    rewardXp: 100,
    upgradeId: 'speed',
  },
  {
    id: 'franchise_owner',
    title: 'Franchise Owner',
    description: 'Buy 2nd Stall',
    tier: 4,
    kind: 'buy_franchise',
    target: 1,
    rewardMoney: 600,
    rewardXp: 150,
    cosmeticUnlock: 'banner_franchise',
  },
  {
    id: 'legend',
    title: 'Legend of the Stall',
    description: 'Serve 500 customers',
    tier: 4,
    kind: 'serve_total',
    target: 500,
    rewardMoney: 1000,
    rewardXp: 250,
  },
]

export interface RandomEventTemplate {
  id: string
  name: string
  icon: string
  minDurationMs: number
  maxDurationMs: number
  effectKind: import('./types').EventEffectKind
  effectValue: number
}

export const RANDOM_EVENTS: RandomEventTemplate[] = [
  {
    id: 'india_pak_match',
    name: 'India vs Pakistan Match',
    icon: '🏏',
    minDurationMs: 30_000,
    maxDurationMs: 30_000,
    effectKind: 'order_volume',
    effectValue: 0.5,
  },
  {
    id: 'monsoon',
    name: 'Monsoon Rain',
    icon: '🌧️',
    minDurationMs: 25_000,
    maxDurationMs: 25_000,
    effectKind: 'revenue',
    effectValue: 0.3,
  },
  {
    id: 'diwali',
    name: 'Diwali Festival',
    icon: '🎉',
    minDurationMs: 20_000,
    maxDurationMs: 20_000,
    effectKind: 'earnings_mult',
    effectValue: 2,
  },
  {
    id: 'rival',
    name: 'Rival Stall Opened',
    icon: '⚔️',
    minDurationMs: 20_000,
    maxDurationMs: 20_000,
    effectKind: 'customer_penalty',
    effectValue: 0.2,
  },
  {
    id: 'tourist_bus',
    name: 'Tourist Bus Arrived',
    icon: '✈️',
    minDurationMs: 15_000,
    maxDurationMs: 15_000,
    effectKind: 'order_volume',
    effectValue: 0.4,
  },
  {
    id: 'power_cut',
    name: 'Power Cut',
    icon: '⚡',
    minDurationMs: 20_000,
    maxDurationMs: 20_000,
    effectKind: 'brew_speed',
    effectValue: -0.5,
  },
  {
    id: 'health_inspector',
    name: 'Health Inspector',
    icon: '🧑‍⚕️',
    minDurationMs: 0,
    maxDurationMs: 0,
    effectKind: 'instant_choice',
    effectValue: 0,
  },
  {
    id: 'viral',
    name: 'Viral Video',
    icon: '📱',
    minDurationMs: 15_000,
    maxDurationMs: 15_000,
    effectKind: 'order_volume',
    effectValue: 1,
  },
  {
    id: 'price_surge',
    name: 'Price Surge',
    icon: '📈',
    minDurationMs: 30_000,
    maxDurationMs: 30_000,
    effectKind: 'upgrade_cost',
    effectValue: 0.4,
  },
  {
    id: 'vip',
    name: 'VIP Customer',
    icon: '👑',
    minDurationMs: 0,
    maxDurationMs: 0,
    effectKind: 'vip_next',
    effectValue: 3,
  },
]

export const EVENT_FIRE_MIN_MS = 60_000
export const EVENT_FIRE_MAX_MS = 120_000

export function rollNextEventDelayMs(): number {
  return EVENT_FIRE_MIN_MS + Math.random() * (EVENT_FIRE_MAX_MS - EVENT_FIRE_MIN_MS)
}

export function xpForNextLevel(level: number): number {
  return Math.floor(80 * Math.pow(level, 1.25))
}
