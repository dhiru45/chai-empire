import { memo } from 'react'
import type { Order } from '../game/types'

type Props = {
  orders: Order[]
  seats: number
  upgrades: Record<string, number>
}

export const StallScene = memo(function StallScene({ orders, seats, upgrades }: Props) {
  const samosa = (upgrades.samosa ?? 0) > 0
  const pakoda = (upgrades.pakoda ?? 0) > 0
  const biscuits = (upgrades.biscuits ?? 0) > 0
  const delivery = (upgrades.delivery ?? 0) > 0
  const franchise = (upgrades.franchise ?? 0) > 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--brown)] bg-gradient-to-b from-[#3b1a05] to-[#1a0a00] p-4">
      <div className="absolute inset-0 opacity-30">
        <StreetBackdrop />
      </div>
      <div className="relative grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Queue</p>
          <div className="flex min-h-[120px] flex-wrap items-end gap-2">
            {Array.from({ length: seats }).map((_, i) => {
              const filled = i < orders.length
              return (
                <div
                  key={i}
                  className={`customer-bob flex h-16 w-12 items-end justify-center rounded-lg border ${
                    filled
                      ? 'border-[var(--gold)]/60 bg-black/30'
                      : 'border-dashed border-[var(--muted)]/40 bg-black/10'
                  }`}
                >
                  <span className="mb-1 text-2xl">{filled ? '🧑' : '·'}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex flex-col items-center">
            <div className="flex gap-1">
              <span className="steam-line h-8 w-1 rounded-full bg-[var(--cream)]/35" />
              <span className="steam-line h-8 w-1 rounded-full bg-[var(--cream)]/35" />
              <span className="steam-line h-8 w-1 rounded-full bg-[var(--cream)]/35" />
            </div>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-[var(--brown)] bg-black/35 px-4 py-3">
              <span className="text-3xl">☕</span>
              <div>
                <p className="text-sm font-semibold text-[var(--gold)]">Kadak Kettle</p>
                <p className="text-[0.65rem] text-[var(--muted)]">Full boil · street heat</p>
              </div>
            </div>
            <div className="mt-2 h-2 w-24 rounded-full bg-gradient-to-r from-red-900 via-orange-600 to-amber-400" />
          </div>
          <MenuBoard samosa={samosa} pakoda={pakoda} biscuits={biscuits} />
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap gap-2 text-[0.7rem] text-[var(--muted)]">
        {samosa ? <span className="rounded-full bg-black/30 px-2 py-1">🥟 Samosa counter</span> : null}
        {pakoda ? <span className="rounded-full bg-black/30 px-2 py-1">🧅 Pakoda station</span> : null}
        {biscuits ? <span className="rounded-full bg-black/30 px-2 py-1">🍪 Biscuit jar</span> : null}
        {delivery ? <span className="rounded-full bg-black/30 px-2 py-1">🛵 Delivery</span> : null}
        {franchise ? <span className="rounded-full bg-black/30 px-2 py-1">🏪 2nd stall</span> : null}
      </div>
    </div>
  )
})

function MenuBoard({
  samosa,
  pakoda,
  biscuits,
}: {
  samosa: boolean
  pakoda: boolean
  biscuits: boolean
}) {
  return (
    <div className="w-full max-w-[220px] rounded-lg border-2 border-[var(--brown)] bg-[#2a1406] p-2 text-left shadow-inner">
      <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
        Menu
      </p>
      <ul className="mt-2 space-y-1 text-[0.7rem] text-[var(--cream)]">
        <li>Plain · Elaichi · Specials</li>
        {biscuits ? <li>Biscuits add-on</li> : null}
        {samosa ? <li>Crispy Samosa</li> : null}
        {pakoda ? <li>Hot Pakoda</li> : null}
      </ul>
    </div>
  )
}

function StreetBackdrop() {
  return (
    <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4a2c0f" />
          <stop offset="100%" stopColor="#1a0a00" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#sky)" />
      <rect x="20" y="120" width="360" height="40" fill="#3d2814" opacity="0.6" />
      <rect x="260" y="70" width="50" height="90" fill="#5c3b1b" opacity="0.5" />
      <rect x="80" y="85" width="70" height="75" fill="#6b4423" opacity="0.45" />
      <circle cx="320" cy="40" r="18" fill="#f5c842" opacity="0.25" />
    </svg>
  )
}
