import { memo } from 'react'
import type { Order } from '../game/types'
import { formatOrderLabel } from '../game/economy'

type Props = {
  order: Order
  payout: number
  canServe: boolean
  onServe: (id: string) => void
}

export const OrderCard = memo(
  function OrderCard({ order, payout, canServe, onServe }: Props) {
    const { title, subtitle } = formatOrderLabel(order)
    const ratio = order.timeLimit > 0 ? order.timer / order.timeLimit : 0
    const urgent = ratio < 0.3
    const disabled = !canServe

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onServe(order.id)}
        className={`flex w-full min-h-[44px] flex-col gap-2 rounded-xl border border-[var(--brown)] bg-[var(--bg-card)] p-3 text-left transition hover:border-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50 ${
          urgent ? 'urgent-pulse border-[var(--red)]' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-[var(--cream)]">{title}</p>
            <p className="text-xs text-[var(--muted)]">{subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[var(--gold)]">₹{payout}</p>
            {order.vipMultiplier ? (
              <p className="text-[0.65rem] text-[var(--gold)]">VIP ×{order.vipMultiplier}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--muted)]">Timer</span>
          <span className={urgent ? 'font-semibold text-[var(--red)]' : 'text-[var(--cream)]'}>
            {order.timer.toFixed(1)}s
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-black/40">
          <div
            className={`h-full rounded-full ${urgent ? 'bg-[var(--red)]' : 'bg-[var(--green)]'}`}
            style={{ width: `${Math.max(0, Math.min(100, ratio * 100))}%` }}
          />
        </div>
      </button>
    )
  },
  (prev, next) =>
    prev.order.id === next.order.id &&
    Math.abs(prev.order.timer - next.order.timer) < 0.09 &&
    prev.canServe === next.canServe &&
    prev.payout === next.payout &&
    prev.order.vipMultiplier === next.order.vipMultiplier,
)
