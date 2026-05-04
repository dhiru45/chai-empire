import { memo } from 'react'
import type { GameEvent } from '../game/types'
import { eventMultiplierSummary } from '../game/economy'

type Props = {
  event: GameEvent | null
}

export const EventBanner = memo(function EventBanner({ event }: Props) {
  if (!event || event.remainingMs <= 0) return null
  const sec = (event.remainingMs / 1000).toFixed(0)
  const detail = eventMultiplierSummary(event)
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--gold)]/50 bg-gradient-to-r from-[#3a1f00] to-[#2d1200] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{event.icon}</span>
        <div>
          <p className="font-semibold text-[var(--gold)]">{event.name}</p>
          <p className="text-xs text-[var(--cream)]">{detail}</p>
        </div>
      </div>
      <p className="text-sm font-mono text-[var(--orange)]">{sec}s</p>
    </div>
  )
})
